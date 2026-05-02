import { GenericSlide } from "./editor/GenericSlide";
import type { Block } from "./editor/types";
import { SlideFooter } from "./SlideLayout";
import { SlideCard } from "./Card";
import { IconPlaceholder } from "./IconPlaceholder";
import { Hourglass, EyeOff, PoundSterling, TrendingDown } from "lucide-react";

const items = [
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

const PAD_X = 6.25;
const defaultBlocks: Block[] = [
  { id: "eyebrow", kind: "eyebrow", text: "The Problem", x: PAD_X, y: 6, w: 50, h: 3 },
  { id: "title", kind: "title", text: "No Market in Repo Market Data", x: PAD_X, y: 11, w: 70, h: 12 },
  {
    id: "body",
    kind: "text",
    text: "The repo market is highly opaque and fragmented, lacking a unified, timely, or detailed data source. Unlike exchange-traded markets, repo transactions occur across multiple venues and bilateral channels.",
    x: PAD_X,
    y: 25,
    w: 70,
    h: 12,
  },
  { id: "cards", kind: "region", regionId: "cards", x: PAD_X, y: 42, w: 100 - 2 * PAD_X, h: 45 },
  { id: "footer", kind: "region", regionId: "footer", x: PAD_X, y: 92, w: 100 - 2 * PAD_X, h: 5 },
];

export function ProblemSlide() {
  const regions = {
    cards: (
      <div className="grid grid-cols-2 gap-5 h-full">
        {items.map((item) => (
          <SlideCard key={item.title} className="flex gap-5 items-start">
            <IconPlaceholder icon={item.icon} size="md" />
            <div className="flex-1">
              <h3 className="font-heading font-bold text-lg mb-2">
                {item.title}
              </h3>
              <p className="text-sm text-foreground/70 leading-relaxed">
                {item.body}
              </p>
            </div>
          </SlideCard>
        ))}
      </div>
    ),
    footer: <SlideFooter page={3} />,
  };
  return (
    <GenericSlide slideId="problem" defaultBlocks={defaultBlocks} regions={regions} />
  );
}
