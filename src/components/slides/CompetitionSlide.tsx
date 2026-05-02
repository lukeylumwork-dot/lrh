import { GenericSlide } from "./editor/GenericSlide";
import type { Block } from "./editor/types";
import { SlideFooter } from "./SlideLayout";
import { SlideCard } from "./Card";
import { Check } from "lucide-react";

const competitors = [
  {
    name: "Venue Data",
    items: ["Timely but siloed", "Restricted to participants", "Limited OTC coverage"],
  },
  {
    name: "Regulatory / Public Data",
    items: ["Broad but retrospective", "High-level only", "Limited visibility into specials & haircuts"],
  },
  {
    name: "Broker Feeds",
    items: ["Valuable but proprietary", "Incomplete across venues", "Incomplete across counterparties"],
  },
];

const lrhEdge = [
  "Multi-party aggregated SFTR, including OTC",
  "Enrichment & quality checks",
  "GC vs. Specials classification",
  "Flows drill-downs",
  "Portfolio-level analytics",
];

const PAD_X = 6.25;
const defaultBlocks: Block[] = [
  { id: "eyebrow", kind: "eyebrow", text: "Competitor Landscape", x: PAD_X, y: 6, w: 50, h: 3 },
  { id: "title", kind: "title", text: "Competitor Landscape", x: PAD_X, y: 11, w: 70, h: 10 },
  { id: "lede", kind: "text", text: "LRH vs. market alternatives", x: PAD_X, y: 22, w: 70, h: 4 },
  { id: "competitors", kind: "region", regionId: "competitors", x: PAD_X, y: 30, w: 52, h: 60 },
  { id: "edge", kind: "region", regionId: "edge", x: 60, y: 30, w: 100 - 60 - PAD_X, h: 60 },
  { id: "footer", kind: "region", regionId: "footer", x: PAD_X, y: 92, w: 100 - 2 * PAD_X, h: 5 },
];

export function CompetitionSlide() {
  const regions = {
    competitors: (
      <div className="grid grid-cols-3 gap-4 h-full">
        {competitors.map((c) => (
          <SlideCard key={c.name} className="flex flex-col">
            <h3 className="font-heading font-bold text-sm uppercase tracking-wide text-foreground/70 mb-3 pb-3 border-b border-border">
              {c.name}
            </h3>
            <ul className="space-y-2 text-sm text-foreground/80">
              {c.items.map((i) => (
                <li key={i}>· {i}</li>
              ))}
            </ul>
          </SlideCard>
        ))}
      </div>
    ),
    edge: (
      <SlideCard
        variant="soft"
        className="h-full bg-[var(--lrh-navy-900)] border-[var(--lrh-navy-900)] text-white"
      >
        <div className="flex items-center gap-2 mb-4">
          <span className="font-heading font-bold text-base text-[var(--lrh-blue-500)]">LRH</span>
          <span className="text-xs uppercase tracking-[0.18em] text-white/60">The Edge</span>
        </div>
        <ul className="space-y-3">
          {lrhEdge.map((e) => (
            <li key={e} className="flex gap-3 items-start text-sm">
              <span className="mt-0.5 flex-shrink-0 h-5 w-5 rounded-full bg-[var(--lrh-blue-500)] flex items-center justify-center">
                <Check size={12} strokeWidth={3} />
              </span>
              <span>{e}</span>
            </li>
          ))}
        </ul>
        <p className="mt-5 pt-4 border-t border-white/10 text-xs text-white/50 italic">
          See appendix for detailed competitor analysis (S&amp;P, DTCC, others).
        </p>
      </SlideCard>
    ),
    footer: <SlideFooter page={5} />,
  };
  return (
    <GenericSlide slideId="competition" defaultBlocks={defaultBlocks} regions={regions} />
  );
}
