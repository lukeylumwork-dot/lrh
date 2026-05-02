import { SlideLayout, SlideTitle, SlideEyebrow, SlideFooter } from "./SlideLayout";
import { SlideCard } from "./Card";
import { Building2, CheckCircle2 } from "lucide-react";

const stages = [
  {
    label: "Live",
    accent: "bg-[var(--lrh-blue)] text-white",
    clients: ["BMO", "CBA", "MUFG", "TD Securities", "CIC"],
    note: "Signed paying clients",
  },
  {
    label: "Sandbox",
    accent: "bg-[var(--lrh-soft-blue)] text-[var(--lrh-deep-navy)]",
    clients: ["J.P. Morgan", "AXA Investment", "BBVA", "Citibank", "Deutsche Bank", "UBS", "RBC"],
    note: "Trial / + 5 more",
  },
  {
    label: "Prospects A",
    accent: "border border-[var(--lrh-blue)] text-[var(--lrh-blue)]",
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

export function PipelineSlide() {
  return (
    <SlideLayout>
      <SlideEyebrow>Client Pipeline</SlideEyebrow>
      <div className="mb-6">
        <SlideTitle highlight="Pipeline" highlightPosition="after">Client</SlideTitle>
        <p className="text-sm md:text-base text-foreground/70 mt-3 max-w-4xl">
          We have met almost every major repo desk in the UK and Europe. Now that we are live —
          especially with our groundbreaking 'credit repo' offering — our goal is to sign as many
          firms as possible to complete the network.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6 max-w-md">
        <SlideCard variant="soft" className="flex items-center gap-3 py-4">
          <Building2 className="text-[var(--lrh-blue)]" size={28} strokeWidth={1.5} />
          <div>
            <div className="font-heading font-bold text-2xl text-[var(--lrh-blue)] leading-none">50+</div>
            <div className="text-[11px] text-foreground/70 mt-1">Institutions engaged</div>
          </div>
        </SlideCard>
        <SlideCard variant="soft" className="flex items-center gap-3 py-4">
          <CheckCircle2 className="text-[var(--lrh-blue)]" size={28} strokeWidth={1.5} />
          <div>
            <div className="font-heading font-bold text-2xl text-[var(--lrh-blue)] leading-none">5</div>
            <div className="text-[11px] text-foreground/70 mt-1">Live clients</div>
          </div>
        </SlideCard>
      </div>

      <div className="flex-1 grid grid-cols-5 gap-3 min-h-0">
        {stages.map((stage) => (
          <SlideCard key={stage.label} className="flex flex-col">
            <div
              className={`px-3 py-1.5 rounded-md text-[11px] font-bold uppercase tracking-wider mb-3 inline-block w-fit ${stage.accent}`}
            >
              {stage.label}
            </div>
            <ul className="flex-1 space-y-1.5">
              {stage.clients.map((c) => (
                <li key={c} className="text-xs text-foreground/85 truncate">{c}</li>
              ))}
            </ul>
            <div className="text-[11px] text-foreground/50 pt-3 mt-3 border-t border-border">
              {stage.note}
            </div>
          </SlideCard>
        ))}
      </div>

      <SlideFooter page={7} />
    </SlideLayout>
  );
}
