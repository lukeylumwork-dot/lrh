import { useEffect, useMemo, useState } from "react";
import type { DeckSlideDTO, HotspotDTO } from "@/server/interactiveDeck.functions";
import { Hotspot } from "./Hotspot";
import { HotspotModal } from "./HotspotModal";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

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

  useEffect(() => {
    setIndex(0);
  }, [variant]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === " ") {
        setIndex((i) => Math.min(i + 1, variantSlides.length - 1));
      } else if (e.key === "ArrowLeft") {
        setIndex((i) => Math.max(i - 1, 0));
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [variantSlides.length]);

  if (variantSlides.length === 0) {
    return (
      <div className="flex aspect-video w-full max-w-6xl items-center justify-center rounded-lg border bg-muted/30 text-muted-foreground">
        No slides uploaded for "{variant}" yet.
      </div>
    );
  }

  const current = variantSlides[index];
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
        if (i >= 0) setIndex(i);
      }
    } else if (h.action_type === "open_url") {
      const url = String((h.action_payload as { url?: unknown })?.url ?? "");
      if (url) window.open(url, "_blank", "noopener,noreferrer");
    } else if (h.action_type === "open_modal") {
      const p = h.action_payload as { title?: string; body?: string };
      setModal({ title: p?.title ?? h.label ?? "Details", body: p?.body ?? "" });
    }
  };

  return (
    <div className="flex w-full flex-col items-center gap-4">
      <div
        className="relative w-full max-w-6xl overflow-hidden rounded-lg border bg-black"
        style={{ aspectRatio: "16 / 9" }}
        onClick={(e) => onSlideClick?.(e, current.slide_index)}
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

      <div className="flex items-center gap-3">
        <Button
          variant="outline"
          size="icon"
          onClick={() => setIndex((i) => Math.max(i - 1, 0))}
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
          onClick={() =>
            setIndex((i) => Math.min(i + 1, variantSlides.length - 1))
          }
          disabled={index === variantSlides.length - 1}
          aria-label="Next slide"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      <HotspotModal
        open={modal !== null}
        onOpenChange={(o) => !o && setModal(null)}
        title={modal?.title ?? ""}
        body={modal?.body ?? ""}
      />
    </div>
  );
}
