import { ExternalLink, MessageSquare, MoveRight, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import type { DeckSlideDTO, HotspotDTO } from "@/server/interactiveDeck.functions";

interface Props {
  hotspot: HotspotDTO;
  onActivate: (h: HotspotDTO) => void;
  showOutline?: boolean;
  selected?: boolean;
  slides?: DeckSlideDTO[];
}

function shortDomain(raw: string): string {
  const trimmed = raw.trim();
  if (!trimmed) return "(not set)";
  try {
    const withProto = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
    const u = new URL(withProto);
    const host = u.hostname.replace(/^www\./, "");
    const path = u.pathname && u.pathname !== "/" ? u.pathname : "";
    const full = `${host}${path}`;
    return full.length > 38 ? `${full.slice(0, 37)}…` : full;
  } catch {
    return trimmed.length > 38 ? `${trimmed.slice(0, 37)}…` : trimmed;
  }
}

function actionSummary(
  h: HotspotDTO,
  slides?: DeckSlideDTO[],
): { icon: typeof Sparkles; text: string } {
  const p = (h.action_payload ?? {}) as Record<string, unknown>;
  switch (h.action_type) {
    case "open_modal":
      return { icon: MessageSquare, text: `Modal · ${String(p.title ?? "Untitled")}` };
    case "open_url":
    case "link":
      return { icon: ExternalLink, text: `URL · ${shortDomain(String(p.url ?? ""))}` };
    case "goto_slide": {
      const target = Number(p.slide ?? -1);
      const match = slides?.find(
        (s) => s.slide_index === target && s.variant === h.variant,
      );
      const title = (match?.label ?? "").replace(/^\s*\d{1,3}\s+/, "").trim();
      const text = title
        ? `Go to ${String(target + 1).padStart(2, "0")} · ${title}`
        : `Go to slide ${target + 1}`;
      return { icon: MoveRight, text };
    }
    default:
      return { icon: Sparkles, text: h.action_type };
  }
}

export function Hotspot({ hotspot, onActivate, showOutline, selected, slides }: Props) {
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
          {(() => {
            const { icon: Icon, text } = actionSummary(hotspot, slides);
            return (
              <div className="mt-0.5 flex items-center gap-1 text-muted-foreground">
                <Icon className="h-3 w-3 shrink-0" aria-hidden />
                <span>{text}</span>
              </div>
            );
          })()}
        </div>
      )}
    </div>
  );
}
