import type { LucideIcon } from "lucide-react";
import { Hourglass, EyeOff, PoundSterling, TrendingDown } from "lucide-react";
import { GenericSlide } from "./editor/GenericSlide";
import type { Block } from "./editor/types";
import { SlideFooter } from "./SlideLayout";

interface CardItem {
  icon: LucideIcon;
  title: string;
  body: string;
}

const items: CardItem[] = [
  {
    icon: Hourglass,
    title: "Sparse & Delayed Data",
    body: "Existing sources offer only high-level metrics, such as weighted averages, and are often delayed.",
  },
  {
    icon: EyeOff,
    title: "Limited Transparency",
    body: "No single, detailed golden source aggregates real transaction data across venues and counterparties.",
  },
  {
    icon: PoundSterling,
    title: "High Cost",
    body: "Available data is often costly and incomplete.",
  },
  {
    icon: TrendingDown,
    title: "Lower Market Efficiency",
    body: "Lack of transparency reduces trading efficiency and impedes risk management and compliance.",
  },
];

// ---------------------------------------------------------------------------
// Layout constants (all values are percentages of the 1920×1080 reference slide,
// derived from the original gap-5 grid so the initial render matches the
// previous single-region "cards" layout exactly).
// ---------------------------------------------------------------------------
const PAD_X = 6.25; // slide left/right padding
const CARDS_Y = 42; // cards area start (% from slide top)

// 2-column, 2-row card grid with Tailwind gap-5 (20px at 16px base)
const CARD_W = 43.23; // (1680 - 20) / 2 / 1920 * 100
const CARD_H = 21.57; // (486  - 20) / 2 / 1080 * 100
const CARD_GAP_X = 1.04; // 20 / 1920 * 100
const CARD_GAP_Y = 1.85; // 20 / 1080 * 100

// Inner card padding (p-6 = 24px)
const CARD_PAD_X = 1.25; // 24 / 1920 * 100
const CARD_PAD_Y = 2.22; // 24 / 1080 * 100

// Icon block (h-14 w-14 = 56px)
const ICON_W = 2.92; // 56 / 1920 * 100
const ICON_H = 5.19; // 56 / 1080 * 100
const ICON_GAP = 1.04; // gap-5 between icon and text column

// Text column metrics
const TEXT_X_OFF = CARD_PAD_X + ICON_W + ICON_GAP; // 5.21 from card left edge
const TEXT_W = CARD_W - TEXT_X_OFF - CARD_PAD_X; // 36.77

// Title block height (text-lg bold ≈ 25px, mb-2 ≈ 8px → ~3.0%)
const TITLE_H = 3.2;
// Gap between title bottom and body top (mb-2 = 8px → 0.74%)
const TITLE_MB = 0.74;

// Card grid positions [col-0, col-1] and [row-0, row-1]
const COL_X = [PAD_X, PAD_X + CARD_W + CARD_GAP_X] as const; // [6.25, 50.52]
const ROW_Y = [CARDS_Y, CARDS_Y + CARD_H + CARD_GAP_Y] as const; // [42.00, 65.42]

// Map card index (0-3) to (col, row): 0=TL, 1=TR, 2=BL, 3=BR
const cardOrigin = (i: number) => ({
  x: COL_X[i % 2],
  y: ROW_Y[Math.floor(i / 2)],
});

// ---------------------------------------------------------------------------
// Default blocks — generated from the items array so positions stay in sync.
// ---------------------------------------------------------------------------
const defaultBlocks: Block[] = [
  // Slide header
  { id: "eyebrow", kind: "eyebrow", text: "The Problem", x: PAD_X, y: 6, w: 50, h: 3 },
  {
    id: "title",
    kind: "title",
    text: "No Market in Repo Market Data",
    x: PAD_X,
    y: 11,
    w: 70,
    h: 12,
  },
  {
    id: "body",
    kind: "text",
    text: "The repo market is highly opaque and fragmented, lacking a unified, timely, or detailed data source. Unlike exchange-traded markets, repo transactions occur across multiple venues and bilateral channels.",
    x: PAD_X,
    y: 25,
    w: 70,
    h: 12,
  },

  // Four cards — each broken into: container (card kind), icon, title, body
  ...items.flatMap((item, i) => {
    const n = i + 1;
    const { x, y } = cardOrigin(i);
    const titleY = y + CARD_PAD_Y;
    const bodyY = titleY + TITLE_H + TITLE_MB;
    const bodyH = CARD_H - CARD_PAD_Y - TITLE_H - TITLE_MB - CARD_PAD_Y;
    return [
      // Card background — uses the "card" kind so block.style overrides work directly
      {
        id: `card-container-${n}`,
        kind: "card" as const,
        x,
        y,
        w: CARD_W,
        h: CARD_H,
      },
      // Icon region — fills the block bounds, centered
      {
        id: `icon-${n}`,
        kind: "region" as const,
        regionId: `icon-${n}`,
        x: x + CARD_PAD_X,
        y: y + CARD_PAD_Y,
        w: ICON_W,
        h: ICON_H,
      },
      // Card title (independently editable)
      {
        id: `card-title-${n}`,
        kind: "text" as const,
        text: item.title,
        x: x + TEXT_X_OFF,
        y: titleY,
        w: TEXT_W,
        h: TITLE_H,
        fontWeight: 700,
        fontSize: 18,
      },
      // Card body (independently editable)
      {
        id: `card-body-${n}`,
        kind: "text" as const,
        text: item.body,
        x: x + TEXT_X_OFF,
        y: bodyY,
        w: TEXT_W,
        h: bodyH,
        fontSize: 14,
      },
    ] satisfies Block[];
  }),

  // Footer
  {
    id: "footer",
    kind: "region",
    regionId: "footer",
    x: PAD_X,
    y: 92,
    w: 100 - 2 * PAD_X,
    h: 5,
  },
];

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
export function ProblemSlide() {
  const regions: Record<string, React.ReactNode> = {
    footer: <SlideFooter page={3} />,
  };

  items.forEach((item, i) => {
    const n = i + 1;
    const Icon = item.icon;
    // Icon — fills the block bounds, centered
    regions[`icon-${n}`] = (
      <div className="w-full h-full flex items-center justify-center rounded-md bg-[var(--lrh-blue)] text-white">
        <Icon size={24} strokeWidth={1.75} />
      </div>
    );
  });

  return (
    <GenericSlide slideId="problem" defaultBlocks={defaultBlocks} regions={regions} />
  );
}
