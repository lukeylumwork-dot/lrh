import { useEffect, useRef, useState } from "react";
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

const TRACKING_PARAM_RE =
  /^(utm_|mc_|hsa_|hsenc|hsctatracking|matomo_|pk_|piwik_|ga_|gclid|gclsrc|fbclid|msclkid|yclid|dclid|twclid|igshid|li_fat_id|wickedid|s_kwcid|trk|trkcampaign|ref|ref_|ref_src|ref_url|source|cmpid|campaign_id|spm)/i;
const STRIPPABLE_SUBDOMAINS = new Set(["www", "m", "mobile", "amp", "en"]);

function normalizeUrl(raw: string): { host: string; path: string; search: string; pretty: string } | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;
  try {
    const withProto = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
    const u = new URL(withProto);
    let host = u.hostname.toLowerCase();
    const parts = host.split(".");
    if (parts.length > 2 && STRIPPABLE_SUBDOMAINS.has(parts[0])) {
      host = parts.slice(1).join(".");
    } else {
      host = host.replace(/^www\./, "");
    }
    const kept: string[] = [];
    u.searchParams.forEach((v, k) => {
      if (!TRACKING_PARAM_RE.test(k)) kept.push(`${encodeURIComponent(k)}=${encodeURIComponent(v)}`);
    });
    const search = kept.length ? `?${kept.join("&")}` : "";
    const path = u.pathname && u.pathname !== "/" ? u.pathname.replace(/\/+$/, "") : "";
    return { host, path, search, pretty: `${host}${path}${search}` };
  } catch {
    return null;
  }
}

function shortDomain(raw: string): string {
  const trimmed = raw.trim();
  if (!trimmed) return "(not set)";
  try {
    const withProto = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
    const u = new URL(withProto);

    let host = u.hostname.toLowerCase();
    const parts = host.split(".");
    if (parts.length > 2 && STRIPPABLE_SUBDOMAINS.has(parts[0])) {
      host = parts.slice(1).join(".");
    } else {
      host = host.replace(/^www\./, "");
    }

    // Drop tracking params
    const kept: string[] = [];
    u.searchParams.forEach((v, k) => {
      if (!TRACKING_PARAM_RE.test(k)) kept.push(`${encodeURIComponent(k)}=${encodeURIComponent(v)}`);
    });
    const search = kept.length ? `?${kept.join("&")}` : "";

    let path = u.pathname && u.pathname !== "/" ? u.pathname.replace(/\/+$/, "") : "";
    const full = `${host}${path}${search}`;
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
      if (!Number.isFinite(target) || target < 0) {
        return { icon: MoveRight, text: "Go to slide · target not set" };
      }
      const match = slides?.find(
        (s) => s.slide_index === target && s.variant === h.variant,
      );
      const num = String(target + 1).padStart(2, "0");
      if (!match) {
        return { icon: MoveRight, text: `Go to slide ${num} · missing (target not found)` };
      }
      const title = (match.label ?? "").replace(/^\s*\d{1,3}\s+/, "").trim();
      const text = title
        ? `Go to ${num} · ${title}`
        : `Go to slide ${num} · untitled`;
      return { icon: MoveRight, text };
    }
    default:
      return { icon: Sparkles, text: h.action_type };
  }
}

export function Hotspot({ hotspot, onActivate, showOutline, selected, slides }: Props) {
  const [hovered, setHovered] = useState(false);
  const [showFull, setShowFull] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (hovered) {
      timer.current = setTimeout(() => setShowFull(true), 600);
    } else {
      if (timer.current) clearTimeout(timer.current);
      setShowFull(false);
    }
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, [hovered]);

  const fullUrl =
    hotspot.action_type === "open_url" || hotspot.action_type === "link"
      ? String((hotspot.action_payload as { url?: unknown })?.url ?? "").trim()
      : "";

  const actionColor: "url" | "goto" | "modal" | "default" =
    hotspot.action_type === "open_url" || hotspot.action_type === "link"
      ? "url"
      : hotspot.action_type === "goto_slide"
        ? "goto"
        : hotspot.action_type === "open_modal"
          ? "modal"
          : "default";

  const outlineClasses = {
    url: "border-hotspot-url/80 bg-hotspot-url/15 hover:bg-hotspot-url/30",
    goto: "border-hotspot-goto/80 bg-hotspot-goto/15 hover:bg-hotspot-goto/30",
    modal: "border-hotspot-modal/80 bg-hotspot-modal/15 hover:bg-hotspot-modal/30",
    default: "border-primary/70 bg-primary/10 hover:bg-primary/25",
  } as const;

  return (
    <div
      className="group absolute"
      style={{
        left: `${hotspot.x}%`,
        top: `${hotspot.y}%`,
        width: `${hotspot.w}%`,
        height: `${hotspot.h}%`,
      }}
      onMouseEnter={() => showOutline && setHovered(true)}
      onMouseLeave={() => setHovered(false)}
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
            ? cn("border-2", outlineClasses[actionColor])
            : "bg-transparent ring-0 hover:bg-white/10 hover:ring-2 hover:ring-white/40 hover:shadow-lg",
          selected && "ring-2 ring-primary",
        )}
      />
      {showOutline && (
        <div
          className={cn(
            "pointer-events-none absolute left-1/2 top-0 z-30 hidden -translate-x-1/2 -translate-y-[calc(100%+6px)] rounded-md border border-border bg-popover px-2 py-1 text-[11px] leading-tight text-popover-foreground shadow-md group-hover:block",
            showFull && fullUrl ? "max-w-[480px] whitespace-normal break-all" : "whitespace-nowrap",
          )}
        >
          <div className="font-medium">{hotspot.label ?? "Hotspot"}</div>
          {(() => {
            const { icon: Icon, text } = actionSummary(hotspot, slides);
            return (
              <div className="mt-0.5 flex items-start gap-1 text-muted-foreground">
                <Icon className="mt-0.5 h-3 w-3 shrink-0" aria-hidden />
                <span>{showFull && fullUrl ? `URL · ${fullUrl}` : text}</span>
              </div>
            );
          })()}
        </div>
      )}
    </div>
  );
}
