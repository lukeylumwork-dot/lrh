import { SlideLayout, SlideTitle, SlideEyebrow, SlideFooter } from "./SlideLayout";
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

const logos: { src: string; alt: string }[] = [
  { src: assets.logos.mufg, alt: "MUFG" },
  { src: assets.logos.cba, alt: "Commonwealth Bank" },
  { src: assets.logos.bmo, alt: "BMO" },
  { src: assets.logos.cic, alt: "CIC" },
  { src: assets.logos.td, alt: "TD" },
];

export function StorySlide() {
  return (
    <SlideLayout>
      <SlideEyebrow>Our Story So Far</SlideEyebrow>
      <SlideTitle highlight="Momentum" highlightPosition="after" className="mb-8">
        Traction &amp;
      </SlideTitle>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-0">
        <div className="lg:col-span-7 space-y-3">
          {blocks.map((b) => (
            <div key={b.label} className="border-l-2 border-[var(--lrh-blue)] pl-5 py-1">
              <div className="text-xs uppercase tracking-[0.18em] text-[var(--lrh-blue)] font-medium mb-1">
                {b.label}
              </div>
              <p className="text-sm md:text-base text-foreground/80 leading-relaxed">{b.body}</p>
            </div>
          ))}
        </div>

        <div className="lg:col-span-5">
          <SlideCard variant="soft" className="h-full">
            <div className="text-xs uppercase tracking-[0.18em] text-[var(--lrh-blue)] font-medium mb-4">
              Key Achievements
            </div>
            <ul className="space-y-2.5">
              {achievements.map((a) => (
                <li key={a} className="flex gap-2.5 items-start text-sm text-foreground/85">
                  <CheckSquare size={16} className="text-[var(--lrh-blue)] mt-0.5 flex-shrink-0" strokeWidth={2} />
                  <span>{a}</span>
                </li>
              ))}
            </ul>
          </SlideCard>
        </div>
      </div>

      <div className="pt-6 mt-6 border-t border-border">
        <div className="text-[10px] uppercase tracking-[0.22em] text-foreground/45 mb-3">
          Live Clients
        </div>
        <div className="grid grid-cols-5 gap-8 items-center">
          {logos.map((l) => (
            <div key={l.alt} className="flex items-center justify-center h-10">
              <img src={l.src} alt={l.alt} className="max-h-full max-w-full object-contain" />
            </div>
          ))}
        </div>
      </div>

      <SlideFooter page={6} />
    </SlideLayout>
  );
}
