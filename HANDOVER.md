# London Reporting House — Slide Deck App: Technical Handover

## 1. Current Architecture

- **Framework**: TanStack Start v1 (React 19 + Vite 7), file-based routing under `src/routes/`.
- **SSR target**: Cloudflare Worker runtime (`@cloudflare/vite-plugin`, `wrangler.jsonc`). `nodejs_compat` is required.
- **Styling**: Tailwind CSS v4 via `@tailwindcss/vite`, theme tokens in `src/styles.css`.
- **UI primitives**: shadcn/ui components in `src/components/ui/*` (Radix-based).
- **State**: Local React state + a custom `EditorProvider` context for slide overrides; TanStack React Query is installed but not wired to a query client at the moment.
- **Backend**: Lovable Cloud (Supabase). Two surfaces:
  - `createServerFn` for app-internal RPC (`src/server/*.functions.ts`)
  - Server-only helpers in `src/server/*.server.ts` (parsers; not bundled to the client)
- **Auth**: Supabase Auth, anonymous sign-in on first load; per-user RLS.
- **Domain features**:
  - **LRH deck** — six hand-built React slide components (`Title/Problem/Solution/Competition/Story/Pipeline`).
  - **Imported deck** — user-uploaded `.pdf` / `.pptx`, parsed server-side, persisted, rendered through `ImportedSlide`.
  - **Slide editor** — inline edits (text/bullets/highlight keyword/layout) stored as `slide_overrides` per `(deckKind, slideKey)`; debounced autosave; Cmd/Ctrl+Enter to commit, Esc to cancel.
  - **PDF export** via `ExportPdfButton`.

```
src/
  routes/
    __root.tsx           # shell
    index.tsx            # main deck page (auth bootstrap + mode toggle)
  components/slides/     # slide components, deck shell, editor/
  server/
    imports.functions.ts   # parseAndSaveDeck / getLatestImportedDeck / deleteImportedDeck
    imports.server.ts      # parsePptx / parsePdf (pure, server-only)
    overrides.functions.ts # listOverrides / upsertOverride / resetOverride
  integrations/supabase/
    client.ts            # browser client (auto-generated)
    client.server.ts     # admin client (service role) — not currently used
    auth-middleware.ts   # requireSupabaseAuth for createServerFn
    install-fetch-auth.ts# global window.fetch wrapper for _serverFn auth
    types.ts             # generated DB types
```

## 2. Supabase Resources

### Tables (schema `public`)

**`imported_decks`**
- `id uuid pk default gen_random_uuid()`
- `user_id uuid not null` (no FK to `auth.users` by design)
- `name text not null`
- `source_type text not null` (`'pdf' | 'pptx'`)
- `created_at timestamptz not null default now()`
- RLS: enabled. Owner-only `SELECT`/`INSERT`/`DELETE` via `auth.uid() = user_id`. **No `UPDATE` policy.**

**`imported_slides`**
- `id uuid pk default gen_random_uuid()`
- `deck_id uuid not null`
- `index int not null`
- `title text`
- `bullets jsonb not null default '[]'`
- `image_urls jsonb not null default '[]'`
- `notes text`
- RLS: owner-only `SELECT`/`INSERT`/`DELETE` via `EXISTS (imported_decks d WHERE d.id = deck_id AND d.user_id = auth.uid())`. **No `UPDATE` policy.** No DB-level FK on `deck_id` (cascade is application-managed).

**`slide_overrides`**
- `id uuid pk default gen_random_uuid()`
- `user_id uuid not null`
- `deck_kind text not null` (`'lrh' | 'imported'`)
- `slide_key text not null`
- `blocks jsonb not null default '[]'`
- `highlight_keyword text`
- `layout_variant text`
- `created_at`, `updated_at timestamptz not null default now()`
- Unique: `(user_id, deck_kind, slide_key)` (used by `upsert onConflict`).
- RLS: owner-only `SELECT`/`INSERT`/`UPDATE`/`DELETE`.

### DB functions / triggers

- Function `public.touch_updated_at()` exists (sets `NEW.updated_at = now()`) but **no trigger is currently bound to it**. `slide_overrides.updated_at` is therefore not auto-bumped on update.

