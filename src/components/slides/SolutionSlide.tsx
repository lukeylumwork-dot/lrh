import { GenericSlide } from "./editor/GenericSlide";
import type { Block } from "./editor/types";
import { SlideFooter } from "./SlideLayout";
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

const PAD_X = 6.25;
const defaultBlocks: Block[] = [
  { id: "eyebrow", kind: "eyebrow", text: "The Solution", x: PAD_X, y: 6, w: 40, h: 3 },
  { id: "title", kind: "title", text: "The Solution", x: PAD_X, y: 11, w: 70, h: 12 },
  {
    id: "body",
    kind: "text",
    text: "We automatically ingest clients' SFTR data from the Trade Repository. It is anonymised, cleaned, aggregated with peer data, enriched with external data, and delivered via UI and API in a give-to-get model.",
    x: PAD_X,
    y: 25,
    w: 75,
    h: 12,
  },
  { id: "pipeline", kind: "region", regionId: "pipeline", x: PAD_X, y: 42, w: 100 - 2 * PAD_X, h: 22 },
  { id: "features", kind: "region", regionId: "features", x: PAD_X, y: 68, w: 100 - 2 * PAD_X, h: 22 },
  { id: "footer", kind: "region", regionId: "footer", x: PAD_X, y: 92, w: 100 - 2 * PAD_X, h: 5 },
];

export function SolutionSlide() {
  const regions = {
    pipeline: (
      <div className="flex items-center h-full">
        <div className="w-full flex items-center justify-between gap-2">
          {steps.map((step, i) => (
            <div key={step.label} className="flex items-center gap-2 flex-1 last:flex-none">
              <div className="flex flex-col items-center gap-3 flex-1">
                <IconPlaceholder icon={step.icon} size="lg" />
                <span className="font-heading font-bold text-base md:text-lg">
                  {step.label}
                </span>
              </div>
              {i < steps.length - 1 && (
                <ArrowRight className="text-[var(--lrh-blue-500)] shrink-0" size={24} strokeWidth={2} />
              )}
            </div>
          ))}
        </div>
      </div>
    ),
    features: (
      <div className="h-full flex flex-col">
        <div className="text-xs uppercase tracking-[0.18em] text-foreground/55 mb-3">
          Live features for Government Bond &amp; Credit Repo
        </div>
        <div className="flex flex-wrap gap-2">
          {features.map((f) => (
            <span
              key={f}
              className="px-3 py-1.5 rounded-full bg-[var(--lrh-soft-blue)]/50 border border-[var(--lrh-soft-blue)] text-sm font-medium text-[var(--lrh-navy-900)]"
            >
              {f}
            </span>
          ))}
        </div>
      </div>
    ),
    footer: <SlideFooter page={4} />,
  };
  return (
    <GenericSlide slideId="solution" defaultBlocks={defaultBlocks} regions={regions} />
  );
}
