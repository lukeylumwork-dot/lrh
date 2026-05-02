import { Pencil, Check, RotateCcw, Save } from "lucide-react";
import { useEditor } from "./EditorContext";
import { cn } from "@/lib/utils";
import type { DeckKind } from "./types";

interface Props {
  deckKind: DeckKind;
  currentSlideKey: string | null;
}

export function EditorToolbar({ deckKind, currentSlideKey }: Props) {
  const { editing, setEditing, saving, resetSlide } = useEditor();

  return (
    <div className="fixed top-4 left-4 z-40 flex items-center gap-2">
      <button
        onClick={() => setEditing(!editing)}
        className={cn(
          "h-9 px-3 rounded-md border flex items-center gap-2 text-xs font-medium transition",
          editing
            ? "bg-[var(--lrh-blue)] text-white border-transparent"
            : "bg-card border-border text-foreground hover:bg-muted"
        )}
        aria-pressed={editing}
      >
        {editing ? <Check size={14} /> : <Pencil size={14} />}
        {editing ? "Done editing" : "Edit slide"}
      </button>

      {editing && (
        <>
          <div className="h-9 px-2.5 rounded-md bg-card border border-border flex items-center gap-1.5 text-[11px] text-foreground/70">
            {saving ? (
              <>
                <Save size={12} className="animate-pulse" /> Saving…
              </>
            ) : (
              <>
                <Save size={12} /> Saved
              </>
            )}
          </div>
          {currentSlideKey && (
            <button
              onClick={() => {
                if (confirm("Reset this slide to its original content?")) {
                  resetSlide(deckKind, currentSlideKey);
                }
              }}
              className="h-9 px-3 rounded-md border border-border bg-card text-foreground/70 hover:bg-muted flex items-center gap-2 text-xs"
            >
              <RotateCcw size={13} /> Reset slide
            </button>
          )}
        </>
      )}
    </div>
  );
}