### Storage

- Bucket **`imported-deck-media`** — public read.
- Layout: `{user_id}/{deck_id}/slide{idx}_img{j}.{ext}`.
- Inserts/deletes happen via the user's authenticated client; no explicit storage RLS policies are documented here — verify in Cloud → Storage → Policies before going live.

### Edge functions

- **None.** All server-side logic uses TanStack `createServerFn`. Do not migrate this to Supabase Edge Functions.

### Auth assumptions

- **Anonymous sign-in is required and must be enabled** in Cloud → Users → Auth settings. The app calls `supabase.auth.signInAnonymously()` on first load if no session exists; failure surfaces an inline error message.
- No email confirmation flow, no Google OAuth, no signup forms — single-screen app.
- Bearer token is attached to every `_serverFn` request by the global fetch wrapper (see §5).
- `requireSupabaseAuth` middleware validates the bearer token via `supabase.auth.getClaims(token)`; rejects requests with no/invalid header.

## 3. Environment Variables

Auto-managed by Lovable Cloud via `.env` (do not edit by hand):

| Var | Scope | Purpose |
|---|---|---|
| `VITE_SUPABASE_URL` | client+server | Supabase project URL |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | client+server | Anon/publishable key for browser client |
| `VITE_SUPABASE_PROJECT_ID` | client | Project ref |
| `SUPABASE_URL` | server | Same URL, server-side |
| `SUPABASE_PUBLISHABLE_KEY` | server | Used by `requireSupabaseAuth` |
| `SUPABASE_SERVICE_ROLE_KEY` | server (secret) | For `client.server.ts` admin client (not currently invoked) |
| `SUPABASE_DB_URL` | tooling | Direct DB connection (migrations) |
| `LOVABLE_API_KEY` | server | Lovable AI Gateway (not used by current code) |

For self-hosted deploys (Vercel/GH), all `VITE_*` and `SUPABASE_*` vars must be set in the host's environment.

## 4. Server Functions

All in `src/server/`, all guarded by `requireSupabaseAuth`, all input-validated with Zod.

**`overrides.functions.ts`**
- `listOverrides({ deckKind })` — returns all `slide_overrides` rows for the user/deck kind.
- `upsertOverride({ deckKind, slideKey, blocks, highlightKeyword?, layoutVariant? })` — upserts on `(user_id, deck_kind, slide_key)`. Validates blocks (max 50, position bounds, kind enum).
- `resetOverride({ deckKind, slideKey })` — deletes the override row.

**`imports.functions.ts`**
- `parseAndSaveDeck({ filename, mimeType, fileBase64 })` — accepts base64, detects pptx/pdf, parses via `imports.server.ts`, **deletes any existing decks for the user** (single-deck-per-user model), inserts new deck + slide rows, uploads PPTX images to Storage, returns `{ deckId, count }`.
- `getLatestImportedDeck()` — returns latest deck + ordered slides as `ImportedDeckDTO | null`.
- `deleteImportedDeck({ deckId })` — best-effort removes media folder, deletes deck row (slides removed by app, **not** DB cascade).

**`imports.server.ts` (pure helpers)**
- `parsePptx(bytes)` — unzips with `fflate`, regex-extracts text runs from `ppt/slides/slideN.xml`, follows `_rels/slideN.xml.rels` to pull `ppt/media/*` images, parses notes from `ppt/notesSlides/*`.
- `parsePdf(bytes)` — uses `unpdf` (`getDocumentProxy` + `extractText`) per page; first non-empty line = title, rest = bullets. **No image extraction for PDFs.**
- `mimeForExt(ext)` — extension → MIME mapping.

## 5. Global fetch / auth wrapper

`src/integrations/supabase/install-fetch-auth.ts` — installed once on client mount in `src/routes/index.tsx` via lazy `useEffect`. It wraps `window.fetch`; for any URL containing `/_serverFn/` it injects `Authorization: Bearer <access_token>` from the current Supabase session. This is required because TanStack's RPC client does not natively forward the Supabase bearer token, and `requireSupabaseAuth` rejects requests without it.

Failure modes to know:
- Wrapper installs after first render, but `EditorProvider` waits on `authReady` before firing server functions, so the race is benign.
- If anonymous sign-in is disabled, the wrapper attaches no token and every server fn returns 401.

