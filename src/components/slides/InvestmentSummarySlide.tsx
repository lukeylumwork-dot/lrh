import { SlideLayout, SlideTitle, SlideEyebrow, SlideFooter } from "./SlideLayout";
import { SlideCard } from "./Card";

const useFunds = [
  { pct: "45%", label: "Engineering & Data", body: "Hiring senior engineers and data scientists to extend the platform." },
  { pct: "25%", label: "Sales & Onboarding", body: "Convert sandbox banks to paying clients and accelerate buyside coverage." },
  { pct: "20%", label: "Product Roadmap", body: "Build benchmarks, intraday repo, securities lending and TRS modules." },
  { pct: "10%", label: "G&A and Reserve", body: "Operations, compliance and prudent runway buffer." },
];

export function InvestmentSummarySlide() {
  return (
    <SlideLayout>
      <SlideEyebrow>Investment Ask · Summary</SlideEyebrow>
      <SlideTitle highlight="£1.5m" highlightPosition="after" className="mb-3">
        Raising
      </SlideTitle>
      <p className="text-base text-foreground/70 mb-10 max-w-3xl">
        18-month runway to deliver the product roadmap, acquire critical mass of global repo
        market data, and develop POC for a 'repo all-to-all' trading venue.
      </p>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-0">
        <div className="lg:col-span-5 grid grid-cols-2 gap-3 content-start">
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

        <div className="lg:col-span-7">
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
      </div>

      <SlideFooter page={14} />
    </SlideLayout>
  );
}
