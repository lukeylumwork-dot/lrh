import { Eye, EyeOff, X } from "lucide-react";
import { useEditor } from "./EditorContext";
import { cn } from "@/lib/utils";
import type { Block, DeckKind } from "./types";

interface Props {
  deckKind: DeckKind;
  slideKey: string;
  blocks: Block[];
  defaults: { blocks: Block[] };
  highlightKeyword: string | null;
  layoutVariant: string | null;
  layoutOptions?: { value: string; label: string }[];
}

// Inline color picker + text input + clear button.
function ColorField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string | undefined;
  onChange: (v: string | undefined) => void;
}) {
  return (
    <div>
      <label className="block text-[10px] text-foreground/50 mb-1">{label}</label>
      <div className="flex items-center gap-1">
        <input
          type="color"
          value={value ?? "#ffffff"}
          onChange={(e) => onChange(e.target.value)}
          className="h-7 w-7 shrink-0 rounded border border-border cursor-pointer p-0.5 bg-background"
        />
        <input
          type="text"
          value={value ?? ""}
          onChange={(e) => onChange(e.target.value || undefined)}
          placeholder="inherit"
          className="flex-1 h-7 rounded border border-border bg-background px-2 text-xs outline-none focus:border-[var(--lrh-blue)]"
        />
        {value && (
          <button
            onClick={() => onChange(undefined)}
            className="text-foreground/40 hover:text-foreground"
            aria-label="Clear color"
          >
            <X size={10} />
          </button>
        )}
      </div>
    </div>
  );
}

