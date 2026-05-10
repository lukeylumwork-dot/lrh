import { useEffect, useMemo, useRef, useState } from "react";
import type { DeckSlideDTO, HotspotDTO } from "@/server/interactiveDeck.functions";
import { Hotspot } from "./Hotspot";
import { HotspotModal } from "./HotspotModal";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Keyboard, Presentation, X } from "lucide-react";

interface Props {
  slides: DeckSlideDTO[];
  hotspots: HotspotDTO[];
  variant: string;
  showHotspotOutlines?: boolean;
  onSlideClick?: (e: React.MouseEvent<HTMLDivElement>, slideIndex: number) => void;
  onHotspotClick?: (h: HotspotDTO) => void;
  selectedHotspotId?: string | null;
}

export function DeckViewer({
  slides,
  hotspots,
  variant,
  showHotspotOutlines,
  onSlideClick,
  onHotspotClick,
  selectedHotspotId,
}: Props) {
  const variantSlides = useMemo(
    () =>
      slides
        .filter((s) => s.variant === variant)
        .sort((a, b) => a.slide_index - b.slide_index),
    [slides, variant],
  );

  const [index, setIndex] = useState(0);
  const [modal, setModal] = useState<{ title: string; body: string } | null>(null);
  const [direction, setDirection] = useState<1 | -1>(1);
  const [presenter, setPresenter] = useState(false);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const touchStart = useRef<{ x: number; y: number; t: number } | null>(null);

  useEffect(() => {
    setIndex(0);
  }, [variant]);

  const goNext = () =>
    setIndex((i) => {
      const next = Math.min(i + 1, variantSlides.length - 1);
      if (next !== i) setDirection(1);
      return next;
    });
  const goPrev = () =>
    setIndex((i) => {
      const next = Math.max(i - 1, 0);
      if (next !== i) setDirection(-1);
      return next;
    });

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement | null)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;
      if (e.key === "ArrowRight" || e.key === " " || e.key === "PageDown") {
        e.preventDefault();
        goNext();
      } else if (e.key === "ArrowLeft" || e.key === "PageUp") {
        e.preventDefault();
        goPrev();
      } else if (e.key === "Home") {
        e.preventDefault();
        setDirection(-1);
        setIndex(0);
      } else if (e.key === "End") {
        e.preventDefault();
        setDirection(1);
        setIndex(Math.max(0, variantSlides.length - 1));
      } else if (e.key === "p" || e.key === "P") {
        e.preventDefault();
        setPresenter((v) => !v);
      } else if (e.key === "?" || (e.shiftKey && e.key === "/")) {
        e.preventDefault();
        setShowShortcuts((v) => !v);
      } else if (e.key === "Escape") {
        setShowShortcuts(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [variantSlides.length]);

  const onTouchStart = (e: React.TouchEvent) => {
    const t = e.touches[0];
    touchStart.current = { x: t.clientX, y: t.clientY, t: Date.now() };
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    const start = touchStart.current;
    touchStart.current = null;
    if (!start) return;
    const t = e.changedTouches[0];
    const dx = t.clientX - start.x;
    const dy = t.clientY - start.y;
    const dt = Date.now() - start.t;
    if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.5 && dt < 600) {
      if (dx < 0) goNext();
      else goPrev();
    }
  };

  if (variantSlides.length === 0) {
    return (
      <div className="flex aspect-video w-full max-w-6xl items-center justify-center rounded-lg border bg-muted/30 text-muted-foreground">
        No slides uploaded for "{variant}" yet.
      </div>
    );
  }

  const current = variantSlides[index];
  const nextSlide =
    index < variantSlides.length - 1 ? variantSlides[index + 1] : null;
  const currentHotspots = hotspots.filter(
    (h) => h.variant === variant && h.slide_index === current.slide_index,
  );

  const handleHotspot = (h: HotspotDTO) => {
    if (onHotspotClick) {
      onHotspotClick(h);
      return;
    }
    if (h.action_type === "goto_slide") {
      const target = Number((h.action_payload as { slide?: unknown })?.slide);
      if (Number.isFinite(target)) {
        const i = variantSlides.findIndex((s) => s.slide_index === target);
        if (i >= 0) {
          setDirection(i > index ? 1 : -1);
          setIndex(i);
        }
      }
    } else if (h.action_type === "open_url" || h.action_type === "link") {
      const raw = String((h.action_payload as { url?: unknown })?.url ?? "").trim();
      if (raw) {
        const url = /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;
        window.open(url, "_blank", "noopener,noreferrer");
      }
    } else if (h.action_type === "open_modal") {
      const p = h.action_payload as { title?: string; body?: string };
      setModal({ title: p?.title ?? h.label ?? "Details", body: p?.body ?? "" });
    }
  };

  return (
    <div className="flex w-full flex-col items-center gap-4">
      <div
        className="relative w-full max-w-6xl select-none overflow-hidden rounded-lg border bg-black"
        style={{ aspectRatio: "16 / 9" }}
        onClick={(e) => onSlideClick?.(e, current.slide_index)}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        <div
          key={`${variant}-${current.id}`}
          className="absolute inset-0 animate-in fade-in duration-300"
          style={{
            animationName: direction === 1 ? "slide-in-right" : "slide-in-left",
          }}
        >
          <img
            src={current.image_url}
            alt={`Slide ${current.slide_index + 1}`}
            className="absolute inset-0 h-full w-full object-contain"
            draggable={false}
          />
          {currentHotspots.map((h) => (
            <Hotspot
              key={h.id}
              hotspot={h}
              onActivate={handleHotspot}
              showOutline={showHotspotOutlines}
              selected={selectedHotspotId === h.id}
            />
          ))}
        </div>

        {/* Edge arrow overlays — visible in normal & fullscreen */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            goPrev();
          }}
          disabled={index === 0}
          aria-label="Previous slide"
          className="group absolute left-0 top-0 z-20 flex h-full w-[12%] items-center justify-start pl-3 opacity-0 transition-opacity hover:opacity-100 focus:opacity-100 disabled:pointer-events-none"
        >
          <span className="flex h-11 w-11 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-sm transition-transform group-hover:scale-110">
            <ChevronLeft className="h-6 w-6" />
          </span>
        </button>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            goNext();
          }}
          disabled={index === variantSlides.length - 1}
          aria-label="Next slide"
          className="group absolute right-0 top-0 z-20 flex h-full w-[12%] items-center justify-end pr-3 opacity-0 transition-opacity hover:opacity-100 focus:opacity-100 disabled:pointer-events-none"
        >
          <span className="flex h-11 w-11 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-sm transition-transform group-hover:scale-110">
            <ChevronRight className="h-6 w-6" />
          </span>
        </button>

        {/* Slide counter pill (no thumbnails) */}
        <div className="pointer-events-none absolute bottom-3 right-3 z-20 rounded-full bg-black/60 px-3 py-1 text-xs tabular-nums text-white backdrop-blur-sm">
          {index + 1} / {variantSlides.length}
        </div>
      </div>

      <div className="flex w-full max-w-6xl items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={goPrev}
            disabled={index === 0}
            aria-label="Previous slide"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm tabular-nums text-muted-foreground">
            {index + 1} / {variantSlides.length}
          </span>
          <Button
            variant="outline"
            size="icon"
            onClick={goNext}
            disabled={index === variantSlides.length - 1}
            aria-label="Next slide"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant={presenter ? "default" : "outline"}
            size="sm"
            onClick={() => setPresenter((v) => !v)}
            aria-pressed={presenter}
            title="Toggle presenter view (P)"
          >
            <Presentation className="mr-2 h-4 w-4" />
            Presenter
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setShowShortcuts((v) => !v)}
            aria-label="Keyboard shortcuts"
            title="Shortcuts (?)"
          >
            <Keyboard className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {presenter && (
        <div className="grid w-full max-w-6xl grid-cols-1 gap-4 rounded-lg border bg-muted/30 p-4 md:grid-cols-[2fr_1fr]">
          <div>
            <div className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Current — slide {index + 1}
            </div>
            <div className="relative overflow-hidden rounded border bg-black" style={{ aspectRatio: "16 / 9" }}>
              <img
                src={current.image_url}
                alt="Current slide"
                className="absolute inset-0 h-full w-full object-contain"
                draggable={false}
              />
            </div>
          </div>
          <div>
            <div className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
              {nextSlide ? `Next — slide ${index + 2}` : "End of deck"}
            </div>
            <div className="relative overflow-hidden rounded border bg-black" style={{ aspectRatio: "16 / 9" }}>
              {nextSlide ? (
                <img
                  src={nextSlide.image_url}
                  alt="Next slide"
                  className="absolute inset-0 h-full w-full object-contain"
                  draggable={false}
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-xs text-white/60">
                  No more slides
                </div>
              )}
            </div>
            <div className="mt-3 rounded border bg-background/60 p-3 text-xs text-muted-foreground">
              <div className="mb-1 font-medium text-foreground">Shortcuts</div>
              <div>← / → · Space — navigate</div>
              <div>Home / End — first / last</div>
              <div>P — toggle presenter · ? — shortcuts</div>
            </div>
          </div>
        </div>
      )}

      {showShortcuts && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
          onClick={() => setShowShortcuts(false)}
        >
          <div
            className="w-full max-w-md rounded-lg border bg-background p-5 shadow-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-sm font-semibold">Keyboard shortcuts</h3>
              <Button variant="ghost" size="icon" onClick={() => setShowShortcuts(false)} aria-label="Close">
                <X className="h-4 w-4" />
              </Button>
            </div>
            <ul className="space-y-2 text-sm">
              <ShortcutRow keys={["→", "Space", "PgDn"]} label="Next slide" />
              <ShortcutRow keys={["←", "PgUp"]} label="Previous slide" />
              <ShortcutRow keys={["Home"]} label="First slide" />
              <ShortcutRow keys={["End"]} label="Last slide" />
              <ShortcutRow keys={["P"]} label="Toggle presenter view" />
              <ShortcutRow keys={["?"]} label="Show this panel" />
              <ShortcutRow keys={["Esc"]} label="Close panel" />
            </ul>
          </div>
        </div>
      )}

      <HotspotModal
        open={modal !== null}
        onOpenChange={(o) => !o && setModal(null)}
        title={modal?.title ?? ""}
        body={modal?.body ?? ""}
      />
    </div>
  );
}

function ShortcutRow({ keys, label }: { keys: string[]; label: string }) {
  return (
    <li className="flex items-center justify-between gap-4">
      <span className="text-muted-foreground">{label}</span>
      <span className="flex gap-1">
        {keys.map((k) => (
          <kbd
            key={k}
            className="rounded border bg-muted px-1.5 py-0.5 font-mono text-[11px] text-foreground"
          >
            {k}
          </kbd>
        ))}
      </span>
    </li>
  );
}
