import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAnonAuth } from "@/components/interactive-deck/useAnonAuth";
import {
  getDeckBundle,
  setDeckPublic,
  upsertSlide,
  deleteSlide,
  renameSlide,
  extractSlideTitle,
  renumberDeckLabels,
  upsertHotspot,
  deleteHotspot,
  type DeckSlideDTO,
  type HotspotDTO,
  type DeckDTO,
} from "@/server/interactiveDeck.functions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { VariantToggle } from "@/components/interactive-deck/VariantToggle";
import { DeckViewer } from "@/components/interactive-deck/DeckViewer";
import { SubdomainRulesPopover } from "@/components/interactive-deck/SubdomainRulesPopover";
import { useSubdomainStripRules } from "@/lib/subdomainStripRules";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Trash2, Upload } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/interactive-deck/admin/$deckId")({
  head: () => ({ meta: [{ title: "Edit Deck" }] }),
  component: AdminPage,
});

const MAX_BYTES = 10 * 1024 * 1024;

type ActionType = "goto_slide" | "open_url" | "open_modal";

function AdminPage() {
  const { deckId } = Route.useParams();
  const { authReady, authError } = useAnonAuth();
  const [bundle, setBundle] = useState<{
    deck: DeckDTO;
    slides: DeckSlideDTO[];
    hotspots: HotspotDTO[];
  } | null>(null);
  const [variant, setVariant] = useState("Light");
  
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [placing, setPlacing] = useState(false);
  const [selectedHotspot, setSelectedHotspot] = useState<HotspotDTO | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const [subdomainRules] = useSubdomainStripRules(deckId);

  const reload = async () => {
    const b = await getDeckBundle({ data: { deckId } });
    setBundle(b);
  };

  useEffect(() => {
    if (!authReady) return;
    reload().catch((e) => setError(e instanceof Error ? e.message : String(e)));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authReady, deckId]);

  // Esc cancels hotspot placement.
  useEffect(() => {
    if (!placing) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setPlacing(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [placing]);

  const variants = useMemo(() => {
    const set = new Set<string>(["Light"]);
    bundle?.slides.forEach((s) => set.add(s.variant));
    return Array.from(set).sort();
  }, [bundle]);

  const variantSlides = useMemo(
    () =>
      (bundle?.slides ?? [])
        .filter((s) => s.variant === variant)
        .sort((a, b) => a.slide_index - b.slide_index),
    [bundle, variant],
  );

  const handleUpload = async (files: FileList | null) => {
    if (!files || files.length === 0 || !bundle) return;
    const session = await supabase.auth.getSession();
    const userId = session.data.session?.user.id;
    if (!userId) {
      setError("Not signed in");
      return;
    }
    setUploading(true);
    try {
      const startIndex =
        variantSlides.length > 0
          ? Math.max(...variantSlides.map((s) => s.slide_index)) + 1
          : 0;
      // Preserve order by sorting filenames ascending (browsers don't guarantee order).
      const sorted = Array.from(files).sort((a, b) =>
        a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: "base" }),
      );
      let idx = startIndex;
      for (const file of sorted) {
        if (file.size > MAX_BYTES) {
          toast.error(`${file.name} is over 10MB`);
          continue;
        }
        if (!file.type.startsWith("image/")) {
          toast.error(`${file.name} is not an image`);
          continue;
        }
        const ext = file.name.split(".").pop()?.toLowerCase() ?? "png";
        const path = `${userId}/${deckId}/${variant}/${idx}_${Date.now()}.${ext}`;
        const { error: upErr } = await supabase.storage
          .from("interactive-deck-slides")
          .upload(path, file, { upsert: true, contentType: file.type });
        if (upErr) {
          toast.error(`Upload failed: ${upErr.message}`);
          continue;
        }
        const { data: pub } = supabase.storage
          .from("interactive-deck-slides")
          .getPublicUrl(path);
        const { id: slideId } = await upsertSlide({
          data: {
            deckId,
            variant,
            slideIndex: idx,
            imageUrl: pub.publicUrl,
          },
        });
        // Auto-name via vision; failure is non-fatal (fallback label set server-side).
        try {
          await extractSlideTitle({
            data: { slideId, imageUrl: pub.publicUrl, slideIndex: idx },
          });
        } catch (e) {
          console.error("title extract failed", e);
        }
        idx++;
        // Light pacing to stay under the gateway rate limit on a 10-file batch.
        await new Promise((r) => setTimeout(r, 250));
      }
      await reload();
      toast.success("Slides uploaded");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : String(e));
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const handleSlideClick = async (
    e: React.MouseEvent<HTMLDivElement>,
    slideIndex: number,
  ) => {
    if (!placing || !bundle) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    try {
      const h = await upsertHotspot({
        data: {
          deckId,
          variant,
          slideIndex,
          x: Math.max(0, Math.min(100, x - 5)),
          y: Math.max(0, Math.min(100, y - 5)),
          w: 10,
          h: 10,
          actionType: "open_modal",
          actionPayload: { title: "New hotspot", body: "" },
          label: "New hotspot",
        },
      });
      setPlacing(false);
      await reload();
      setSelectedHotspot(h);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : String(err));
    }
  };

  const updateSelected = async (patch: Partial<HotspotDTO>) => {
    if (!selectedHotspot) return;
    const merged = { ...selectedHotspot, ...patch };
    try {
      const h = await upsertHotspot({
        data: {
          id: merged.id,
          deckId,
          variant: merged.variant,
          slideIndex: merged.slide_index,
          x: merged.x,
          y: merged.y,
          w: merged.w,
          h: merged.h,
          actionType: merged.action_type as ActionType,
          actionPayload: merged.action_payload,
          label: merged.label,
        },
      });
      setSelectedHotspot(h);
      await reload();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : String(err));
    }
  };

  if (authError) return <Centered>{authError}</Centered>;
  if (error) return <Centered>{error}</Centered>;
  if (!authReady || !bundle) return <Centered>Loading…</Centered>;

  return (
    <div className="min-h-screen bg-background">
      <header className="flex flex-wrap items-center justify-between gap-3 border-b px-6 py-3">
        <div className="flex flex-wrap items-center gap-3">
          <Button asChild variant="ghost" size="sm">
            <Link to="/interactive-deck">← Decks</Link>
          </Button>
          <h1 className="text-base font-medium">{bundle.deck.title}</h1>
          <Button asChild variant="outline" size="sm">
            <Link
              to="/interactive-deck/$deckId"
              params={{ deckId: bundle.deck.id }}
            >
              View deck
            </Link>
          </Button>
          <Button
            variant={bundle.deck.is_public ? "default" : "outline"}
            size="sm"
            onClick={async () => {
              try {
                const d = await setDeckPublic({
                  data: { deckId: bundle.deck.id, isPublic: !bundle.deck.is_public },
                });
                setBundle((b) => (b ? { ...b, deck: d } : b));
                toast.success(d.is_public ? "Deck is now public" : "Deck is now private");
              } catch (e) {
                toast.error(e instanceof Error ? e.message : String(e));
              }
            }}
          >
            {bundle.deck.is_public ? "Public" : "Private"}
          </Button>
          {bundle.deck.is_public && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                const url = `${window.location.origin}/deck/${bundle.deck.id}`;
                navigator.clipboard.writeText(url);
                toast.success("Public link copied");
              }}
            >
              Copy public link
            </Button>
          )}
        </div>
        {variants.length > 1 && (
          <VariantToggle
            variants={variants}
            current={variant}
            onChange={setVariant}
          />
        )}
      </header>

      <div className="grid gap-6 p-6 lg:grid-cols-[1fr_320px]">
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <Button
              onClick={() => fileRef.current?.click()}
              disabled={uploading}
            >
              <Upload className="mr-2 h-4 w-4" />
              {uploading ? "Uploading…" : "Upload slides"}
            </Button>
            <input
              ref={fileRef}
              type="file"
              multiple
              accept="image/*"
              className="hidden"
              onChange={(e) => handleUpload(e.target.files)}
            />
            <Button
              variant={placing ? "default" : "outline"}
              onClick={() => setPlacing((p) => !p)}
            >
              {placing ? "Click slide to place…" : "Add hotspot"}
            </Button>
            <Button
              variant="outline"
              onClick={async () => {
                try {
                  await renumberDeckLabels({ data: { deckId, variant } });
                  await reload();
                  toast.success("Slide labels renumbered");
                } catch (e) {
                  toast.error(e instanceof Error ? e.message : String(e));
                }
              }}
            >
              Renumber labels
            </Button>
            <SubdomainRulesPopover deckId={deckId} />
          </div>

          <div className={placing ? "cursor-crosshair" : undefined}>
            <DeckViewer
              slides={bundle.slides}
              hotspots={bundle.hotspots}
              variant={variant}
              showHotspotOutlines
              onSlideClick={handleSlideClick}
              onHotspotClick={(h) => setSelectedHotspot(h)}
              selectedHotspotId={selectedHotspot?.id ?? null}
              subdomainRules={subdomainRules}
            />
          </div>

          <SlidesList
            slides={variantSlides}
            onDelete={async (id) => {
              await deleteSlide({ data: { slideId: id } });
              await reload();
            }}
            onRename={async (id, label) => {
              await renameSlide({ data: { slideId: id, label } });
              await reload();
            }}
          />
        </div>

        <aside className="rounded-md border p-4">
          {selectedHotspot ? (
            <HotspotEditor
              hotspot={selectedHotspot}
              onChange={updateSelected}
              onDelete={async () => {
                await deleteHotspot({
                  data: { hotspotId: selectedHotspot.id },
                });
                setSelectedHotspot(null);
                await reload();
              }}
            />
          ) : (
            <p className="text-sm text-muted-foreground">
              Click a hotspot to edit it, or use “Add hotspot” to place a new one.
            </p>
          )}
        </aside>
      </div>
    </div>
  );
}

