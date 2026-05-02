## Goal

Add an "Import deck" mode that lets a user upload a PDF or PPTX, parses each slide into structured content (title, bullets, images), persists it to Lovable Cloud, and renders it inside the existing SlideDeck via a toggle between "LRH template" and "Imported deck".

## UX

- Top-right floating control on the deck with a segmented toggle: **LRH** | **Imported**.
- When "Imported" is selected and no deck exists yet, show an empty-state inside the slide canvas with an **Upload PDF / PPTX** button (drag-and-drop also accepted).
- After upload: progress indicator → parsed slides appear in the deck, navigable with the existing arrows / dots / keyboard.
- A small "Replace" / "Delete imported deck" action is available in the toggle area.
- Authenticated user: each user sees their own most-recent imported deck. (Anonymous users supported via Supabase anonymous sessions so no login wall.)

## Parsing strategy (Structured: text + images)

Each imported slide is normalized to:
```
{ index, title, bullets[], images[] (storage URLs), notes? }
```

Server-side parsing in a `createServerFn` handler:
- **PPTX**: unzip with `fflate`, read `ppt/slides/slideN.xml` and rels. Extract:
  - First `<a:t>` in the largest/title placeholder → `title`
  - Remaining `<a:p>` runs → `bullets`
  - `<a:blip r:embed="...">` → resolve via `ppt/slides/_rels/slideN.xml.rels` → upload referenced `ppt/media/*` to Storage → store public URL
- **PDF**: use `unpdf` (Worker-compatible, pure JS) to extract text per page. Heuristic: first non-empty line = title, remaining lines split on newlines/bullets = bullets. PDFs typically don't yield clean per-image extraction in a Worker runtime, so v1 imports PDF as text-only structured slides (no embedded images). This is called out in the empty-state copy.

Both libraries are pure JS / Worker-safe (no `sharp`, no `child_process`, no native bindings) — compatible with the Cloudflare Worker SSR runtime.

## Data model (Lovable Cloud / Supabase)

Migration adds:

- `imported_decks` table
  - `id uuid pk`, `user_id uuid` (nullable for anon, but defaulted to `auth.uid()`), `name text`, `source_type text` ('pdf'|'pptx'), `created_at timestamptz`
- `imported_slides` table
  - `id uuid pk`, `deck_id uuid fk`, `index int`, `title text`, `bullets jsonb`, `image_urls jsonb`, `notes text`
- Storage bucket `imported-deck-media` (public read), with insert/select RLS scoped to `auth.uid()`
- RLS on both tables: owner-only select/insert/delete (`user_id = auth.uid()`)
- `user_roles` is not needed here — pure per-user ownership

## Components

New:
- `src/components/slides/ImportedSlide.tsx` — renders one parsed slide using existing `SlideLayout`, `SlideTitle`, `Card`. Title + bullets on left, image grid on right (or stacked when no images).
- `src/components/slides/DeckModeToggle.tsx` — segmented control (LRH / Imported) with delete + re-upload actions.
- `src/components/slides/ImportEmptyState.tsx` — drag-and-drop area + file picker, progress + error states.

Modified:
- `src/components/slides/SlideDeck.tsx` — accepts an optional `header` slot for the toggle; otherwise unchanged.
- `src/routes/index.tsx` — holds mode state, fetches latest imported deck via server fn, switches the `slides` array between LRH components and `<ImportedSlide>` instances.

Server:
- `src/server/imports.functions.ts`
  - `parseAndSaveDeck({ fileBase64, filename, mimeType })` — runs in `createServerFn`, parses, uploads media to Storage, inserts deck + slides, returns `deckId`.
  - `getLatestImportedDeck()` — returns the user's most recent deck with slides ordered by `index`.
  - `deleteImportedDeck({ deckId })` — removes slides, media, deck row.
- `src/server/imports.server.ts` — pure parser helpers (`parsePptx`, `parsePdf`) kept out of client bundles.

Auth:
- On first load, if no Supabase session, sign in anonymously so per-user RLS works without forcing a login screen. (Anonymous users must be enabled in Auth settings — I'll mention this in the deliverable note.)

## Dependencies to add

- `fflate` — unzip PPTX in Worker runtime
- `unpdf` — pure-JS PDF text extraction, edge-compatible

Both are Worker-safe.

## Out of scope (v1)

- PDF image extraction (text-only for PDF imports)
- Editing imported slides inline (read-only render; user re-uploads to change)
- Speaker notes display (parsed and stored, but not rendered)
- Slide thumbnails sidebar

## Files touched

Created: `imported_decks` + `imported_slides` migration, storage bucket migration, `ImportedSlide.tsx`, `DeckModeToggle.tsx`, `ImportEmptyState.tsx`, `src/server/imports.functions.ts`, `src/server/imports.server.ts`
Modified: `src/components/slides/SlideDeck.tsx`, `src/routes/index.tsx`