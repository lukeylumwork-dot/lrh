import { SlideLayout, SlideTitle, SlideEyebrow, SlideFooter } from "./SlideLayout";
import { assets } from "./assets";

export function AllToAllSlide() {
  return (
    <SlideLayout>
      <SlideEyebrow>Future Vision</SlideEyebrow>
      <SlideTitle highlight="all-to-all" highlightPosition="after" className="mb-3">
        What is a repo
      </SlideTitle>
      <SlideTitle highlight="" className="-mt-6 mb-5">
        Trading Venue?
      </SlideTitle>
      <p className="text-sm md:text-base text-foreground/70 max-w-3xl mb-6">
        One trusted data layer. Many clients. End-to-end impact across the trade lifecycle —
        execution, settlement, clearing and regulatory reporting.
      </p>

      <div className="flex-1 flex items-center justify-center min-h-0 overflow-hidden">
        <img
          src={assets.allToAllDiagram}
          alt="LRH data layer ecosystem powering banks, hedge funds, asset managers, and money market funds via a repo all-to-all trading venue"
          className="max-h-full max-w-full object-contain rounded-md border border-border bg-card"
        />
      </div>

      <SlideFooter page={19} />
    </SlideLayout>
  );
}