function SlidesList({
  slides,
  onDelete,
  onRename,
}: {
  slides: DeckSlideDTO[];
  onDelete: (id: string) => Promise<void>;
  onRename: (id: string, label: string) => Promise<void>;
}) {
  if (slides.length === 0) return null;
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
      {slides.map((s) => (
        <SlideCard key={s.id} slide={s} onDelete={onDelete} onRename={onRename} />
      ))}
    </div>
  );
}

function SlideCard({
  slide,
  onDelete,
  onRename,
}: {
  slide: DeckSlideDTO;
  onDelete: (id: string) => Promise<void>;
  onRename: (id: string, label: string) => Promise<void>;
}) {
  const [label, setLabel] = useState(slide.label ?? "");
  useEffect(() => {
    setLabel(slide.label ?? "");
  }, [slide.label]);
  return (
    <div className="space-y-1">
      <div
        className="relative overflow-hidden rounded border bg-muted"
        style={{ aspectRatio: "16 / 9" }}
      >
        <img
          src={slide.image_url}
          alt={slide.label ?? `Slide ${slide.slide_index + 1}`}
          className="h-full w-full object-cover"
        />
        <span className="absolute left-1 top-1 rounded bg-black/60 px-1 text-[10px] text-white">
          {slide.slide_index + 1}
        </span>
        <button
          onClick={() => onDelete(slide.id)}
          className="absolute right-1 top-1 rounded bg-black/60 p-1 text-white hover:bg-destructive"
          aria-label="Delete slide"
        >
          <Trash2 className="h-3 w-3" />
        </button>
      </div>
      <Input
        value={label}
        onChange={(e) => setLabel(e.target.value)}
        onBlur={() => {
          if ((slide.label ?? "") !== label) void onRename(slide.id, label);
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter") (e.target as HTMLInputElement).blur();
        }}
        placeholder={`Slide ${slide.slide_index + 1}`}
        className="h-7 text-xs"
      />
    </div>
  );
}