## 6. Dependencies

Production deps of note (see `package.json` for full list):

- **TanStack**: `@tanstack/react-router`, `@tanstack/react-start`, `@tanstack/router-plugin`, `@tanstack/react-query` (installed, not wired up).
- **Supabase**: `@supabase/supabase-js`.
- **UI**: full `@radix-ui/*` set, `lucide-react`, `cmdk`, `sonner`, `vaul`, `embla-carousel-react`, `recharts`, `react-day-picker`, `react-hook-form`, `@hookform/resolvers`, `zod`, `class-variance-authority`, `tailwind-merge`, `tw-animate-css`.
- **Styling**: `tailwindcss@^4`, `@tailwindcss/vite`.
- **Build**: `vite@^7`, `@cloudflare/vite-plugin`, `vite-tsconfig-paths`, `@vitejs/plugin-react`.

**Why `fflate` and `unpdf`?**
- Both are pure-JS, Worker-safe (no native bindings, no `child_process`, no `sharp`). They are the only PPTX/PDF parsers in our stack that work inside the Cloudflare Worker SSR runtime where `parseAndSaveDeck` runs.
- `fflate` — unzips the PPTX archive (a PPTX is a ZIP of XML + media). We then regex-parse `slideN.xml` for text/images.
- `unpdf` — extracts per-page text from PDFs using a Worker-compatible build of pdf.js. We use `getDocumentProxy` + `extractText({ mergePages: false })`.
- Alternatives considered and rejected: `pdf-parse`, `pdfjs-dist` (Node-only paths), `pptx2json` / `node-pptx` (require Node fs / native).

## 7. Known Technical Debt

1. **PPTX parsing is regex-based**, not a real OOXML parser — fragile against unusual slide masters, grouped shapes, slide layouts with non-standard placeholders, and right-to-left text.
2. **PDF imports are text-only** — no image extraction; bullet detection is naive (line splitting), no list/heading inference.
3. **Single imported deck per user** — `parseAndSaveDeck` deletes prior decks. No deck list UI.
4. **No DB foreign key** between `imported_slides.deck_id` and `imported_decks.id`. Orphan rows are possible if app-side delete is interrupted.
5. **No `UPDATE` RLS** on `imported_*` tables (intentional — re-upload replaces), but worth a note.
6. **`slide_overrides.updated_at` is not auto-updated** — `touch_updated_at()` exists but no trigger is bound.
7. **Anonymous-only auth** — sessions are tied to a single browser; clearing storage loses all user data permanently. No account upgrade path.
8. **Storage policies not codified in this repo** — only the bucket public-read flag is recorded; insert/select rules live in the Cloud UI.
9. **20 MB upload limit** is enforced client-side only; server doesn't re-check file size.
10. **base64 round-trip** of the upload doubles memory pressure on the Worker; large PPTX files may OOM.
11. **`fetch-auth` wrapper monkey-patches `window.fetch` globally** — any third-party SDK on the page that hits `/_serverFn/` will also have headers mutated (currently no such SDK).
12. **TanStack React Query is installed but unused.** Either wire it up or remove.
13. **No tests.** No unit/integration coverage for parsers, editor reducers, or server functions.
14. **No error boundary / retry UI** at the route level beyond the inline anonymous-auth message.
15. **Logo assets** (`src/assets/deck/logos/cba.jpg`, `td.jpg`) — confirm licensing before publishing.
16. **Deck content is hardcoded** in slide components — content edits require a code change.
17. **`ExportPdfButton` uses browser print** — output fidelity depends on the user's browser/print settings.
18. **`SlideDeck` regenerates the `slides` array on every change** to `mode/deck/handleUpload/authError`, which can re-mount slides; acceptable now but worth memoizing more carefully if slide count grows.

## 8. Recommended Production Hardening

