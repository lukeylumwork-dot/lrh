import { SlideLayout, SlideTitle, SlideBody, SlideEyebrow, SlideFooter } from "./SlideLayout";
import { IconPlaceholder } from "./IconPlaceholder";
import { Download, Sparkles, Layers, TrendingUp, Send, ArrowRight } from "lucide-react";

const steps = [
  { icon: Download, label: "Ingest" },
  { icon: Sparkles, label: "Clean" },
  { icon: Layers, label: "Aggregate" },
  { icon: TrendingUp, label: "Enrich" },
  { icon: Send, label: "Deliver" },
];

const features = [
  "GC Curves & Spreads",
  "Specials",
  "Collateral Prices",
  "Haircuts",
  "Flows",
  "ISIN Search",
];

export function SolutionSlide() {
  return (
    <SlideLayout>
      <SlideEyebrow>The Solution</SlideEyebrow>
      <div className="space-y-4 mb-10">
        <SlideTitle highlight="Solution" highlightPosition="before">The</SlideTitle>
        <SlideBody>
          We automatically ingest clients' SFTR data from the Trade Repository. It is anonymised,
          cleaned, aggregated with peer data, enriched with external data, and delivered via UI
          and API in a give-to-get model.
        </SlideBody>
      </div>

      <div className="flex items-center mb-12">
        <div className="w-full flex items-center justify-between gap-2">
          {steps.map((step, i) => (
            <div key={step.label} className="flex items-center gap-2 flex-1 last:flex-none">
              <div className="flex flex-col items-center gap-3 flex-1">
                <IconPlaceholder icon={step.icon} size="lg" />
                <span className="font-heading font-bold text-base md:text-lg">{step.label}</span>
              </div>
              {i < steps.length - 1 && (
                <ArrowRight className="text-[var(--lrh-blue)] shrink-0" size={24} strokeWidth={2} />
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="flex-1 flex flex-col">
        <div className="text-xs uppercase tracking-[0.18em] text-foreground/55 mb-3">
          Live features for Government Bond &amp; Credit Repo
        </div>
        <div className="flex flex-wrap gap-2">
          {features.map((f) => (
            <span
              key={f}
              className="px-3 py-1.5 rounded-full bg-[var(--lrh-soft-blue)]/50 border border-[var(--lrh-soft-blue)] text-sm font-medium text-[var(--lrh-deep-navy)]"
            >
              {f}
            </span>
          ))}
        </div>
      </div>

      <SlideFooter page={4} />
    </SlideLayout>
  );
}