function HotspotEditor({
  hotspot,
  onChange,
  onDelete,
}: {
  hotspot: HotspotDTO;
  onChange: (patch: Partial<HotspotDTO>) => void;
  onDelete: () => void;
}) {
  const payload = hotspot.action_payload as Record<string, any>;
  return (
    <div className="space-y-3 text-sm">
      <div className="flex items-center justify-between">
        <h3 className="font-medium">Hotspot</h3>
        <Button size="sm" variant="ghost" onClick={onDelete}>
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>

      <div className="space-y-1">
        <Label>Admin label</Label>
        <Input
          value={hotspot.label ?? ""}
          onChange={(e) => onChange({ label: e.target.value })}
        />
      </div>

      <div className="grid grid-cols-2 gap-2">
        {(["x", "y", "w", "h"] as const).map((k) => (
          <div key={k} className="space-y-1">
            <Label className="uppercase">{k} %</Label>
            <Input
              type="number"
              step="0.1"
              value={hotspot[k]}
              onChange={(e) =>
                onChange({ [k]: Number(e.target.value) } as Partial<HotspotDTO>)
              }
            />
          </div>
        ))}
      </div>

      <div className="space-y-1">
        <Label>Hotspot action</Label>
        <Select
          value={hotspot.action_type}
          onValueChange={(v) =>
            onChange({ action_type: v, action_payload: {} })
          }
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="open_modal">Open modal</SelectItem>
            <SelectItem value="open_url">Open external URL</SelectItem>
            <SelectItem value="goto_slide">Go to slide</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {hotspot.action_type === "open_modal" && (
        <>
          <div className="space-y-1">
            <Label>Modal title</Label>
            <Input
              value={String(payload?.title ?? "")}
              onChange={(e) =>
                onChange({
                  action_payload: { ...payload, title: e.target.value },
                })
              }
            />
          </div>
          <div className="space-y-1">
            <Label>Modal body</Label>
            <textarea
              className="w-full rounded-md border bg-background p-2 text-sm"
              rows={4}
              value={String(payload?.body ?? "")}
              onChange={(e) =>
                onChange({
                  action_payload: { ...payload, body: e.target.value },
                })
              }
            />
          </div>
        </>
      )}

      {hotspot.action_type === "open_url" && (
        <div className="space-y-1">
          <Label>URL</Label>
          <Input
            value={String(payload?.url ?? "")}
            onChange={(e) =>
              onChange({ action_payload: { url: e.target.value } })
            }
          />
          <p className="text-xs text-muted-foreground">
            Example: https://londonreportinghouse.com or www.google.com
          </p>
        </div>
      )}

      {hotspot.action_type === "goto_slide" && (
        <div className="space-y-1">
          <Label>Target slide index (0-based)</Label>
          <Input
            type="number"
            value={Number(payload?.slide ?? 0)}
            onChange={(e) =>
              onChange({
                action_payload: { slide: Number(e.target.value) },
              })
            }
          />
        </div>
      )}
    </div>
  );
}

function Centered({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen items-center justify-center text-sm text-muted-foreground">
      {children}
    </div>
  );
}
