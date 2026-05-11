import { cn } from "@/lib/utils";
import type { HotspotDTO } from "@/server/interactiveDeck.functions";

interface Props {
  hotspot: HotspotDTO;
  onActivate: (h: HotspotDTO) => void;
  showOutline?: boolean;
  selected?: boolean;
}

function actionSummary(h: HotspotDTO): string {
  const p = (h.action_payload ?? {}) as Record<string, unknown>;
  switch (h.action_type) {
    case "open_modal":
      return `Modal · ${String(p.title ?? "Untitled")}`;
    case "open_url":
    case "link":
      return `URL · ${String(p.url ?? "(not set)")}`;
    case "goto_slide":
      return `Go to slide ${Number(p.slide ?? 0) + 1}`;
    default:
      return h.action_type;
  }
}

export function Hotspot({ hotspot, onActivate, showOutline, selected }: Props) {
  return (
    <div
      className="group absolute"
      style={{
        left: `${hotspot.x}%`,
        top: `${hotspot.y}%`,
        width: `${hotspot.w}%`,
        height: `${hotspot.h}%`,
      }}
    >
      <button
        type="button"
        aria-label={hotspot.label ?? "Hotspot"}
        title={showOutline ? undefined : (hotspot.label ?? undefined)}
        onClick={(e) => {
          e.stopPropagation();
          onActivate(hotspot);
        }}
        className={cn(
          "absolute inset-0 cursor-pointer rounded-sm transition-all duration-150",
          showOutline
            ? "border-2 border-primary/70 bg-primary/10 hover:bg-primary/25"
            : "bg-transparent ring-0 hover:bg-white/10 hover:ring-2 hover:ring-white/40 hover:shadow-lg",
          selected && "ring-2 ring-primary",
        )}
      />
      {showOutline && (
        <div
          className="pointer-events-none absolute left-1/2 top-0 z-30 hidden -translate-x-1/2 -translate-y-[calc(100%+6px)] whitespace-nowrap rounded-md border border-border bg-popover px-2 py-1 text-[11px] leading-tight text-popover-foreground shadow-md group-hover:block"
        >
          <div className="font-medium">{hotspot.label ?? "Hotspot"}</div>
          <div className="text-muted-foreground">{actionSummary(hotspot)}</div>
        </div>
      )}
    </div>
  );
}
