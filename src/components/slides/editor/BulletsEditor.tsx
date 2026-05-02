import { useEffect, useRef, useState } from "react";
import { GripVertical, Plus, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface BulletsEditorProps {
  value: string[];
  onChange: (next: string[]) => void;
  onCommit: (next: string[]) => void;
  onExit: () => void;
  /** Cmd/Ctrl+Enter: commit and also leave canvas edit mode entirely. */
  onExitDeck?: () => void;
}

/** Normalize: trim, drop blanks, collapse internal newlines to single bullets. */
function normalize(arr: string[]): string[] {
  return arr
    .flatMap((b) => b.split(/\r?\n/))
    .map((b) => b.trim())
    .filter(Boolean);
}

/**
 * Inline bullet editor: one input per bullet, Enter to add, Backspace to merge,
 * Alt+↑/↓ to reorder via keyboard, drag handle to reorder via pointer.
 */
export function BulletsEditor({
  value,
  onChange,
  onCommit,
  onExit,
  onExitDeck,
}: BulletsEditorProps) {
  const [items, setItems] = useState<string[]>(
    value.length ? value : [""],
  );
  const [focusIndex, setFocusIndex] = useState<number | null>(0);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [overIndex, setOverIndex] = useState<number | null>(null);
  const refs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    setItems(value.length ? value : [""]);
  }, [value]);

  useEffect(() => {
    if (focusIndex == null) return;
    const el = refs.current[focusIndex];
    if (el) {
      el.focus();
      const len = el.value.length;
      el.setSelectionRange(len, len);
    }
  }, [focusIndex, items.length]);

  const update = (next: string[], focus?: number) => {
    setItems(next);
    onChange(normalize(next));
    if (focus != null) setFocusIndex(focus);
  };

  const move = (from: number, to: number) => {
    if (to < 0 || to >= items.length || from === to) return;
    const next = items.slice();
    const [m] = next.splice(from, 1);
    next.splice(to, 0, m);
    update(next, to);
  };

  const commit = () => {
    onCommit(normalize(items));
    onExit();
  };

  return (
    <div
      data-block-edit
      className="w-full h-full overflow-auto"
      onBlur={(e) => {
        // Commit only when focus leaves the whole editor.
        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) commit();
      }}
    >
      <ul className="space-y-1">
        {items.map((b, i) => {
          const isOver = overIndex === i && dragIndex !== null && dragIndex !== i;
          return (
            <li
              key={i}
              onDragOver={(e) => {
                if (dragIndex === null) return;
                e.preventDefault();
                setOverIndex(i);
              }}
              onDrop={(e) => {
                if (dragIndex === null) return;
                e.preventDefault();
                move(dragIndex, i);
                setDragIndex(null);
                setOverIndex(null);
              }}
              className={cn(
                "group flex items-center gap-2 rounded-sm px-1 -mx-1",
                isOver && "bg-[var(--lrh-blue-500)]/10",
              )}
            >
              <button
                type="button"
                draggable
                onDragStart={() => setDragIndex(i)}
                onDragEnd={() => {
                  setDragIndex(null);
                  setOverIndex(null);
                }}
                tabIndex={-1}
                className="cursor-grab active:cursor-grabbing text-foreground/30 hover:text-foreground/70 flex-shrink-0"
                aria-label="Drag to reorder"
              >
                <GripVertical size={14} />
              </button>
              <span className="mt-0 h-1.5 w-1.5 rounded-full bg-[var(--lrh-blue-500)] flex-shrink-0" />
              <input
                ref={(el) => {
                  refs.current[i] = el;
                }}
                value={b}
                onChange={(e) => {
                  const next = items.slice();
                  next[i] = e.target.value;
                  setItems(next);
                  onChange(normalize(next));
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    const next = items.slice();
                    next.splice(i + 1, 0, "");
                    update(next, i + 1);
                  } else if (e.key === "Backspace" && b === "" && items.length > 1) {
                    e.preventDefault();
                    const next = items.slice();
                    next.splice(i, 1);
                    update(next, Math.max(0, i - 1));
                  } else if (e.altKey && e.key === "ArrowUp") {
                    e.preventDefault();
                    move(i, i - 1);
                  } else if (e.altKey && e.key === "ArrowDown") {
                    e.preventDefault();
                    move(i, i + 1);
                  } else if (e.key === "ArrowUp" && !e.altKey) {
                    if (i > 0) {
                      e.preventDefault();
                      setFocusIndex(i - 1);
                    }
                  } else if (e.key === "ArrowDown" && !e.altKey) {
                    if (i < items.length - 1) {
                      e.preventDefault();
                      setFocusIndex(i + 1);
                    }
                  } else if (e.key === "Escape") {
                    e.preventDefault();
                    commit();
                  }
                }}
                onPaste={(e) => {
                  const text = e.clipboardData.getData("text");
                  if (!text.includes("\n")) return;
                  e.preventDefault();
                  const lines = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
                  if (lines.length === 0) return;
                  const next = items.slice();
                  next.splice(i, 1, ...[(b + lines[0]), ...lines.slice(1)]);
                  update(next, i + lines.length - 1);
                }}
                placeholder="Bullet text"
                className="flex-1 bg-transparent outline-none text-base md:text-lg leading-relaxed text-foreground/80 placeholder:text-foreground/30"
              />
              <button
                type="button"
                tabIndex={-1}
                onClick={() => {
                  if (items.length === 1) {
                    update([""], 0);
                    return;
                  }
                  const next = items.slice();
                  next.splice(i, 1);
                  update(next, Math.max(0, i - 1));
                }}
                className="opacity-0 group-hover:opacity-100 text-foreground/40 hover:text-foreground flex-shrink-0"
                aria-label="Remove bullet"
              >
                <X size={14} />
              </button>
            </li>
          );
        })}
      </ul>
      <button
        type="button"
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => {
          const next = [...items, ""];
          update(next, next.length - 1);
        }}
        className="mt-2 inline-flex items-center gap-1.5 text-xs text-[var(--lrh-blue-500)] hover:underline"
      >
        <Plus size={12} /> Add bullet
      </button>
    </div>
  );
}
