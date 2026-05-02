import { SlideLayout, SlideTitle, SlideEyebrow, SlideFooter } from "./SlideLayout";
import { IconPlaceholder } from "./IconPlaceholder";
import { Download, Filter, Shuffle, BrainCircuit, Send, ArrowRight } from "lucide-react";

const stages = [
  {
    icon: Download,
    title: "Pull Data",
    body: "SFTR data is automatically pulled from the Trade Repository via SFTP.",
  },
  {
    icon: Filter,
    title: "Filter, Clean & Mend",
    body: "Raw SFTR data is cleaned, repaired, and consolidated in the ingestion engine.",
  },
  {
    icon: Shuffle,
    title: "Anonymise & Aggregate",
    body: "Data is anonymised, reclassified using proprietary taxonomies, and combined with peer data.",
  },
  {
    icon: BrainCircuit,
    title: "Enrich & Apply Analytics",
    body: "Data is enriched with external sources and analysed using proprietary analytics.",
  },
  {
    icon: Send,
    title: "Deliver",
    body: "Results are delivered to users via API and User Interface.",
  },
];

export function DataJourneySlide() {
  return (
    <SlideLayout>
      <SlideEyebrow>Data Journey</SlideEyebrow>
      <SlideTitle highlight="Journey" highlightPosition="after" className="mb-10">
        Data
      </SlideTitle>

      <div className="flex-1 flex flex-col justify-center min-h-0">
        <div className="grid grid-cols-[1fr_auto_1fr_auto_1fr_auto_1fr_auto_1fr] gap-3 items-start">
          {stages.map((s, i) => (
            <>
              <div key={s.title} className="flex flex-col items-center text-center gap-3 px-2">
                <IconPlaceholder icon={s.icon} size="lg" />
                <h3 className="font-heading font-bold text-sm md:text-base">{s.title}</h3>
                <p className="text-xs text-foreground/70 leading-relaxed">{s.body}</p>
              </div>
              {i < stages.length - 1 && (
                <div key={`arr-${i}`} className="flex items-center pt-7">
                  <ArrowRight className="text-[var(--lrh-blue)]" size={22} strokeWidth={2} />
                </div>
              )}
            </>
          ))}
        </div>
      </div>

      <SlideFooter page={10} />
    </SlideLayout>
  );
}
