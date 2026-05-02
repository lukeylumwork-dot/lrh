import { GenericSlide } from "./editor/GenericSlide";
import type { Block } from "./editor/types";
import { SlideFooter } from "./SlideLayout";
import { SlideCard } from "./Card";
import { IconPlaceholder } from "./IconPlaceholder";
import { Megaphone, Network, FileBarChart, Rocket } from "lucide-react";

const phases = [
  { icon: Megaphone, phase: "Phase 1", title: "Thought Leadership", body: "Publish proprietary research, market commentary and benchmarks to position LRH as the authoritative voice in repo data." },
  { icon: Network, phase: "Phase 2", title: "Industry Partnerships", body: "Partner with LSEG, CME, ICE, Euroclear and trade associations to extend reach and embed LRH in market workflows." },
  { icon: FileBarChart, phase: "Phase 3", title: "Account-Based Sales", body: "Targeted ABM into Tier-1 banks and the buyside, with sandbox-to-paid conversion playbooks." },
  { icon: Rocket, phase: "Phase 4", title: "Go-Live & Scale", body: "Productised onboarding, expansion of the data network, and launch of new modules on cadence." },
];

const PAD_X = 6.25;
const defaultBlocks: Block[] = [
  { id: "eyebrow", kind: "eyebrow", text: "Marketing Strategy", x: PAD_X, y: 6, w: 40, h: 3 },
  { id: "title", kind: "title", text: "Marketing Strategy", x: PAD_X, y: 11, w: 70, h: 10 },
  {
    id: "body",
    kind: "text",
    text: "A four-phase go-to-market plan that compounds credibility, reach and conversion across the global repo network.",
    x: PAD_X,
    y: 22,
    w: 70,
    h: 8,
  },
  { id: "phases", kind: "region", regionId: "phases", x: PAD_X, y: 33, w: 100 - 2 * PAD_X, h: 55 },
  { id: "footer", kind: "region", regionId: "footer", x: PAD_X, y: 92, w: 100 - 2 * PAD_X, h: 5 },
];

export function MarketingStrategySlide() {
  const regions = {
    phases: (
      <div className="h-full grid grid-cols-4 gap-4">
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
    ),
    footer: <SlideFooter page={15} />,
  };
  return <GenericSlide slideId="marketingStrategy" defaultBlocks={defaultBlocks} regions={regions} />;
}
