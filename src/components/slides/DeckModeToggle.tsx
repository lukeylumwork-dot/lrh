import { Trash2, Upload } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  mode: "lrh" | "imported";
  onModeChange: (m: "lrh" | "imported") => void;
  hasImported: boolean;
  onReplace: () => void;
  onDelete: () => void;
}

export function DeckModeToggle({ mode, onModeChange, hasImported, onReplace, onDelete }: Props) {
  return (
    <div className="fixed top-4 right-4 z-30 flex items-center gap-2">
      <div className="inline-flex rounded-full border border-border bg-card/90 backdrop-blur p-0.5 text-xs font-medium">
        <button
          onClick={() => onModeChange("lrh")}
          className={cn(
            "px-3 py-1.5 rounded-full transition",
            mode === "lrh" ? "bg-[var(--lrh-blue)] text-white" : "text-foreground/70 hover:text-foreground"
          )}
        >
          LRH
        </button>
        <button
          onClick={() => onModeChange("imported")}
          className={cn(
            "px-3 py-1.5 rounded-full transition",
            mode === "imported" ? "bg-[var(--lrh-blue)] text-white" : "text-foreground/70 hover:text-foreground"
          )}
        >
          Imported
        </button>
      </div>
      {mode === "imported" && hasImported && (
        <>
          <button
            onClick={onReplace}
            title="Replace deck"
            className="h-8 w-8 rounded-full border border-border bg-card/90 backdrop-blur flex items-center justify-center text-foreground/70 hover:text-foreground transition"
          >
            <Upload className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={onDelete}
            title="Delete imported deck"
            className="h-8 w-8 rounded-full border border-border bg-card/90 backdrop-blur flex items-center justify-center text-foreground/70 hover:text-destructive transition"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </>
      )}
    </div>
  );
}
