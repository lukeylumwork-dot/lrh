export type BlockKind =
  | "title"
  | "text"
  | "bullets"
  | "image"
  | "eyebrow"
  | "region";

export interface Block {
  id: string;
  kind: BlockKind;
  text?: string | null;
  bullets?: string[] | null;
  imageUrl?: string | null;
  /** For kind="region": named slot rendered from the slide's regions map. */
  regionId?: string;
  /** Position & size as percentages of the 1920×1080 slide. */
  x: number;
  y: number;
  w: number;
  h: number;
  hidden?: boolean;
  align?: "left" | "center" | "right";
}

export interface SlideOverride {
  deckKind: "lrh" | "imported";
  slideKey: string;
  blocks: Block[];
  highlightKeyword: string | null;
  layoutVariant: string | null;
}

export type DeckKind = "lrh" | "imported";
