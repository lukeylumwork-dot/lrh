import { useEditor } from "./EditorContext";
import { LRH_KEYWORDS } from "../keywordMap";
import { RotateCcw } from "lucide-react";

interface Props {
  slideKey: string;
}

/**
 * Compact side panel shown when editing an LRH coded slide. Lets you
 * adjust just the highlighted keyword for that slide. The default
 * keyword comes from `keywordMap.ts`; the override is persisted to
 * Lovable Cloud and applied via <SlideKeywordProvider>.
 */
export function LrhKeywordPanel({ slideKey }: Props) {
  const { editing, getOverride, updateOverride, resetSlide } = useEditor();
  if (!editing) return null;

  const override = getOverride("lrh", slideKey);
  const defaultKw = LRH_KEYWORDS[slideKey] ?? "";
  const value = override?.highlightKeyword ?? defaultKw;
  const isCustom = override?.highlightKeyword !== undefined && override?.highlightKeyword !== null;

  return (
    <aside className="fixed top-16 right-4 w-72 z-40 bg-card border border-border rounded-lg shadow-lg overflow-hidden">
      <header className="px-3 py-2.5 border-b border-border">
        <span className="text-xs font-semibold uppercase tracking-wider text-foreground/70">
          Slide keyword
        </span>
      </header>

      <div className="px-3 py-3 space-y-3 text-sm">
        <div>
          <label className="block text-[11px] uppercase tracking-wider text-foreground/50 mb-1.5">
            Highlighted keyword
          </label>
          <input
            value={value}
            onChange={(e) =>
              updateOverride(
                "lrh",
                slideKey,
                { highlightKeyword: e.target.value },
                { blocks: [] }
              )
            }
            placeholder={defaultKw || "e.g. data layer"}
            className="w-full h-8 rounded border border-border bg-background px-2 text-sm outline-none focus:border-[var(--lrh-blue-500)]"
          />
          <p className="text-[10px] text-foreground/45 mt-1">
            First whole-word match in the slide&apos;s title, body, and bullets is colored blue.
            Default for this slide:{" "}
            <span className="font-medium text-foreground/70">
              {defaultKw || "(none)"}
            </span>
          </p>
        </div>

        {isCustom && (
          <button
            onClick={() => resetSlide("lrh", slideKey)}
            className="w-full h-8 rounded border border-border bg-card text-foreground/70 hover:bg-muted flex items-center justify-center gap-2 text-xs"
          >
            <RotateCcw size={12} /> Reset to default
          </button>
        )}
      </div>
    </aside>
  );
}
