import { SlideLayout } from "@/components/slides/SlideLayout";

export function TitleSlide() {
  return (
    <SlideLayout>
      <div className="flex-1 grid grid-cols-1 md:grid-cols-2 items-center gap-12">
        <div className="space-y-8">
          <h1 className="font-heading font-bold text-6xl md:text-7xl leading-[1.02] tracking-tight">
            London<br />Reporting<br />House
          </h1>
          <div className="h-px w-24 bg-[var(--lrh-blue)]" />
          <div className="space-y-2">
            <p className="font-heading font-bold text-2xl md:text-3xl">
              The data layer for global <span className="text-[var(--lrh-blue)]">repo</span> markets
            </p>
            <p className="text-base text-foreground/60">Investment Presentation · May 2026</p>
          </div>
        </div>
        <div className="flex justify-center md:justify-end">
          <div className="relative h-72 w-72 md:h-96 md:w-96 rounded-full border-[10px] border-[var(--lrh-navy)]">
            <div className="absolute inset-3 rounded-full border-4 border-[var(--lrh-blue)]" />
            <div className="absolute inset-8 rounded-full bg-[var(--lrh-soft-blue)]/40 flex items-center justify-center">
              <span className="font-heading font-bold text-5xl text-[var(--lrh-navy)]">LRH</span>
            </div>
          </div>
        </div>
      </div>
      <div className="pt-8 border-t border-border flex justify-between text-xs text-foreground/50">
        <span>© London Reporting House 2026 · Private &amp; Confidential</span>
        <span>1 / 6</span>
      </div>
    </SlideLayout>
  );
}
