import { GenericSlide } from "./editor/GenericSlide";
import type { Block } from "./editor/types";
import { SlideFooter } from "./SlideLayout";
import { SlideCard } from "./Card";
import { CheckSquare } from "lucide-react";
import { assets } from "./assets";

const blocks = [
  {
    label: "Market Backdrop",
    body: "SFTR came into force in October 2020, mandating that all UK & EU repo trades be reported daily by every market participant.",
  },
  {
    label: "LRH Position",
    body: "First to repurpose this data and bring transparency to a large yet historically opaque market — circa €20 trillion in outstandings per week.",
  },
  {
    label: "Strategic Direction",
    body: "Build the dominant data layer for global repo markets.",
  },
];

const achievements = [
  "World-class product fully deployed and production-ready",
  "Secured 6-figure contracts with 5 global Banking Groups",
  "Established pipeline of 55 major financial institutions",
  "Partnership discussions with 8+ market infrastructure providers (LSEG, Euroclear, ...)",
  "Ambitious roadmap to dominate the repo data market",
  "Excellent and highly motivated in-house team",
];

const logos = [
  { src: assets.logos.mufg, alt: "MUFG" },
  { src: assets.logos.cba, alt: "Commonwealth Bank" },
  { src: assets.logos.bmo, alt: "BMO" },
  { src: assets.logos.cic, alt: "CIC" },
  { src: assets.logos.td, alt: "TD" },
];

const PAD_X = 6.25;
const defaultBlocks: Block[] = [
  { id: "eyebrow", kind: "eyebrow", text: "Our Story So Far", x: PAD_X, y: 6, w: 40, h: 3 },
  { id: "title", kind: "title", text: "Traction & Momentum", x: PAD_X, y: 11, w: 70, h: 10 },
  { id: "story", kind: "region", regionId: "story", x: PAD_X, y: 25, w: 52, h: 50 },
  { id: "achievements", kind: "region", regionId: "achievements", x: 60, y: 25, w: 100 - 60 - PAD_X, h: 50 },
  { id: "logos", kind: "region", regionId: "logos", x: PAD_X, y: 78, w: 100 - 2 * PAD_X, h: 12 },
  { id: "footer", kind: "region", regionId: "footer", x: PAD_X, y: 92, w: 100 - 2 * PAD_X, h: 5 },
];

export function StorySlide() {
  const regions = {
    story: (
      <div className="space-y-3 h-full">
        {blocks.map((b) => (
          <div
            key={b.label}
            className="border-l-2 border-[var(--lrh-blue-500)] pl-5 py-1"
          >
            <div className="text-xs uppercase tracking-[0.18em] text-[var(--lrh-blue-500)] font-medium mb-1">
              {b.label}
            </div>
            <p className="text-sm md:text-base text-foreground/80 leading-relaxed">
              {b.body}
            </p>
          </div>
        ))}
      </div>
    ),
    achievements: (
      <SlideCard variant="soft" className="h-full">
        <div className="text-xs uppercase tracking-[0.18em] text-[var(--lrh-blue-500)] font-medium mb-4">
          Key Achievements
        </div>
        <ul className="space-y-2.5">
          {achievements.map((a) => (
            <li key={a} className="flex gap-2.5 items-start text-sm text-foreground/85">
              <CheckSquare size={16} className="text-[var(--lrh-blue-500)] mt-0.5 flex-shrink-0" strokeWidth={2} />
              <span>{a}</span>
            </li>
          ))}
        </ul>
      </SlideCard>
    ),
    logos: (
      <div className="h-full flex flex-col pt-4 border-t border-border">
        <div className="text-[10px] uppercase tracking-[0.22em] text-foreground/45 mb-3">
          Live Clients
        </div>
        <div className="grid grid-cols-5 gap-8 items-center flex-1">
          {logos.map((l) => (
            <div key={l.alt} className="flex items-center justify-center h-10">
              <img src={l.src} alt={l.alt} className="max-h-full max-w-full object-contain" />
            </div>
          ))}
        </div>
      </div>
    ),
    footer: <SlideFooter page={6} />,
  };
  return (
    <GenericSlide slideId="story" defaultBlocks={defaultBlocks} regions={regions} />
  );
}
