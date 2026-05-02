import { Fragment } from "react";
import { GenericSlide } from "./editor/GenericSlide";
import type { Block } from "./editor/types";
import { SlideFooter } from "./SlideLayout";
import { IconPlaceholder } from "./IconPlaceholder";
import { Download, Filter, Shuffle, BrainCircuit, Send, ArrowRight } from "lucide-react";

const stages = [
  { icon: Download, title: "Pull Data", body: "SFTR data is automatically pulled from the Trade Repository via SFTP." },
  { icon: Filter, title: "Filter, Clean & Mend", body: "Raw SFTR data is cleaned, repaired, and consolidated in the ingestion engine." },
  { icon: Shuffle, title: "Anonymise & Aggregate", body: "Data is anonymised, reclassified using proprietary taxonomies, and combined with peer data." },
  { icon: BrainCircuit, title: "Enrich & Apply Analytics", body: "Data is enriched with external sources and analysed using proprietary analytics." },
  { icon: Send, title: "Deliver", body: "Results are delivered to users via API and User Interface." },
];

const PAD_X = 6.25;
const defaultBlocks: Block[] = [
  { id: "eyebrow", kind: "eyebrow", text: "Data Journey", x: PAD_X, y: 6, w: 40, h: 3 },
  { id: "title", kind: "title", text: "Data Journey", x: PAD_X, y: 11, w: 70, h: 10 },
  { id: "stages", kind: "region", regionId: "stages", x: PAD_X, y: 35, w: 100 - 2 * PAD_X, h: 50 },
  { id: "footer", kind: "region", regionId: "footer", x: PAD_X, y: 92, w: 100 - 2 * PAD_X, h: 5 },
];

export function DataJourneySlide() {
  const regions = {
    stages: (
      <div className="h-full grid grid-cols-[1fr_auto_1fr_auto_1fr_auto_1fr_auto_1fr] gap-3 items-start content-center">
        {stages.map((s, i) => (
          <Fragment key={s.title}>
            <div className="flex flex-col items-center text-center gap-3 px-2">
              <IconPlaceholder icon={s.icon} size="lg" />
              <h3 className="font-heading font-bold text-sm md:text-base">{s.title}</h3>
              <p className="text-xs text-foreground/70 leading-relaxed">{s.body}</p>
            </div>
            {i < stages.length - 1 && (
              <div className="flex items-center pt-7">
                <ArrowRight className="text-[var(--lrh-blue)]" size={22} strokeWidth={2} />
              </div>
            )}
          </Fragment>
        ))}
      </div>
    ),
    footer: <SlideFooter page={10} />,
  };
  return <GenericSlide slideId="dataJourney" defaultBlocks={defaultBlocks} regions={regions} />;
}
