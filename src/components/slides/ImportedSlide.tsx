import { SlideLayout } from "./SlideLayout";
import { EditableBlock } from "./editor/EditableBlock";
import { useEditor } from "./editor/EditorContext";
import type { Block } from "./editor/types";
import type { ImportedSlideDTO } from "@/server/imports.functions";

interface Props {
  slide: ImportedSlideDTO;
  total: number;
  deckId: string;
}

/** Build default editable blocks from a parsed imported slide. */
export function defaultBlocksForImported(slide: ImportedSlideDTO): Block[] {
  const blocks: Block[] = [];
  const hasImages = slide.image_urls.length > 0;
  const textW = hasImages ? 55 : 80;

  blocks.push({
    id: "eyebrow",
    kind: "eyebrow",
    text: `Imported · Slide ${slide.index + 1}`,
    x: 5,
    y: 6,
    w: 60,
    h: 4,
  });

  if (slide.title) {
    blocks.push({
      id: "title",
      kind: "title",
      text: slide.title,
      x: 5,
      y: 13,
      w: textW,
      h: 14,
    });
  }

  if (slide.bullets.length > 0) {
    blocks.push({
      id: "bullets",
      kind: "bullets",
      bullets: slide.bullets,
      x: 5,
      y: slide.title ? 30 : 14,
      w: textW,
      h: 60,
    });
  }

  slide.image_urls.forEach((url, i) => {
    const perRow = 1;
    const top = 13 + i * (60 / Math.max(slide.image_urls.length, 1));
    const h = Math.min(60 / Math.max(slide.image_urls.length, 1), 50);
    blocks.push({
      id: `image-${i}`,
      kind: "image",
      imageUrl: url,
      x: 63,
      y: top,
      w: 32,
      h,
    });
    void perRow;
  });

  return blocks;
}

export function ImportedSlide({ slide, total, deckId }: Props) {
  const { getOverride } = useEditor();
  const slideKey = `${deckId}:${slide.index}`;
  const defaults = { blocks: defaultBlocksForImported(slide) };
  const override = getOverride("imported", slideKey);
  const blocks = override?.blocks ?? defaults.blocks;
  const highlight = override?.highlightKeyword ?? null;

  return (
    <SlideLayout className="!p-0">
      <div className="absolute inset-0">
        {blocks.map((b) => (
          <EditableBlock
            key={b.id}
            deckKind="imported"
            slideKey={slideKey}
            block={b}
            defaults={defaults}
            highlight={highlight}
          />
        ))}
      </div>
      <div className="absolute bottom-3 right-6 text-[10px] uppercase tracking-[0.18em] text-foreground/40 z-0 pointer-events-none">
        {slide.index + 1} / {total}
      </div>
    </SlideLayout>
  );
}
