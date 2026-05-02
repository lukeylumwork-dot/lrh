import { SlideLayout, SlideTitle, SlideEyebrow, SlideFooter } from "./SlideLayout";
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

export function CompetitionSlide() {
  return (
    <SlideLayout>
      <SlideEyebrow>Competitor Landscape</SlideEyebrow>
      <div className="space-y-2 mb-8">
        <SlideTitle highlight="Landscape" highlightPosition="after">Competitor</SlideTitle>
        <p className="text-sm text-foreground/60">LRH vs. market alternatives</p>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-5 min-h-0">
        <div className="lg:col-span-7 grid grid-cols-1 md:grid-cols-3 gap-4">
          {competitors.map((c) => (
            <SlideCard key={c.name} className="flex flex-col">
              <h3 className="font-heading font-bold text-sm uppercase tracking-wide text-foreground/70 mb-3 pb-3 border-b border-border">
                {c.name}
              </h3>
              <ul className="space-y-2 text-sm text-foreground/80">
                {c.items.map((i) => <li key={i}>· {i}</li>)}
              </ul>
            </SlideCard>
          ))}
        </div>

        <div className="lg:col-span-5">
          <SlideCard variant="soft" className="h-full bg-[var(--lrh-deep-navy)] border-[var(--lrh-deep-navy)] text-white">
            <div className="flex items-center gap-2 mb-4">
              <span className="font-heading font-bold text-base text-[var(--lrh-blue)]">LRH</span>
              <span className="text-xs uppercase tracking-[0.18em] text-white/60">The Edge</span>
            </div>
            <ul className="space-y-3">
              {lrhEdge.map((e) => (
                <li key={e} className="flex gap-3 items-start text-sm">
                  <span className="mt-0.5 flex-shrink-0 h-5 w-5 rounded-full bg-[var(--lrh-blue)] flex items-center justify-center">
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
        </div>
      </div>

      <SlideFooter page={5} />
    </SlideLayout>
  );
}
