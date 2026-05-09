## Slide-master architecture

Treat uploaded PNGs as locked visual masters. The platform only adds interactive layers on top, and brand assets stay in platform chrome — never injected into slide bodies.

### 1. Strip injected logos from React-coded slides

These changes keep the React deck working but remove logos that were stamped into slide bodies (per the new rule):

- `src/components/slides/SlideLayout.tsx` — remove the `<img src={assets.brand.lettermarkTransparent} />` from `SlideFooter`. Footer keeps the copyright text and page counter only.
- `src/components/slides/TitleSlide.tsx` — remove the LRH primary-logo `<img>` from the `hero` region. Replace with a neutral typographic mark or leave the region empty (text headline already conveys the brand).
- `src/components/slides/assets.ts` — keep entries; they remain in use for platform chrome.

No other React slide files are touched.

### 2. Reserve brand assets for platform chrome only

Allowed usages of `assets.brand.*` going forward:
- toolbar / header in `interactive-deck.admin.$deckId.tsx` and `/interactive-deck/$deckId`
- loading screens and the admin dashboard (`interactive-deck.index.tsx`)
- modal headers (`HotspotModal.tsx`)
- hotspot indicators / favicon
- nothing inside any rendered slide body

Add a small `<BrandHeader />` component used by the admin and viewer routes so the LRH lettermark lives in app chrome, not in slides.

### 3. Upload pipeline: preserve order, auto-name, allow rename

Update `handleUpload` in `src/routes/interactive-deck.admin.$deckId.tsx`:

1. **Preserve order** — sort `files` by filename ascending before iterating (current code already iterates in `FileList` order; we make it explicit and stable). Continue numbering from `startIndex` so batch 2 of 10 picks up where batch 1 ended.
2. **Per-file pipeline** for each PNG:
   - Upload to storage (existing code).
   - Insert deck slide (existing code).
   - Call a new server fn `extractSlideTitle({ slideId, imageUrl })` that runs Lovable AI vision (`google/gemini-3-flash-preview`) with a tight prompt: *"Read only the largest headline text on this slide. Reply with the cleaned title in Title Case, max 6 words, no punctuation. If no headline, reply 'Untitled'."* Then format as `${pad2(slide_index+1)} ${title}` and `renameSlide` it.
   - Show a per-slide status row in the upload toast / progress strip ("3 / 10 — naming…").
3. **Manual rename later** — already supported (`renameSlide` server fn). Surface the slide labels in `SlidesList` thumbnails (currently it only shows the index) with an inline-editable `<Input>` underneath each thumbnail, debounced to call `renameSlide`.
4. **Numbering invariants** — keep `slide_index` as the single source of truth for order. Reorder still works via existing `reorderSlides`. The 2-digit prefix in the label is auto-regenerated when the user calls a new "Renumber labels" action (button in admin toolbar).

### 4. Server function additions

In `src/server/interactiveDeck.functions.ts`:

```text
extractSlideTitle({ slideId, imageUrl })
  - calls Lovable AI Gateway with vision input
  - on success, updates deck_slides.label to "NN Title"
  - returns { label }
```

Plus a small `renumberDeckLabels({ deckId, variant })` helper that walks slides in `slide_index` order and rewrites the `NN ` prefix on each label, preserving the user-edited title portion.

No DB migration needed — `deck_slides.label` already exists.

### 5. Quality / responsiveness

- Keep the existing 1920×1080 quality check on uploads (`src/lib/slideQualityCheck.ts`); flag anything off-spec but don't auto-resize.
- `DeckViewer` continues to render slides at native aspect ratio with hotspots in % coordinates — no changes to interaction stability.
- AI title extraction failures (rate limit / 402 / network) fall back to `${pad2(idx)} Slide` so the upload never blocks.

### 6. What stays untouched

- `deck_slides`, `hotspots`, `decks` schemas
- `DeckViewer`, `Hotspot`, `HotspotModal` interaction model
- Public `/deck/$deckId` viewer
- The PDF-import review flow on `interactive-deck.index.tsx` (it already treats pages as masters)

### Technical notes

- Vision call uses `LOVABLE_API_KEY` server-side; image is passed as a public URL (slides are in a public bucket).
- Title extraction runs sequentially per slide with a 250 ms delay to stay under the gateway rate limit on a 10-file batch.
- The `02 Title` formatting uses `String(i+1).padStart(2,'0')`.
- All chrome-vs-slide logo usage is enforced by removing logo imports from the slide files in step 1; future slides have no path to inject them.
