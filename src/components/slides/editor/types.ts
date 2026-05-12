export type BlockKind = "title" | "text" | "bullets" | "image" | "eyebrow" | "region" | "card";

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
  // --- Optional style overrides (safe-default: undefined = use class-based defaults) ---
  fontFamily?: string;
  /** Font size in CSS px units. Overrides class-based font sizing. */
  fontSize?: number;
  /** CSS font-weight value (e.g. 400, 700, "bold"). */
  fontWeight?: string | number;
  lineHeight?: number | string;
  letterSpacing?: string;
  /** CSS color value for text. */
  color?: string;
  /** CSS color value for block background. */
  backgroundColor?: string;
  /** CSS color value for block border. Also enables a 1px solid border. */
  borderColor?: string;
  /** Border radius in px. */
  borderRadius?: number;
  /** Uniform padding in px applied to the block container. */
  padding?: number;
  /** Opacity from 0 to 1. */
  opacity?: number;
  zIndex?: number;
}

export interface SlideOverride {
  deckKind: "lrh" | "imported";
  slideKey: string;
  blocks: Block[];
  highlightKeyword: string | null;
  layoutVariant: string | null;
}

export type DeckKind = "lrh" | "imported";
