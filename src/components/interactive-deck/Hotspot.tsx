import { cn } from "@/lib/utils";
import type { HotspotDTO } from "@/server/interactiveDeck.functions";

interface Props {
  hotspot: HotspotDTO;
  onActivate: (h: HotspotDTO) => void;
  showOutline?: boolean;
  selected?: boolean;
}

export function Hotspot({ hotspot, onActivate, showOutline, selected }: Props) {
  return (
    <button
      type="button"
      aria-label={hotspot.label ?? "Hotspot"}
      title={hotspot.label ?? undefined}
      onClick={(e) => {
        e.stopPropagation();
        onActivate(hotspot);
      }}
      className={cn(
        "absolute cursor-pointer rounded-sm transition-all duration-150",
        showOutline
          ? "border-2 border-primary/70 bg-primary/10 hover:bg-primary/25"
          : "bg-transparent ring-0 hover:bg-white/10 hover:ring-2 hover:ring-white/40 hover:shadow-lg",
        selected && "ring-2 ring-primary",
      )}
      style={{
        left: `${hotspot.x}%`,
        top: `${hotspot.y}%`,
        width: `${hotspot.w}%`,
        height: `${hotspot.h}%`,
      }}
    />
  );
}