**Backend / data**
- Add FK `imported_slides.deck_id → imported_decks.id ON DELETE CASCADE`.
- Bind `touch_updated_at()` as a `BEFORE UPDATE` trigger on `slide_overrides`.
- Add explicit Storage RLS policies for `imported-deck-media` (insert/select scoped to `auth.uid()` prefix) and codify them as a migration.
- Server-side validate file size and MIME (don't trust client `mimeType`).
- Cap PPTX media count and total bytes; reject pathological archives (zip-bomb guard).
- Sanitise extracted text (strip control chars, normalise unicode).
- Add a unique index on `(user_id)` in `imported_decks` if single-deck-per-user is the permanent model — or remove that assumption and add a deck list.

**Auth**
- Decide: keep anonymous-only or add real auth (email/Google). If keeping anonymous, surface a "your data lives in this browser only" warning in UI.
- Consider an "upgrade anonymous → permanent" flow (`linkIdentity`).

**App**
- Wire up `QueryClientProvider` so deck/overrides fetching is cacheable and refetchable; or strip `react-query`.
- Replace `window.fetch` monkey-patch with a TanStack server-fn middleware-based token forwarder if/when supported.
- Add error boundaries (`errorComponent` on the index route, `defaultErrorComponent` on the router).
- Add structured logging instead of `console.error`.
- Add request-id propagation to server functions.
- Add Sentry (or similar) for client + Worker error reporting.
- Add tests: parser fixtures (one PPTX, one PDF), `upsertOverride` schema validation, an editor reducer test.
- Run `bunx tsc --noEmit` + `eslint` in CI.
- Run the Supabase linter before each release.
- Set `Content-Security-Policy`, `X-Frame-Options`, `Referrer-Policy` headers via Worker response middleware.

**Performance / cost**
- Stream uploads instead of base64 (multipart `Request`).
- Compress images before storing.
- Add a max-slides cap (e.g. 200).

## 9. Deployment Checklist

### A. Move to GitHub
1. Confirm `.env` is in `.gitignore` (Lovable manages it locally; never commit).
2. Confirm no secrets are hardcoded (`rg "service_role|SERVICE_ROLE"`).
3. Push the repo. Enable branch protection on `main`.
4. Add a CI workflow:
   - `bun install --frozen-lockfile`
   - `bunx tsc --noEmit`
   - `bun run lint`
   - `bun run build`

### B. Supabase (Lovable Cloud → standalone, if needed)
> If you stay on Lovable Cloud, skip this section — the project is already wired.
1. Create a new Supabase project; capture URL, anon key, service role.
2. Apply schema migrations for `imported_decks`, `imported_slides`, `slide_overrides` (and the recommended FK + trigger from §8).
3. Re-create RLS policies listed in §2.
4. Create the `imported-deck-media` Storage bucket (public read) and add per-user prefix RLS policies.
5. **Enable Anonymous Sign-Ins** under Authentication → Providers (or replace with email/Google — see §8).
6. Configure Site URL and additional Redirect URLs to match your production domain.

### C. Vercel
1. Import the GitHub repo. Framework preset: **Other** (Vite). Build command: `bun run build`.
2. **Important**: this project is configured for the Cloudflare Worker runtime via `@cloudflare/vite-plugin` and `wrangler.jsonc`. To deploy to Vercel you must either:
   - **Option A (recommended)**: deploy to Cloudflare Workers using `wrangler deploy` — this matches dev/preview behaviour exactly.
   - **Option B**: switch the SSR target to Vercel by replacing `@cloudflare/vite-plugin` with the TanStack Start Vercel preset, removing `wrangler.jsonc`, and re-testing all server functions (parsers may still work; verify in production logs).
3. Set environment variables in the host (Vercel/Cloudflare):
   - `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY`, `VITE_SUPABASE_PROJECT_ID`
   - `SUPABASE_URL`, `SUPABASE_PUBLISHABLE_KEY`, `SUPABASE_SERVICE_ROLE_KEY`
4. Set custom domain + TLS.
5. Smoke test: anonymous sign-in works, upload a small PPTX and a small PDF, verify slides render, verify editor saves, verify PDF export.
6. Watch SSR logs for `[unenv] not implemented` or `__dirname is not defined` — these would mean a dependency is incompatible with the chosen runtime.

### D. Pre-launch
- Run the Supabase linter.
- Run a security scan (RLS coverage, public buckets).
- Verify upload size limits server-side.
- Confirm logo/image licensing.
- Tag a release in Git.
