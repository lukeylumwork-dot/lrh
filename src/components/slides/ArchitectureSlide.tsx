import { GenericSlide } from "./editor/GenericSlide";
import type { Block } from "./editor/types";
import { SlideFooter } from "./SlideLayout";
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

const PAD_X = 6.25;
const defaultBlocks: Block[] = [
  { id: "eyebrow", kind: "eyebrow", text: "Technology Architecture", x: PAD_X, y: 6, w: 40, h: 3 },
  { id: "title", kind: "title", text: "Technology Architecture", x: PAD_X, y: 11, w: 70, h: 10 },
  {
    id: "body",
    kind: "text",
    text: "Hosted on AWS · Two isolated account boundaries",
    x: PAD_X,
    y: 22,
    w: 70,
    h: 5,
  },
  { id: "client", kind: "region", regionId: "client", x: PAD_X, y: 30, w: 43, h: 60 },
  { id: "core", kind: "region", regionId: "core", x: 51, y: 30, w: 100 - PAD_X - 51, h: 60 },
  { id: "footer", kind: "region", regionId: "footer", x: PAD_X, y: 92, w: 100 - 2 * PAD_X, h: 5 },
];

function StackColumn({
  title,
  badge,
  items,
  variant,
}: {
  title: string;
  badge: string;
  items: { label: string; sub: string }[];
  variant?: "soft" | "default";
}) {
  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-heading font-bold text-sm uppercase tracking-wide text-foreground/70">
          {title}
        </h3>
        <span className="text-[10px] uppercase tracking-[0.18em] text-[var(--lrh-blue)] font-medium">
          {badge}
        </span>
      </div>
      <div className="flex-1 space-y-2">
        {items.map((s, i) => (
          <div key={s.label}>
            <SlideCard variant={variant ?? "default"} className="flex items-center gap-4 py-3">
              <div className="font-heading font-bold text-xs text-[var(--lrh-blue)] w-6">0{i + 1}</div>
              <div>
                <div className="font-heading font-bold text-sm">{s.label}</div>
                <div className="text-xs text-foreground/60">{s.sub}</div>
              </div>
            </SlideCard>
            {i < items.length - 1 && (
              <div className="flex justify-center py-0.5">
                <ArrowRight className="text-[var(--lrh-blue)]/60 rotate-90" size={14} />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export function ArchitectureSlide() {
  const regions = {
    client: <StackColumn title="Client-Specific Account" badge="Per subscriber" items={clientStack} />,
    core: <StackColumn title="Core Account" badge="Shared platform" items={coreStack} variant="soft" />,
    footer: <SlideFooter page={18} />,
  };
  return <GenericSlide slideId="architecture" defaultBlocks={defaultBlocks} regions={regions} />;
}
