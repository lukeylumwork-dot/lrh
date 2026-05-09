import { GenericSlide } from "./editor/GenericSlide";
import type { Block } from "./editor/types";
import { SlideFooter } from "./SlideLayout";

const PAD_X = 6.25; // matches --lrh-slide-padding-x (~120px on 1920)
const PAD_Y = 6.0;

const defaultBlocks: Block[] = [
  { id: "headline", kind: "region", regionId: "headline", x: PAD_X, y: PAD_Y + 6, w: 44, h: 60 },
  { id: "hero", kind: "region", regionId: "hero", x: 55, y: PAD_Y + 6, w: 38, h: 70 },
  { id: "footer", kind: "region", regionId: "footer", x: PAD_X, y: 92, w: 100 - 2 * PAD_X, h: 5 },
];

export function TitleSlide() {
  const regions = {
    headline: (
      <div className="space-y-7 h-full flex flex-col justify-center px-2">
        <h1 className="font-heading font-bold text-5xl md:text-7xl leading-[1.02] tracking-tight">
          London<br />Reporting<br />House
        </h1>
        <div className="h-px w-24 bg-[var(--lrh-blue-500)]" />
        <div className="space-y-2">
          <p className="font-heading font-bold text-xl md:text-2xl">
            The Data Layer for Global{" "}
            <span className="text-[var(--lrh-blue-500)]">Repo</span> Markets
          </p>
          <p className="text-sm text-foreground/55 uppercase tracking-[0.18em]">
            Investment Presentation · May 2026
          </p>
        </div>
      </div>
    ),
    hero: (
      <div className="h-full w-full flex items-center justify-end pr-4">
        <div className="font-heading text-[10rem] leading-none font-bold tracking-tight text-[var(--lrh-blue-500)]/15 select-none">
          LRH
        </div>
      </div>
    ),
    footer: <SlideFooter page={1} />,
  };
  return (
    <GenericSlide slideId="title" defaultBlocks={defaultBlocks} regions={regions} />
  );
}
