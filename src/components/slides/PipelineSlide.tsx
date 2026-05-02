import { SlideLayout, SlideTitle } from "@/components/slides/SlideLayout";
import { SlideCard } from "@/components/slides/Card";
import { IconPlaceholder } from "@/components/slides/IconPlaceholder";
import { Building2, CheckCircle2, FlaskConical, Handshake, Users, Briefcase, ChevronRight } from "lucide-react";

const stages = [
  { icon: CheckCircle2, label: "Live", clients: ["BMO", "CBA", "MUFG", "TD Securities", "CIC"], tag: "Live" },
  { icon: FlaskConical, label: "Sandbox", clients: ["J.P. Morgan", "AXA Investment", "BBVA", "Citibank", "Deutsche Bank", "UBS", "RBC"], tag: "Trial" },
  { icon: Handshake, label: "Prospects A", clients: ["CIBC", "Commerzbank", "NAB", "NatWest", "Lloyds"], tag: "+6 more" },
  { icon: Users, label: "Prospects B", clients: ["BNP Paribas", "Danske Bank", "Natixis", "Standard Chartered"], tag: "+13 more" },
  { icon: Briefcase, label: "Buyside", clients: ["BlackRock", "Brevan Howard", "Citadel", "PIMCO"], tag: "+6 more" },
];

export function PipelineSlide() {
  return (
    <SlideLayout>
      <div className="mb-6">
        <SlideTitle highlight="Pipeline" highlightPosition="after">Client</SlideTitle>
        <p className="text-base text-foreground/70 mt-2 max-w-4xl">
          We have met almost every major repo desk in the UK and Europe. Our goal now is to sign as many firms as possible to complete the network.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-5 mb-6 max-w-xl">
        <SlideCard variant="soft" className="flex items-center gap-4">
          <IconPlaceholder icon={Building2} size="sm" variant="outline" />
          <div>
            <div className="font-heading font-bold text-2xl text-[var(--lrh-blue)]">50+</div>
            <div className="text-xs text-foreground/70">Institutions engaged</div>
          </div>
        </SlideCard>
        <SlideCard variant="soft" className="flex items-center gap-4">
          <IconPlaceholder icon={CheckCircle2} size="sm" variant="outline" />
          <div>
            <div className="font-heading font-bold text-2xl text-[var(--lrh-blue)]">5</div>
            <div className="text-xs text-foreground/70">Live clients</div>
          </div>
        </SlideCard>
      </div>

      <div className="flex-1 grid grid-cols-[1fr_auto_1fr_auto_1fr_auto_1fr_auto_1fr] gap-2 items-stretch">
        {stages.map((stage, i) => [
          <SlideCard key={`${stage.label}-card`} className="flex flex-col">
            <div className="flex flex-col items-center gap-2 pb-3 border-b border-border">
              <IconPlaceholder icon={stage.icon} size="sm" variant="outline" />
              <span className="font-heading font-bold text-sm uppercase tracking-wide">{stage.label}</span>
            </div>
            <ul className="flex-1 mt-3 space-y-1.5">
              {stage.clients.slice(0, 5).map((c) => (
                <li key={c} className="text-xs text-foreground/80 truncate">{c}</li>
              ))}
            </ul>
            <div className="text-xs text-[var(--lrh-blue)] font-medium pt-2">{stage.tag}</div>
          </SlideCard>,
          i < stages.length - 1 ? (
            <div key={`${stage.label}-arrow`} className="flex items-center">
              <ChevronRight className="text-[var(--lrh-blue)]" size={20} />
            </div>
          ) : null,
        ])}
      </div>

      <div className="pt-6 mt-6 border-t border-border flex justify-between text-xs text-foreground/50">
        <span>© London Reporting House 2026 · Private &amp; Confidential</span>
        <span>6 / 6</span>
      </div>
    </SlideLayout>
  );
}
