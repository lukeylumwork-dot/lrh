# PDF-to-Slide Import Workflow

## Goal
Drop a multi-page PDF (e.g. the 38-page LRH deck) into the admin UI and get a fully-populated deck — one PNG per page, in order, ready to add hotspots and share.

## Approach: client-side rendering

PDF rasterization runs in the **browser**, not the server. Reasons:
- Cloudflare Workers can't run `sharp`, `canvas`, `pdfium`, or `poppler` (native binaries / Node-only).
- Browsers ship a working `<canvas>` and `pdfjs-dist` renders pages to it cleanly.
- Uploads go straight to Supabase Storage (the existing `interactive-deck-slides` bucket), so the server only does small metadata writes.

Flow:

```text
Admin picks PDF
  ↓ pdfjs-dist (browser)
Render page N → canvas → PNG blob (1920×1080 target, scaled to PDF aspect)
  ↓ supabase.storage.upload (signed via user session)
Public URL for each slide
  ↓ createServerFn: createDeckFromImages({ title, images: [{url, w, h}] })
INSERT decks row + INSERT deck_slides rows (variant="Light", slide_index=N)
  ↓
Redirect to /interactive-deck/admin/<deckId>
```

## Changes

### 1. New dependency
- `bun add pdfjs-dist` — pure-JS PDF renderer; works in browser.
- Configure the worker via `?url` import (Vite-friendly): `import workerSrc from "pdfjs-dist/build/pdf.worker.min.mjs?url"`.

### 2. New util: `src/lib/pdfToImages.ts` (browser-only)
- `renderPdfToPngBlobs(file: File, opts: { targetWidth?: number; onProgress?: (i, total) => void }): Promise<Blob[]>`
- Loads PDF, iterates pages, renders each to an offscreen canvas at `targetWidth` (default 1920), scaled by page aspect, exports `canvas.toBlob("image/png")`.
- Reports progress so the UI can show "Rendering page 7 / 38".

### 3. New server function in `src/server/interactiveDeck.functions.ts`
- `createDeckFromImages` (POST, auth-gated):
  - Input: `{ title: string, slides: Array<{ image_url: string, width: number, height: number }> }` (Zod, max 200 slides, title 1–200 chars).
  - Inserts a `decks` row owned by `userId`.
  - Bulk-inserts `deck_slides` with `variant="Light"`, `slide_index = i`.
  - Returns `{ deckId }`.
- Existing per-slide upload uses the user's authenticated browser client + the `interactive-deck-slides` bucket (already public, RLS already allows owner writes).

### 4. New UI: PDF import card on `/interactive-deck` (the admin index)
- Card titled **"Import from PDF"** with:
  - Title input (defaults to PDF filename without extension).
  - File picker accepting `application/pdf`.
  - Progress bar: "Rendering 7 / 38" → "Uploading 12 / 38" → "Saving deck…".
  - On completion: navigate to `/interactive-deck/admin/<deckId>`.
- All work runs client-side; on failure, show a toast and keep the PDF picker primed for retry.

### 5. Storage path convention
- `interactive-deck-slides/<userId>/<deckId>/<variant>/slide-<NN>.png` — but since we mint `deckId` only after slides exist, upload first to `…/<userId>/imports/<uuid>/slide-<NN>.png` and pass those URLs to `createDeckFromImages`. (Cleaner alternative: create the deck row first with title, then upload + insert slides — happy to switch if preferred.)

## Limits & guardrails
- Browser memory: 38 pages at 1920px is fine; we render serially (one canvas at a time) so peak memory stays low.
- Hard cap at 200 pages with a friendly error.
- File size: enforce ≤100 MB PDF in the picker (browser-side check).
- If a page fails to render, abort with a clear error pointing to the page number.

## Out of scope (for this task)
- Auto-detecting hotspots from PDF link annotations. (Easy follow-up: `pdfjs-dist` exposes link annotations per page — we could pre-create `open_url` hotspots from them.)
- Dark variant generation.
- Server-side rendering fallback (would require swapping runtime; not worth it).

## Files touched
- `package.json` (new dep)
- `src/lib/pdfToImages.ts` (new)
- `src/server/interactiveDeck.functions.ts` (add `createDeckFromImages`)
- `src/routes/interactive-deck.index.tsx` (add import card)
