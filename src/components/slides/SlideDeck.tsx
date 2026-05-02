import { useEffect, useRef, useState, ReactNode, useCallback } from "react";
import { ChevronLeft, ChevronRight, Maximize2, Minimize2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface SlideDeckProps {
  slides: { id: string; node: ReactNode }[];
  onIndexChange?: (index: number) => void;
}

type Direction = 1 | -1;

export function SlideDeck({ slides, onIndexChange }: SlideDeckProps) {
  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState<Direction>(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [chromeVisible, setChromeVisible] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);
  const hideTimer = useRef<number | null>(null);
  const touchStartX = useRef<number | null>(null);

  const go = useCallback(
    (next: number) => {
      const clamped = Math.max(0, Math.min(slides.length - 1, next));
      if (clamped === index) return;
      setDirection(clamped > index ? 1 : -1);
      setIndex(clamped);
      onIndexChange?.(clamped);
    },
    [index, slides.length, onIndexChange],
  );

  // Keyboard nav
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null;
      if (t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.isContentEditable)) return;
      if (e.key === "ArrowRight" || e.key === " " || e.key === "PageDown") {
        e.preventDefault();
        go(index + 1);
      } else if (e.key === "ArrowLeft" || e.key === "PageUp") {
        e.preventDefault();
        go(index - 1);
      } else if (e.key === "Home") {
        go(0);
      } else if (e.key === "End") {
        go(slides.length - 1);
      } else if (e.key.toLowerCase() === "f") {
        toggleFullscreen();
      } else if (e.key === "Escape" && document.fullscreenElement) {
        document.exitFullscreen?.();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [index, slides.length, go]);

  // Fullscreen state sync
  useEffect(() => {
    const onFsChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", onFsChange);
    return () => document.removeEventListener("fullscreenchange", onFsChange);
  }, []);

  const toggleFullscreen = useCallback(async () => {
    const el = containerRef.current;
    if (!el) return;
    try {
      if (!document.fullscreenElement) {
        await el.requestFullscreen?.();
      } else {
        await document.exitFullscreen?.();
      }
    } catch {
      /* ignore */
    }
  }, []);

  // Auto-hide chrome in fullscreen
  const showChrome = useCallback(() => {
    setChromeVisible(true);
    if (hideTimer.current) window.clearTimeout(hideTimer.current);
    if (isFullscreen) {
      hideTimer.current = window.setTimeout(() => setChromeVisible(false), 2200);
    }
  }, [isFullscreen]);

  useEffect(() => {
    showChrome();
    return () => {
      if (hideTimer.current) window.clearTimeout(hideTimer.current);
    };
  }, [isFullscreen, index, showChrome]);

  // Touch swipe
  const onTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current == null) return;
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(dx) > 50) {
      if (dx < 0) go(index + 1);
      else go(index - 1);
    }
    touchStartX.current = null;
  };

  return (
    <div
      ref={containerRef}
      className={cn(
        "fixed inset-0 bg-background overflow-hidden",
        isFullscreen && !chromeVisible && "cursor-none",
      )}
      onMouseMove={showChrome}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      <div className="relative w-full h-full">
        {slides.map((s, i) => {
          const isActive = i === index;
          const isPrev = i === index - 1;
          const isNext = i === index + 1;
          // Slide offset based on position relative to current
          let translate = "translate-x-0";
          if (!isActive) {
            if (i < index) translate = "-translate-x-8";
            else translate = "translate-x-8";
          } else if (direction === 1) {
            // entering from right — handled by initial offset on others
            translate = "translate-x-0";
          }
          return (
            <div
              key={s.id}
              className={cn(
                "absolute inset-0 transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] will-change-transform",
                isActive
                  ? "opacity-100 translate-x-0 z-10"
                  : cn("opacity-0 z-0 pointer-events-none", translate),
                // Keep adjacent slides mounted-ready (perf hint only)
                (isPrev || isNext) && "",
              )}
              aria-hidden={!isActive}
            >
              {s.node}
            </div>
          );
        })}
      </div>

      {/* Print-only deck: every slide laid out at exact 1920x1080. */}
      <div className="print-deck" aria-hidden>
        {slides.map((s) => (
          <div key={`print-${s.id}`} className="print-slide">
            {s.node}
          </div>
        ))}
      </div>

      {/* Chrome */}
      <div
        className={cn(
          "deck-chrome transition-opacity duration-300",
          chromeVisible ? "opacity-100" : "opacity-0 pointer-events-none",
        )}
      >
        {/* Nav arrows */}
        <button
          onClick={() => go(index - 1)}
          disabled={index === 0}
          aria-label="Previous slide"
          className="fixed left-4 top-1/2 -translate-y-1/2 z-30 h-11 w-11 rounded-full bg-card/90 backdrop-blur border border-border flex items-center justify-center text-foreground hover:bg-[var(--lrh-soft-blue)]/40 disabled:opacity-30 disabled:cursor-not-allowed transition-all hover:scale-105 active:scale-95"
        >
          <ChevronLeft size={20} />
        </button>
        <button
          onClick={() => go(index + 1)}
          disabled={index === slides.length - 1}
          aria-label="Next slide"
          className="fixed right-4 top-1/2 -translate-y-1/2 z-30 h-11 w-11 rounded-full bg-card/90 backdrop-blur border border-border flex items-center justify-center text-foreground hover:bg-[var(--lrh-soft-blue)]/40 disabled:opacity-30 disabled:cursor-not-allowed transition-all hover:scale-105 active:scale-95"
        >
          <ChevronRight size={20} />
        </button>

        {/* Fullscreen toggle */}
        <button
          onClick={toggleFullscreen}
          aria-label={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
          className="fixed top-4 right-4 z-30 h-9 w-9 rounded-full bg-card/90 backdrop-blur border border-border flex items-center justify-center text-foreground hover:bg-[var(--lrh-soft-blue)]/40 transition-all hover:scale-105 active:scale-95"
        >
          {isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
        </button>

        {/* Counter */}
        <div className="fixed bottom-5 right-5 z-30 text-xs tabular-nums text-foreground/60 bg-card/80 backdrop-blur border border-border rounded-full px-3 py-1">
          {index + 1} / {slides.length}
        </div>

        {/* Dots */}
        <div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-30 flex gap-2 max-w-[70vw] overflow-x-auto px-2">
          {slides.map((s, i) => (
            <button
              key={s.id}
              onClick={() => go(i)}
              aria-label={`Go to slide ${i + 1}`}
              className={cn(
                "h-1.5 rounded-full transition-all flex-shrink-0",
                i === index ? "w-8 bg-[var(--lrh-blue)]" : "w-4 bg-foreground/20 hover:bg-foreground/40",
              )}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
