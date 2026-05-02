import { SlideLayout, SlideTitle, SlideEyebrow, SlideFooter } from "./SlideLayout";
import { SlideCard } from "./Card";
import { IconPlaceholder } from "./IconPlaceholder";
import { Megaphone, Network, FileBarChart, Rocket } from "lucide-react";

const phases = [
  {
    icon: Megaphone,
    phase: "Phase 1",
    title: "Thought Leadership",
    body: "Publish proprietary research, market commentary and benchmarks to position LRH as the authoritative voice in repo data.",
  },
  {
    icon: Network,
    phase: "Phase 2",
    title: "Industry Partnerships",
    body: "Partner with LSEG, CME, ICE, Euroclear and trade associations to extend reach and embed LRH in market workflows.",
  },
  {
    icon: FileBarChart,
    phase: "Phase 3",
    title: "Account-Based Sales",
    body: "Targeted ABM into Tier-1 banks and the buyside, with sandbox-to-paid conversion playbooks.",
  },
  {
    icon: Rocket,
    phase: "Phase 4",
    title: "Go-Live & Scale",
    body: "Productised onboarding, expansion of the data network, and launch of new modules on cadence.",
  },
];

export function MarketingStrategySlide() {
  return (
    <SlideLayout>
      <SlideEyebrow>Marketing Strategy</SlideEyebrow>
      <SlideTitle highlight="Strategy" highlightPosition="after" className="mb-3">
        Marketing
      </SlideTitle>
      <p className="text-sm md:text-base text-foreground/70 mb-10 max-w-3xl">
        A four-phase go-to-market plan that compounds credibility, reach and conversion across
        the global repo network.
      </p>

      <div className="flex-1 grid grid-cols-4 gap-4 min-h-0">
        {phases.map((p) => (
          <SlideCard key={p.title} className="flex flex-col">
            <IconPlaceholder icon={p.icon} size="md" className="mb-4" />
            <div className="text-[11px] uppercase tracking-[0.18em] text-[var(--lrh-blue)] font-medium mb-1">
              {p.phase}
            </div>
            <h3 className="font-heading font-bold text-base mb-3">{p.title}</h3>
            <p className="text-sm text-foreground/70 leading-relaxed">{p.body}</p>
          </SlideCard>
        ))}
      </div>

      <SlideFooter page={15} />
    </SlideLayout>
  );
}
