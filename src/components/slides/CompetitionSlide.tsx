import { SlideLayout, SlideTitle } from "@/components/slides/SlideLayout";
import { SlideCard } from "@/components/slides/Card";
import { IconPlaceholder } from "@/components/slides/IconPlaceholder";
import { Database, FileCode, Users } from "lucide-react";

const competitors = [
  {
    icon: Database,
    title: "Venue Data",
    points: ["Timely but siloed", "Restricted to participants", "Limited OTC coverage"],
  },
  {
    icon: FileCode,
    title: "Regulatory / Public Data",
    points: ["Broad but retrospective", "High-level only", "Limited visibility into specials and haircuts"],
  },
  {
    icon: Users,
    title: "Broker Feeds",
    points: ["Valuable but proprietary", "Incomplete across venues", "Incomplete across counterparties"],
  },
];

const lrhEdges = ["Multi-party Aggregated STR", "Enrichment & Quality", "GC vs. Specials", "Flows Drill-downs", "Portfolio Analytics"];

export function CompetitionSlide() {
  return (
    <SlideLayout>
      <div className="space-y-2 mb-10">
        <SlideTitle highlight="Landscape" highlightPosition="after">Competitor</SlideTitle>
        <p className="text-lg text-foreground/70">LRH vs. market alternatives</p>
      </div>

      <div className="grid grid-cols-3 gap-6 mb-8">
        {competitors.map((c) => (
          <div key={c.title} className="space-y-4">
            <IconPlaceholder icon={c.icon} size="md" />
            <h3 className="font-heading font-bold text-xl">{c.title}</h3>
            <ul className="space-y-2 text-sm text-foreground/70">
              {c.points.map((p) => (
                <li key={p} className="flex gap-2"><span className="text-[var(--lrh-blue)]">•</span>{p}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <SlideCard variant="soft" className="flex-1">
        <div className="flex items-center gap-4 mb-5">
          <div className="h-9 w-9 rounded-full border-2 border-[var(--lrh-blue)] flex items-center justify-center">
            <span className="font-heading font-bold text-xs text-[var(--lrh-navy)]">LRH</span>
          </div>
          <span className="font-heading font-bold text-base">The LRH edge</span>
        </div>
        <div className="grid grid-cols-5 gap-4">
          {lrhEdges.map((e) => (
            <div key={e} className="bg-card rounded-md p-4 text-center text-sm font-heading font-bold text-foreground/90 min-h-[80px] flex items-center justify-center">
              {e}
            </div>
          ))}
        </div>
      </SlideCard>

      <div className="pt-6 mt-6 border-t border-border flex justify-between text-xs text-foreground/50">
        <span>© London Reporting House 2026 · Private &amp; Confidential</span>
        <span>4 / 6</span>
      </div>
    </SlideLayout>
  );
}
