import { SlideLayout, SlideTitle, SlideBody } from "@/components/slides/SlideLayout";
import { IconPlaceholder } from "@/components/slides/IconPlaceholder";
import { Download, Sparkles, Layers, TrendingUp, Send, ArrowRight } from "lucide-react";

const steps = [
  { icon: Download, label: "Ingest" },
  { icon: Sparkles, label: "Clean" },
  { icon: Layers, label: "Aggregate" },
  { icon: TrendingUp, label: "Enrich" },
  { icon: Send, label: "Deliver" },
];

export function SolutionSlide() {
  return (
    <SlideLayout>
      <div className="space-y-4 mb-12">
        <SlideTitle highlight="Solution" highlightPosition="before">The</SlideTitle>
        <SlideBody>
          We automatically ingest our clients' SFTR data directly from the Trade Repository. It is anonymised,
          cleaned, aggregated with peer data, and enriched before delivery via UI and API.
        </SlideBody>
      </div>

      <div className="flex-1 flex items-center">
        <div className="w-full flex items-center justify-between gap-2">
          {steps.map((step, i) => (
            <div key={step.label} className="flex items-center gap-2 flex-1 last:flex-none">
              <div className="flex flex-col items-center gap-3 flex-1">
                <IconPlaceholder icon={step.icon} size="lg" />
                <span className="font-heading font-bold text-lg">{step.label}</span>
              </div>
              {i < steps.length - 1 && (
                <ArrowRight className="text-[var(--lrh-blue)] shrink-0" size={28} strokeWidth={2} />
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="pt-6 mt-6 border-t border-border flex justify-between text-xs text-foreground/50">
        <span>© London Reporting House 2026 · Private &amp; Confidential</span>
        <span>3 / 6</span>
      </div>
    </SlideLayout>
  );
}