export function EditorSidePanel({
  deckKind,
  slideKey,
  blocks,
  defaults,
  highlightKeyword,
  layoutVariant,
  layoutOptions,
}: Props) {
  const { editing, selectedBlockId, setSelectedBlockId, updateBlock, updateOverride } = useEditor();
  if (!editing) return null;

  const selected = blocks.find((b) => b.id === selectedBlockId) ?? null;

  const isTextual =
    selected !== null &&
    (selected.kind === "title" ||
      selected.kind === "text" ||
      selected.kind === "bullets" ||
      selected.kind === "eyebrow");

  function upd(patch: Partial<Block>) {
    if (!selected) return;
    updateBlock(deckKind, slideKey, selected.id, patch, defaults);
  }

  return (
    <aside className="fixed top-16 right-4 bottom-4 w-72 z-40 bg-card border border-border rounded-lg shadow-lg flex flex-col overflow-hidden">
      <header className="px-3 py-2.5 border-b border-border flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-foreground/70">
          Slide structure
        </span>
      </header>

      <div className="flex-1 overflow-y-auto px-3 py-3 space-y-4 text-sm">
        {/* Highlight keyword */}
        <div>
          <label className="block text-[11px] uppercase tracking-wider text-foreground/50 mb-1.5">
            Highlighted keyword
          </label>
          <input
            value={highlightKeyword ?? ""}
            onChange={(e) =>
              updateOverride(
                deckKind,
                slideKey,
                { highlightKeyword: e.target.value || null },
                defaults,
              )
            }
            placeholder="e.g. data layer"
            className="w-full h-8 rounded border border-border bg-background px-2 text-sm outline-none focus:border-[var(--lrh-blue)]"
          />
          <p className="text-[10px] text-foreground/45 mt-1">
            First match in titles & body text is colored brand blue.
          </p>
        </div>

        {/* Layout variant */}
        {layoutOptions && layoutOptions.length > 0 && (
          <div>
            <label className="block text-[11px] uppercase tracking-wider text-foreground/50 mb-1.5">
              Layout
            </label>
            <select
              value={layoutVariant ?? layoutOptions[0].value}
              onChange={(e) =>
                updateOverride(deckKind, slideKey, { layoutVariant: e.target.value }, defaults)
              }
              className="w-full h-8 rounded border border-border bg-background px-2 text-sm outline-none focus:border-[var(--lrh-blue)]"
            >
              {layoutOptions.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Block list */}
        <div>
          <label className="block text-[11px] uppercase tracking-wider text-foreground/50 mb-1.5">
            Blocks
          </label>
          <ul className="space-y-1">
            {blocks.map((b) => {
              const isSel = b.id === selectedBlockId;
              const preview =
                b.kind === "image"
                  ? (b.imageUrl ?? "(no image)")
                  : b.kind === "region"
                    ? (b.regionId ?? b.id)
                    : b.kind === "card"
                      ? b.id
                      : b.kind === "bullets"
                        ? (b.bullets ?? []).slice(0, 1).join("") || "(empty)"
                        : b.text || "(empty)";
              return (
                <li key={b.id}>
                  <button
                    onClick={() => setSelectedBlockId(b.id)}
                    className={cn(
                      "w-full text-left px-2 py-1.5 rounded text-xs flex items-center justify-between gap-2 border",
                      isSel
                        ? "bg-[var(--lrh-blue)]/10 border-[var(--lrh-blue)]/40"
                        : "border-transparent hover:bg-muted",
                    )}
                  >
                    <span className="flex flex-col items-start min-w-0">
                      <span className="text-[10px] uppercase text-foreground/45">{b.kind}</span>
                      <span className="truncate w-48 text-foreground/80">{preview}</span>
                    </span>
                    <span
                      role="button"
                      tabIndex={0}
                      onClick={(e) => {
                        e.stopPropagation();
                        updateBlock(deckKind, slideKey, b.id, { hidden: !b.hidden }, defaults);
                      }}
                      className="p-1 rounded hover:bg-background/60 text-foreground/60"
                      aria-label={b.hidden ? "Show block" : "Hide block"}
                    >
                      {b.hidden ? <EyeOff size={12} /> : <Eye size={12} />}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>

        {/* Selected block detail */}
        {selected && (
          <div className="border-t border-border pt-3 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] uppercase tracking-wider text-foreground/50">
                Selected: <span className="text-foreground/70">{selected.id}</span>
              </span>
              <button
                onClick={() => setSelectedBlockId(null)}
                className="text-foreground/40 hover:text-foreground"
                aria-label="Deselect"
              >
                <X size={14} />
              </button>
            </div>

            {/* Text alignment — textual blocks only */}
            {isTextual && (
              <div>
                <label className="block text-[10px] text-foreground/50 mb-1">Alignment</label>
                <div className="flex gap-1">
                  {(["left", "center", "right"] as const).map((a) => (
                    <button
                      key={a}
                      onClick={() => upd({ align: a })}
                      className={cn(
                        "flex-1 h-7 rounded border text-[11px] capitalize",
                        (selected.align ?? "left") === a
                          ? "bg-[var(--lrh-blue)] text-white border-transparent"
                          : "border-border text-foreground/70 hover:bg-muted",
                      )}
                    >
                      {a}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Position & size — x, y resize the block; w, h resize the container only */}
            <div>
              <label className="block text-[10px] text-foreground/50 mb-1">
                Position &amp; size
              </label>
              <div className="grid grid-cols-2 gap-2 text-[11px]">
                {(["x", "y", "w", "h"] as const).map((k) => (
                  <label key={k} className="flex items-center gap-1.5">
                    <span className="uppercase text-foreground/50 w-4">{k}</span>
                    <input
                      type="number"
                      value={Math.round(selected[k])}
                      onChange={(e) => upd({ [k]: Number(e.target.value) })}
                      className="flex-1 h-7 rounded border border-border bg-background px-1.5 text-xs outline-none focus:border-[var(--lrh-blue)]"
                    />
                  </label>
                ))}
              </div>
              <p className="text-[10px] text-foreground/40 mt-1">
                w/h resize the box; font size controls text size separately.
              </p>
            </div>

            {/* Typography — only for textual blocks */}
            {isTextual && (
              <div className="space-y-2">
                <label className="block text-[10px] text-foreground/50 uppercase tracking-wider">
                  Typography
                </label>

                <label className="flex items-center gap-1.5 text-[11px]">
                  <span className="text-foreground/50 w-14 shrink-0">Font size</span>
                  <input
                    type="number"
                    min={6}
                    max={300}
                    step={1}
                    value={selected.fontSize ?? ""}
                    placeholder="default"
                    onChange={(e) =>
                      upd({ fontSize: e.target.value ? Number(e.target.value) : undefined })
                    }
                    className="flex-1 h-7 rounded border border-border bg-background px-1.5 text-xs outline-none focus:border-[var(--lrh-blue)]"
                  />
                  <span className="text-foreground/40 text-[10px]">px</span>
                </label>

                <label className="flex items-center gap-1.5 text-[11px]">
                  <span className="text-foreground/50 w-14 shrink-0">Weight</span>
                  <select
                    value={String(selected.fontWeight ?? "")}
                    onChange={(e) =>
                      upd({
                        fontWeight: e.target.value ? Number(e.target.value) : undefined,
                      })
                    }
                    className="flex-1 h-7 rounded border border-border bg-background px-1.5 text-xs outline-none focus:border-[var(--lrh-blue)]"
                  >
                    <option value="">Default</option>
                    <option value="400">400 Regular</option>
                    <option value="500">500 Medium</option>
                    <option value="600">600 SemiBold</option>
                    <option value="700">700 Bold</option>
                    <option value="800">800 ExtraBold</option>
                  </select>
                </label>

                <ColorField
                  label="Text color"
                  value={selected.color}
                  onChange={(v) => upd({ color: v })}
                />
              </div>
            )}

            {/* Image URL — for image blocks */}
            {selected.kind === "image" && (
              <div>
                <label className="block text-[10px] text-foreground/50 mb-1">Image URL</label>
                <input
                  value={selected.imageUrl ?? ""}
                  onChange={(e) => upd({ imageUrl: e.target.value || null })}
                  className="w-full h-7 rounded border border-border bg-background px-2 text-xs outline-none focus:border-[var(--lrh-blue)]"
                />
              </div>
            )}

            {/* Box style — all blocks */}
            <div className="space-y-2">
              <label className="block text-[10px] text-foreground/50 uppercase tracking-wider">
                Box
              </label>

              <ColorField
                label="Background"
                value={selected.backgroundColor}
                onChange={(v) => upd({ backgroundColor: v })}
              />

              <ColorField
                label="Border color"
                value={selected.borderColor}
                onChange={(v) => upd({ borderColor: v })}
              />

              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <label className="flex items-center gap-1.5">
                  <span className="text-foreground/50 text-[10px] w-10 shrink-0">Radius</span>
                  <input
                    type="number"
                    min={0}
                    step={1}
                    value={selected.borderRadius ?? ""}
                    placeholder="0"
                    onChange={(e) =>
                      upd({ borderRadius: e.target.value ? Number(e.target.value) : undefined })
                    }
                    className="flex-1 h-7 rounded border border-border bg-background px-1.5 text-xs outline-none focus:border-[var(--lrh-blue)]"
                  />
                </label>
                <label className="flex items-center gap-1.5">
                  <span className="text-foreground/50 text-[10px] w-10 shrink-0">Pad</span>
                  <input
                    type="number"
                    min={0}
                    step={1}
                    value={selected.padding ?? ""}
                    placeholder="0"
                    onChange={(e) =>
                      upd({ padding: e.target.value ? Number(e.target.value) : undefined })
                    }
                    className="flex-1 h-7 rounded border border-border bg-background px-1.5 text-xs outline-none focus:border-[var(--lrh-blue)]"
                  />
                </label>
              </div>
            </div>

            {/* Layer — opacity, z-index */}
            <div className="space-y-2">
              <label className="block text-[10px] text-foreground/50 uppercase tracking-wider">
                Layer
              </label>
              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <label className="flex items-center gap-1.5">
                  <span className="text-foreground/50 text-[10px] w-10 shrink-0">Opacity</span>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    step={1}
                    value={selected.opacity !== undefined ? Math.round(selected.opacity * 100) : ""}
                    placeholder="100"
                    onChange={(e) =>
                      upd({
                        opacity: e.target.value ? Number(e.target.value) / 100 : undefined,
                      })
                    }
                    className="flex-1 h-7 rounded border border-border bg-background px-1.5 text-xs outline-none focus:border-[var(--lrh-blue)]"
                  />
                  <span className="text-foreground/40 text-[10px]">%</span>
                </label>
                <label className="flex items-center gap-1.5">
                  <span className="text-foreground/50 text-[10px] w-10 shrink-0">Z-index</span>
                  <input
                    type="number"
                    step={1}
                    value={selected.zIndex ?? ""}
                    placeholder="auto"
                    onChange={(e) =>
                      upd({ zIndex: e.target.value ? Number(e.target.value) : undefined })
                    }
                    className="flex-1 h-7 rounded border border-border bg-background px-1.5 text-xs outline-none focus:border-[var(--lrh-blue)]"
                  />
                </label>
              </div>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
