import { type ReactNode, useMemo } from "react";
import { SlideLayout } from "../SlideLayout";
import { useEditor } from "./EditorContext";
import { EditableBlock, PeersProvider } from "./EditableBlock";
import type { Block } from "./types";
import { useSlideKeyword } from "../Highlighted";

interface GenericSlideProps {
  /** Stable slide identifier used for override persistence. */
  slideId: string;
  /** Default block layout — used when no override exists. */
  defaultBlocks: Block[];
  /** Map of region ids → JSX rendered inside `region` blocks. */
  regions: Record<string, ReactNode>;
  /** Optional dark-navy section style. */
  dark?: boolean;
  /** Disable institutional padding. */
  bleed?: boolean;
}

/**
 * Composer that turns a slide into a free-positionable canvas of blocks.
 * The visuals of each region remain owned by the slide's React component;
 * only the bounding boxes (position + size) become user-editable and
 * persisted as overrides keyed by `slideId`.
 */
export function GenericSlide({
  slideId,
  defaultBlocks,
  regions,
  dark = false,
  bleed = false,
}: GenericSlideProps) {
  const { getOverride } = useEditor();
  const { keyword } = useSlideKeyword();

  const override = getOverride("lrh", slideId);
  const blocks = override?.blocks ?? defaultBlocks;
  const defaults = useMemo(() => ({ blocks: defaultBlocks }), [defaultBlocks]);
  const renderRegion = (id: string) => regions[id] ?? null;

  return (
    <SlideLayout dark={dark} bleed={bleed} className="!p-0">
      <div className="absolute inset-0">
        <PeersProvider blocks={blocks} renderRegion={renderRegion}>
          {blocks.map((b) => (
            <EditableBlock
              key={b.id}
              deckKind="lrh"
              slideKey={slideId}
              block={b}
              defaults={defaults}
              highlight={keyword}
            />
          ))}
        </PeersProvider>
      </div>
    </SlideLayout>
  );
}
