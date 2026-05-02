import { SlideLayout, SlideFooter } from "./SlideLayout";
import { assets } from "./assets";

export function TitleSlide() {
  return (
    <SlideLayout>
      <div className="flex-1 grid grid-cols-1 md:grid-cols-2 items-center gap-12">
        <div className="space-y-7">
          <h1 className="font-heading font-bold text-5xl md:text-7xl leading-[1.02] tracking-tight">
            London<br />Reporting<br />House
          </h1>
          <div className="h-px w-24 bg-[var(--lrh-blue)]" />
          <div className="space-y-2">
            <p className="font-heading font-bold text-xl md:text-2xl">
              The Data Layer for Global <span className="text-[var(--lrh-blue)]">Repo</span> Markets
            </p>
            <p className="text-sm text-foreground/55 uppercase tracking-[0.18em]">
              Investment Presentation · May 2026
            </p>
          </div>
        </div>
        <div className="flex justify-center md:justify-end">
          <div className="relative h-72 w-72 md:h-[26rem] md:w-[26rem] rounded-full border-[10px] border-[var(--lrh-deep-navy)] overflow-hidden shadow-xl">
            <div className="absolute inset-2 rounded-full border-[6px] border-[var(--lrh-blue)] overflow-hidden">
              <img src={assets.titleGraphic} alt="" className="absolute inset-0 w-full h-full object-cover" />
            </div>
          </div>
        </div>
      </div>
      <SlideFooter page={1} />
    </SlideLayout>
  );
}
