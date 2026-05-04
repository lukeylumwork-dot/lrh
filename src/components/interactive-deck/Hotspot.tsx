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
      onClick={(e) => {
        e.stopPropagation();
        onActivate(hotspot);
      }}
      className={cn(
        "absolute cursor-pointer transition-colors",
        showOutline
          ? "border-2 border-primary/70 bg-primary/10 hover:bg-primary/20"
          : "bg-transparent hover:bg-primary/10",
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
