import { GenericSlide } from "./editor/GenericSlide";
import type { Block } from "./editor/types";
import { SlideFooter } from "./SlideLayout";
import { SlideCard } from "./Card";
import { Building2, CheckCircle2 } from "lucide-react";

const stages = [
  {
    label: "Live",
    accent: "bg-[var(--lrh-blue-500)] text-white",
    clients: ["BMO", "CBA", "MUFG", "TD Securities", "CIC"],
    note: "Signed paying clients",
  },
  {
    label: "Sandbox",
    accent: "bg-[var(--lrh-soft-blue)] text-[var(--lrh-navy-900)]",
    clients: ["J.P. Morgan", "AXA Investment", "BBVA", "Citibank", "Deutsche Bank", "UBS", "RBC"],
    note: "Trial / + 5 more",
  },
  {
    label: "Prospects A",
    accent: "border border-[var(--lrh-blue-500)] text-[var(--lrh-blue-500)]",
    clients: ["CIBC", "Commerzbank", "NAB", "NatWest", "Lloyds"],
    note: "+ 6 more",
  },
  {
    label: "Prospects B",
    accent: "border border-foreground/30 text-foreground/60",
    clients: ["BNP Paribas", "Danske Bank", "Natixis", "Standard Chartered"],
    note: "+ 13 more",
  },
  {
    label: "Buyside",
    accent: "border border-foreground/30 text-foreground/60",
    clients: ["BlackRock", "Brevan Howard", "Citadel", "PIMCO"],
    note: "+ 6 more",
  },
];

const PAD_X = 6.25;
const defaultBlocks: Block[] = [
  { id: "eyebrow", kind: "eyebrow", text: "Client Pipeline", x: PAD_X, y: 6, w: 40, h: 3 },
  { id: "title", kind: "title", text: "Client Pipeline", x: PAD_X, y: 11, w: 70, h: 10 },
  {
    id: "body",
    kind: "text",
    text: "We have met almost every major repo desk in the UK and Europe. Now that we are live — especially with our groundbreaking 'credit repo' offering — our goal is to sign as many firms as possible to complete the network.",
    x: PAD_X,
    y: 22,
    w: 70,
    h: 10,
  },
  { id: "stats", kind: "region", regionId: "stats", x: PAD_X, y: 35, w: 30, h: 12 },
  { id: "stages", kind: "region", regionId: "stages", x: PAD_X, y: 50, w: 100 - 2 * PAD_X, h: 38 },
  { id: "footer", kind: "region", regionId: "footer", x: PAD_X, y: 92, w: 100 - 2 * PAD_X, h: 5 },
];

export function PipelineSlide() {
  const regions = {
    stats: (
      <div className="grid grid-cols-2 gap-4 h-full">
        <SlideCard variant="soft" className="flex items-center gap-3 py-4">
          <Building2 className="text-[var(--lrh-blue-500)]" size={28} strokeWidth={1.5} />
          <div>
            <div className="font-heading font-bold text-2xl text-[var(--lrh-blue-500)] leading-none">
              50+
            </div>
            <div className="text-[11px] text-foreground/70 mt-1">
              Institutions engaged
            </div>
          </div>
        </SlideCard>
        <SlideCard variant="soft" className="flex items-center gap-3 py-4">
          <CheckCircle2 className="text-[var(--lrh-blue-500)]" size={28} strokeWidth={1.5} />
          <div>
            <div className="font-heading font-bold text-2xl text-[var(--lrh-blue-500)] leading-none">
              5
            </div>
            <div className="text-[11px] text-foreground/70 mt-1">Live clients</div>
          </div>
        </SlideCard>
      </div>
    ),
    stages: (
      <div className="grid grid-cols-5 gap-3 h-full">
        {stages.map((stage) => (
          <SlideCard key={stage.label} className="flex flex-col">
            <div
              className={`px-3 py-1.5 rounded-md text-[11px] font-bold uppercase tracking-wider mb-3 inline-block w-fit ${stage.accent}`}
            >
              {stage.label}
            </div>
            <ul className="flex-1 space-y-1.5">
              {stage.clients.map((c) => (
                <li key={c} className="text-xs text-foreground/85 truncate">
                  {c}
                </li>
              ))}
            </ul>
            <div className="text-[11px] text-foreground/50 pt-3 mt-3 border-t border-border">
              {stage.note}
            </div>
          </SlideCard>
        ))}
      </div>
    ),
    footer: <SlideFooter page={7} />,
  };
  return (
    <GenericSlide slideId="pipeline" defaultBlocks={defaultBlocks} regions={regions} />
  );
}
