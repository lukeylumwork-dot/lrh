import { SlideLayout, SlideTitle, SlideEyebrow, SlideFooter } from "./SlideLayout";
import { SlideCard } from "./Card";
import { ArrowRight } from "lucide-react";

const clientStack = [
  { label: "DTCC", sub: "Trade Repository" },
  { label: "SFTP Pull", sub: "Authorized data feed" },
  { label: "Ingestion", sub: "Filter · Clean · Mend" },
  { label: "REST API", sub: "Client-specific account" },
  { label: "API Gateway", sub: "Authentication & rate limiting" },
];

const coreStack = [
  { label: "Aggregation", sub: "Multi-subscriber data fusion" },
  { label: "Anonymisation", sub: "Proprietary taxonomy" },
  { label: "Enrichment", sub: "External reference data" },
  { label: "Database", sub: "Time-series + analytics" },
  { label: "Backend API", sub: "UI & subscriber API" },
];

export function ArchitectureSlide() {
  return (
    <SlideLayout>
      <SlideEyebrow>Technology Architecture</SlideEyebrow>
      <SlideTitle highlight="Architecture" highlightPosition="after" className="mb-3">
        Technology
      </SlideTitle>
      <p className="text-sm text-foreground/70 mb-8">
        Hosted on AWS · Two isolated account boundaries
      </p>

      <div className="flex-1 grid grid-cols-2 gap-6 min-h-0">
        <div className="flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-heading font-bold text-sm uppercase tracking-wide text-foreground/70">
              Client-Specific Account
            </h3>
            <span className="text-[10px] uppercase tracking-[0.18em] text-[var(--lrh-blue)] font-medium">
              Per subscriber
            </span>
          </div>
          <div className="flex-1 space-y-2">
            {clientStack.map((s, i) => (
              <div key={s.label}>
                <SlideCard className="flex items-center gap-4 py-3">
                  <div className="font-heading font-bold text-xs text-[var(--lrh-blue)] w-6">0{i + 1}</div>
                  <div>
                    <div className="font-heading font-bold text-sm">{s.label}</div>
                    <div className="text-xs text-foreground/60">{s.sub}</div>
                  </div>
                </SlideCard>
                {i < clientStack.length - 1 && (
                  <div className="flex justify-center py-0.5">
                    <ArrowRight className="text-[var(--lrh-blue)]/60 rotate-90" size={14} />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-heading font-bold text-sm uppercase tracking-wide text-foreground/70">
              Core Account
            </h3>
            <span className="text-[10px] uppercase tracking-[0.18em] text-[var(--lrh-blue)] font-medium">
              Shared platform
            </span>
          </div>
          <div className="flex-1 space-y-2">
            {coreStack.map((s, i) => (
              <div key={s.label}>
                <SlideCard
                  variant="soft"
                  className="flex items-center gap-4 py-3"
                >
                  <div className="font-heading font-bold text-xs text-[var(--lrh-blue)] w-6">0{i + 1}</div>
                  <div>
                    <div className="font-heading font-bold text-sm">{s.label}</div>
                    <div className="text-xs text-foreground/60">{s.sub}</div>
                  </div>
                </SlideCard>
                {i < coreStack.length - 1 && (
                  <div className="flex justify-center py-0.5">
                    <ArrowRight className="text-[var(--lrh-blue)]/60 rotate-90" size={14} />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      <SlideFooter page={18} />
    </SlideLayout>
  );
}
