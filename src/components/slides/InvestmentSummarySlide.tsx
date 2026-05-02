import { GenericSlide } from "./editor/GenericSlide";
import type { Block } from "./editor/types";
import { SlideFooter } from "./SlideLayout";
import { SlideCard } from "./Card";

const useFunds = [
  { pct: "45%", label: "Engineering & Data", body: "Hiring senior engineers and data scientists to extend the platform." },
  { pct: "25%", label: "Sales & Onboarding", body: "Convert sandbox banks to paying clients and accelerate buyside coverage." },
  { pct: "20%", label: "Product Roadmap", body: "Build benchmarks, intraday repo, securities lending and TRS modules." },
  { pct: "10%", label: "G&A and Reserve", body: "Operations, compliance and prudent runway buffer." },
];

const PAD_X = 6.25;
const defaultBlocks: Block[] = [
  { id: "eyebrow", kind: "eyebrow", text: "Investment Ask · Summary", x: PAD_X, y: 6, w: 50, h: 3 },
  { id: "title", kind: "title", text: "Raising £1.5m", x: PAD_X, y: 11, w: 70, h: 10 },
  {
    id: "body",
    kind: "text",
    text: "18-month runway to deliver the product roadmap, acquire critical mass of global repo market data, and develop POC for a 'repo all-to-all' trading venue.",
    x: PAD_X,
    y: 22,
    w: 70,
    h: 8,
  },
  { id: "stats", kind: "region", regionId: "stats", x: PAD_X, y: 33, w: 38, h: 55 },
  { id: "funds", kind: "region", regionId: "funds", x: 48, y: 33, w: 100 - PAD_X - 48, h: 55 },
  { id: "footer", kind: "region", regionId: "footer", x: PAD_X, y: 92, w: 100 - 2 * PAD_X, h: 5 },
];

export function InvestmentSummarySlide() {
  const regions = {
    stats: (
      <div className="h-full grid grid-cols-2 gap-3 content-start">
        <SlideCard variant="soft" className="text-center py-6">
          <div className="text-[11px] uppercase tracking-[0.18em] text-foreground/55 mb-2">Round size</div>
          <div className="font-heading font-bold text-3xl text-[var(--lrh-deep-navy)]">£1.5m</div>
        </SlideCard>
        <SlideCard variant="soft" className="text-center py-6">
          <div className="text-[11px] uppercase tracking-[0.18em] text-foreground/55 mb-2">Runway</div>
          <div className="font-heading font-bold text-3xl text-[var(--lrh-deep-navy)]">18 mo</div>
        </SlideCard>
        <SlideCard variant="soft" className="text-center py-6">
          <div className="text-[11px] uppercase tracking-[0.18em] text-foreground/55 mb-2">Burn</div>
          <div className="font-heading font-bold text-3xl text-[var(--lrh-deep-navy)]">£85k/m</div>
        </SlideCard>
        <SlideCard variant="soft" className="text-center py-6">
          <div className="text-[11px] uppercase tracking-[0.18em] text-foreground/55 mb-2">Breakeven</div>
          <div className="font-heading font-bold text-3xl text-[var(--lrh-deep-navy)]">Q4 '26</div>
        </SlideCard>
      </div>
    ),
    funds: (
      <div className="h-full">
        <div className="text-xs uppercase tracking-[0.18em] text-[var(--lrh-blue)] font-medium mb-4">
          Use of Funds
        </div>
        <div className="space-y-3">
          {useFunds.map((u) => (
            <div key={u.label} className="grid grid-cols-[5rem_1fr] gap-4 items-start py-3 border-b border-border last:border-b-0">
              <div className="font-heading font-bold text-2xl text-[var(--lrh-blue)] leading-none">{u.pct}</div>
              <div>
                <div className="font-heading font-bold text-sm mb-1">{u.label}</div>
                <p className="text-xs text-foreground/70 leading-relaxed">{u.body}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    ),
    footer: <SlideFooter page={14} />,
  };
  return <GenericSlide slideId="investmentSummary" defaultBlocks={defaultBlocks} regions={regions} />;
}
