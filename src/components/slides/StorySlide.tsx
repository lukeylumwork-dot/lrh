import { SlideLayout, SlideTitle } from "@/components/slides/SlideLayout";
import { SlideCard } from "@/components/slides/Card";
import { LogoRow } from "@/components/slides/LogoRow";
import { IconPlaceholder } from "@/components/slides/IconPlaceholder";
import { Store, Target, Signpost, Check } from "lucide-react";

const story = [
  { icon: Store, title: "Market backdrop", body: "SFTR came into force in October 2020. All repo trades in the UK and EU must now be reported every single day." },
  { icon: Target, title: "Our position", body: "We are the first to repurpose this data and bring transparency to a circa €20 trillion weekly market." },
  { icon: Signpost, title: "Strategic direction", body: "We are building the dominant data layer for global repo markets." },
];

const achievements = [
  "World-class product fully deployed and production-ready",
  "Secured 6-figure contracts with 5 global Banking Groups",
  "Established pipeline of 55 major financial institutions",
  "Partnership discussions with 8+ market infrastructure providers",
  "Ambitious roadmap to dominate the repo data market",
  "Excellent and highly motivated in-house team",
];

export function StorySlide() {
  return (
    <SlideLayout>
      <div className="mb-8">
        <SlideTitle highlight="Story" highlightPosition="after">Our</SlideTitle>
        <p className="text-lg text-foreground/70 mt-2">So far — traction and momentum</p>
      </div>

      <div className="flex-1 grid grid-cols-2 gap-8">
        <div className="space-y-5">
          {story.map((s) => (
            <div key={s.title} className="flex gap-4">
              <IconPlaceholder icon={s.icon} size="sm" variant="outline" />
              <div className="space-y-1">
                <h3 className="font-heading font-bold text-lg">{s.title}</h3>
                <p className="text-sm text-foreground/70 leading-relaxed">{s.body}</p>
              </div>
            </div>
          ))}
        </div>

        <SlideCard variant="soft">
          <h3 className="font-heading font-bold text-xl mb-4">Key achievements</h3>
          <ul className="space-y-3">
            {achievements.map((a) => (
              <li key={a} className="flex gap-3 text-sm">
                <Check size={18} className="text-[var(--lrh-blue)] shrink-0 mt-0.5" strokeWidth={2.5} />
                <span className="text-foreground/85">{a}</span>
              </li>
            ))}
          </ul>
        </SlideCard>
      </div>

      <div className="pt-8 mt-8">
        <LogoRow logos={["MUFG", "CommBank", "BMO", "CIC", "TD Bank", "J.P. Morgan"]} />
      </div>

      <div className="pt-6 mt-6 border-t border-border flex justify-between text-xs text-foreground/50">
        <span>© London Reporting House 2026 · Private &amp; Confidential</span>
        <span>5 / 6</span>
      </div>
    </SlideLayout>
  );
}
