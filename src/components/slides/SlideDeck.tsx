import { useEffect, useState, ReactNode } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface SlideDeckProps {
  slides: { id: string; node: ReactNode }[];
  onIndexChange?: (index: number) => void;
}

export function SlideDeck({ slides, onIndexChange }: SlideDeckProps) {
  const [index, setIndex] = useState(0);

  const go = (next: number) => {
    const clamped = Math.max(0, Math.min(slides.length - 1, next));
    setIndex(clamped);
    onIndexChange?.(clamped);
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null;
      if (t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.isContentEditable)) return;
      if (e.key === "ArrowRight" || e.key === " ") go(index + 1);
      if (e.key === "ArrowLeft") go(index - 1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  return (
    <div className="fixed inset-0 bg-background overflow-hidden">
      <div className="relative w-full h-full">
        {slides.map((s, i) => (
          <div
            key={s.id}
            className={cn(
              "absolute inset-0 transition-opacity duration-500 ease-out",
              i === index ? "opacity-100 z-10" : "opacity-0 z-0 pointer-events-none",
            )}
            aria-hidden={i !== index}
          >
            {s.node}
          </div>
        ))}
      </div>

      {/* Nav arrows */}
      <button
        onClick={() => go(index - 1)}
        disabled={index === 0}
        aria-label="Previous slide"
        className="fixed left-4 top-1/2 -translate-y-1/2 z-30 h-11 w-11 rounded-full bg-card border border-border flex items-center justify-center text-foreground hover:bg-[var(--lrh-soft-blue)]/40 disabled:opacity-30 disabled:cursor-not-allowed transition"
      >
        <ChevronLeft size={20} />
      </button>
      <button
        onClick={() => go(index + 1)}
        disabled={index === slides.length - 1}
        aria-label="Next slide"
        className="fixed right-4 top-1/2 -translate-y-1/2 z-30 h-11 w-11 rounded-full bg-card border border-border flex items-center justify-center text-foreground hover:bg-[var(--lrh-soft-blue)]/40 disabled:opacity-30 disabled:cursor-not-allowed transition"
      >
        <ChevronRight size={20} />
      </button>

      {/* Dots */}
      <div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-30 flex gap-2">
        {slides.map((s, i) => (
          <button
            key={s.id}
            onClick={() => go(i)}
            aria-label={`Go to slide ${i + 1}`}
            className={cn(
              "h-1.5 rounded-full transition-all",
              i === index ? "w-8 bg-[var(--lrh-blue)]" : "w-4 bg-foreground/20 hover:bg-foreground/40",
            )}
          />
        ))}
      </div>
    </div>
  );
}
