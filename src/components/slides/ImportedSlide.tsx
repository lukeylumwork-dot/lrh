import { SlideLayout, SlideTitle } from "./SlideLayout";
import type { ImportedSlideDTO } from "@/server/imports.functions";

interface Props {
  slide: ImportedSlideDTO;
  total: number;
}

export function ImportedSlide({ slide, total }: Props) {
  const hasImages = slide.image_urls.length > 0;
  return (
    <SlideLayout>
      <div className="flex items-center justify-between mb-8">
        <span className="text-xs uppercase tracking-[0.18em] text-foreground/50">
          Imported · Slide {slide.index + 1} of {total}
        </span>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-10 min-h-0">
        <div className={hasImages ? "lg:col-span-7 flex flex-col min-h-0" : "lg:col-span-12 flex flex-col min-h-0"}>
          {slide.title && (
            <SlideTitle className="mb-8 text-4xl md:text-5xl">{slide.title}</SlideTitle>
          )}
          {slide.bullets.length > 0 && (
            <ul className="space-y-3 overflow-y-auto pr-4">
              {slide.bullets.map((b, i) => (
                <li
                  key={i}
                  className="flex gap-3 text-base md:text-lg leading-relaxed text-foreground/80"
                >
                  <span className="mt-2 h-1.5 w-1.5 rounded-full bg-[var(--lrh-blue)] flex-shrink-0" />
                  <span>{b}</span>
                </li>
              ))}
            </ul>
          )}
          {!slide.title && slide.bullets.length === 0 && (
            <p className="text-foreground/40 italic">No text content extracted from this slide.</p>
          )}
        </div>

        {hasImages && (
          <div className="lg:col-span-5 grid grid-cols-1 gap-4 content-start overflow-y-auto">
            {slide.image_urls.map((url, i) => (
              <div
                key={i}
                className="rounded-md overflow-hidden border border-border bg-card"
              >
                <img src={url} alt="" className="w-full h-auto object-contain" />
              </div>
            ))}
          </div>
        )}
      </div>
    </SlideLayout>
  );
}
