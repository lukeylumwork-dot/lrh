import { Eye, EyeOff, X, Trash2 } from "lucide-react";
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

export function EditorSidePanel({
  deckKind,
  slideKey,
  blocks,
  defaults,
  highlightKeyword,
  layoutVariant,
  layoutOptions,
}: Props) {
  const { editing, selectedBlockId, setSelectedBlockId, updateBlock, updateOverride } =
    useEditor();
  if (!editing) return null;

  const selected = blocks.find((b) => b.id === selectedBlockId) ?? null;

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
                defaults
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
                updateOverride(
                  deckKind,
                  slideKey,
                  { layoutVariant: e.target.value },
                  defaults
                )
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
              return (
                <li key={b.id}>
                  <button
                    onClick={() => setSelectedBlockId(b.id)}
                    className={cn(
                      "w-full text-left px-2 py-1.5 rounded text-xs flex items-center justify-between gap-2 border",
                      isSel
                        ? "bg-[var(--lrh-blue)]/10 border-[var(--lrh-blue)]/40"
                        : "border-transparent hover:bg-muted"
                    )}
                  >
                    <span className="flex flex-col items-start min-w-0">
                      <span className="text-[10px] uppercase text-foreground/45">
                        {b.kind}
                      </span>
                      <span className="truncate w-48 text-foreground/80">
                        {b.kind === "image"
                          ? b.imageUrl ?? "(no image)"
                          : b.kind === "bullets"
                            ? (b.bullets ?? []).slice(0, 1).join("") || "(empty)"
                            : b.text || "(empty)"}
                      </span>
                    </span>
                    <span
                      role="button"
                      tabIndex={0}
                      onClick={(e) => {
                        e.stopPropagation();
                        updateBlock(
                          deckKind,
                          slideKey,
                          b.id,
                          { hidden: !b.hidden },
                          defaults
                        );
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
          <div className="border-t border-border pt-3 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] uppercase tracking-wider text-foreground/50">
                Selected block
              </span>
              <button
                onClick={() => setSelectedBlockId(null)}
                className="text-foreground/40 hover:text-foreground"
                aria-label="Deselect"
              >
                <X size={14} />
              </button>
            </div>

            <div>
              <label className="block text-[10px] text-foreground/50 mb-1">
                Alignment
              </label>
              <div className="flex gap-1">
                {(["left", "center", "right"] as const).map((a) => (
                  <button
                    key={a}
                    onClick={() =>
                      updateBlock(deckKind, slideKey, selected.id, { align: a }, defaults)
                    }
                    className={cn(
                      "flex-1 h-7 rounded border text-[11px] capitalize",
                      (selected.align ?? "left") === a
                        ? "bg-[var(--lrh-blue)] text-white border-transparent"
                        : "border-border text-foreground/70 hover:bg-muted"
                    )}
                  >
                    {a}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 text-[11px]">
              {(["x", "y", "w", "h"] as const).map((k) => (
                <label key={k} className="flex items-center gap-1.5">
                  <span className="uppercase text-foreground/50 w-4">{k}</span>
                  <input
                    type="number"
                    value={Math.round(selected[k])}
                    onChange={(e) =>
                      updateBlock(
                        deckKind,
                        slideKey,
                        selected.id,
                        { [k]: Number(e.target.value) },
                        defaults
                      )
                    }
                    className="flex-1 h-7 rounded border border-border bg-background px-1.5 text-xs outline-none focus:border-[var(--lrh-blue)]"
                  />
                </label>
              ))}
            </div>

            {selected.kind === "image" && (
              <div>
                <label className="block text-[10px] text-foreground/50 mb-1">
                  Image URL
                </label>
                <input
                  value={selected.imageUrl ?? ""}
                  onChange={(e) =>
                    updateBlock(
                      deckKind,
                      slideKey,
                      selected.id,
                      { imageUrl: e.target.value || null },
                      defaults
                    )
                  }
                  className="w-full h-7 rounded border border-border bg-background px-2 text-xs outline-none focus:border-[var(--lrh-blue)]"
                />
              </div>
            )}
          </div>
        )}
      </div>
    </aside>
  );
}
