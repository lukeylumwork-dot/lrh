import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";
import { cn } from "@/lib/utils";
import { useEditor } from "./EditorContext";
import type { Block, DeckKind } from "./types";

const SLIDE_W = 1920;
const SLIDE_H = 1080;

interface Props {
  deckKind: DeckKind;
  slideKey: string;
  block: Block;
  defaults: { blocks: Block[] };
  /** Style hooks for non-editing render (e.g. font sizing). */
  className?: string;
  /** Render the resolved content for read-only mode. */
  children?: ReactNode;
  /** When set, the highlighted keyword is colored in title/text. */
  highlight?: string | null;
}

/** Resolve container element to compute pixel-per-percent ratio for drag. */
function useSlideRect(ref: React.RefObject<HTMLElement | null>) {
  const [rect, setRect] = useState({ w: SLIDE_W, h: SLIDE_H });
  useLayoutEffect(() => {
    if (!ref.current) return;
    const parent = ref.current.parentElement;
    if (!parent) return;
    const obs = new ResizeObserver(() => {
      setRect({ w: parent.clientWidth || SLIDE_W, h: parent.clientHeight || SLIDE_H });
    });
    obs.observe(parent);
    setRect({ w: parent.clientWidth || SLIDE_W, h: parent.clientHeight || SLIDE_H });
    return () => obs.disconnect();
  }, [ref]);
  return rect;
}

/** Render text with a highlighted keyword colored in brand blue. */
function withHighlight(text: string, highlight?: string | null) {
  if (!highlight) return text;
  const idx = text.toLowerCase().indexOf(highlight.toLowerCase());
  if (idx < 0) return text;
  return (
    <>
      {text.slice(0, idx)}
      <span className="text-[var(--lrh-blue)]">
        {text.slice(idx, idx + highlight.length)}
      </span>
      {text.slice(idx + highlight.length)}
    </>
  );
}

export function EditableBlock({
  deckKind,
  slideKey,
  block,
  defaults,
  className,
  highlight,
}: Props) {
  const { editing, selectedBlockId, setSelectedBlockId, updateBlock } = useEditor();
  const ref = useRef<HTMLDivElement>(null);
  const rect = useSlideRect(ref);
  const isSelected = editing && selectedBlockId === block.id;

  // Inline editing — store local draft to avoid losing caret on every keystroke roundtrip.
  const [draft, setDraft] = useState<string>(block.text ?? "");
  const [bulletDraft, setBulletDraft] = useState<string>(
    (block.bullets ?? []).join("\n")
  );
  useEffect(() => setDraft(block.text ?? ""), [block.text]);
  useEffect(() => setBulletDraft((block.bullets ?? []).join("\n")), [block.bullets]);

  const commitText = useCallback(
    (val: string) => {
      if (val === (block.text ?? "")) return;
      updateBlock(deckKind, slideKey, block.id, { text: val }, defaults);
    },
    [block.id, block.text, deckKind, slideKey, updateBlock, defaults]
  );

  const commitBullets = useCallback(
    (val: string) => {
      const arr = val.split("\n").map((l) => l.trim()).filter(Boolean);
      const cur = block.bullets ?? [];
      if (arr.length === cur.length && arr.every((v, i) => v === cur[i])) return;
      updateBlock(deckKind, slideKey, block.id, { bullets: arr }, defaults);
    },
    [block.id, block.bullets, deckKind, slideKey, updateBlock, defaults]
  );

  // Drag handler ----------------------------------------------------------
  const startDrag = useCallback(
    (e: React.MouseEvent) => {
      if (!editing) return;
      // Don't initiate drag from inside a text-edit field.
      const target = e.target as HTMLElement;
      if (target.closest("[data-block-edit]")) return;
      e.preventDefault();
      e.stopPropagation();
      setSelectedBlockId(block.id);
      const startX = e.clientX;
      const startY = e.clientY;
      const startBlock = { x: block.x, y: block.y };
      const pxPerPctX = rect.w / 100;
      const pxPerPctY = rect.h / 100;

      const onMove = (ev: MouseEvent) => {
        const dx = (ev.clientX - startX) / pxPerPctX;
        const dy = (ev.clientY - startY) / pxPerPctY;
        const nx = Math.max(-10, Math.min(110 - block.w, startBlock.x + dx));
        const ny = Math.max(-10, Math.min(110 - block.h, startBlock.y + dy));
        updateBlock(deckKind, slideKey, block.id, { x: nx, y: ny }, defaults);
      };
      const onUp = () => {
        window.removeEventListener("mousemove", onMove);
        window.removeEventListener("mouseup", onUp);
      };
      window.addEventListener("mousemove", onMove);
      window.addEventListener("mouseup", onUp);
    },
    [
      editing,
      block.id,
      block.x,
      block.y,
      block.w,
      block.h,
      rect.w,
      rect.h,
      setSelectedBlockId,
      updateBlock,
      deckKind,
      slideKey,
      defaults,
    ]
  );

  // Resize from bottom-right corner.
  const startResize = useCallback(
    (e: React.MouseEvent) => {
      if (!editing) return;
      e.preventDefault();
      e.stopPropagation();
      const startX = e.clientX;
      const startY = e.clientY;
      const startSize = { w: block.w, h: block.h };
      const pxPerPctX = rect.w / 100;
      const pxPerPctY = rect.h / 100;
      const onMove = (ev: MouseEvent) => {
        const dw = (ev.clientX - startX) / pxPerPctX;
        const dh = (ev.clientY - startY) / pxPerPctY;
        const nw = Math.max(5, Math.min(110 - block.x, startSize.w + dw));
        const nh = Math.max(5, Math.min(110 - block.y, startSize.h + dh));
        updateBlock(deckKind, slideKey, block.id, { w: nw, h: nh }, defaults);
      };
      const onUp = () => {
        window.removeEventListener("mousemove", onMove);
        window.removeEventListener("mouseup", onUp);
      };
      window.addEventListener("mousemove", onMove);
      window.addEventListener("mouseup", onUp);
    },
    [
      editing,
      block.x,
      block.y,
      block.w,
      block.h,
      rect.w,
      rect.h,
      updateBlock,
      deckKind,
      slideKey,
      block.id,
      defaults,
    ]
  );

  if (block.hidden && !editing) return null;

  const style: CSSProperties = {
    position: "absolute",
    left: `${block.x}%`,
    top: `${block.y}%`,
    width: `${block.w}%`,
    height: `${block.h}%`,
    textAlign: block.align ?? "left",
  };

  const renderContent = () => {
    if (block.hidden) {
      return (
        <div className="w-full h-full flex items-center justify-center text-foreground/30 italic text-sm">
          (hidden)
        </div>
      );
    }
    switch (block.kind) {
      case "title":
        return editing ? (
          <textarea
            data-block-edit
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onBlur={() => commitText(draft)}
            className="w-full h-full bg-transparent outline-none resize-none font-heading font-bold tracking-tight leading-[1.05] text-4xl md:text-5xl"
          />
        ) : (
          <h1 className="font-heading font-bold tracking-tight leading-[1.05] text-4xl md:text-5xl">
            {withHighlight(block.text ?? "", highlight)}
          </h1>
        );
      case "eyebrow":
        return editing ? (
          <input
            data-block-edit
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onBlur={() => commitText(draft)}
            className="w-full bg-transparent outline-none uppercase tracking-[0.22em] text-[var(--lrh-blue)] font-medium text-[11px]"
          />
        ) : (
          <div className="text-[11px] uppercase tracking-[0.22em] text-[var(--lrh-blue)] font-medium">
            {block.text}
          </div>
        );
      case "text":
        return editing ? (
          <textarea
            data-block-edit
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onBlur={() => commitText(draft)}
            className="w-full h-full bg-transparent outline-none resize-none text-base md:text-lg leading-relaxed text-foreground/80"
          />
        ) : (
          <p className="text-base md:text-lg leading-relaxed text-foreground/80 whitespace-pre-wrap">
            {withHighlight(block.text ?? "", highlight)}
          </p>
        );
      case "bullets":
        return editing ? (
          <textarea
            data-block-edit
            value={bulletDraft}
            onChange={(e) => setBulletDraft(e.target.value)}
            onBlur={() => commitBullets(bulletDraft)}
            placeholder="One bullet per line"
            className="w-full h-full bg-transparent outline-none resize-none text-base md:text-lg leading-relaxed text-foreground/80 font-mono"
          />
        ) : (
          <ul className="space-y-3">
            {(block.bullets ?? []).map((b, i) => (
              <li
                key={i}
                className="flex gap-3 text-base md:text-lg leading-relaxed text-foreground/80"
              >
                <span className="mt-2 h-1.5 w-1.5 rounded-full bg-[var(--lrh-blue)] flex-shrink-0" />
                <span>{withHighlight(b, highlight)}</span>
              </li>
            ))}
          </ul>
        );
      case "image":
        return block.imageUrl ? (
          <img
            src={block.imageUrl}
            alt=""
            className="w-full h-full object-contain rounded-md"
            draggable={false}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-muted/30 rounded-md text-foreground/40 text-sm">
            no image
          </div>
        );
    }
  };

  return (
    <div
      ref={ref}
      style={style}
      onMouseDown={startDrag}
      onClick={(e) => {
        if (editing) {
          e.stopPropagation();
          setSelectedBlockId(block.id);
        }
      }}
      className={cn(
        "transition-shadow",
        editing && "cursor-move hover:outline hover:outline-1 hover:outline-[var(--lrh-blue)]/40",
        isSelected && "outline outline-2 outline-[var(--lrh-blue)] rounded-sm",
        block.hidden && "opacity-30",
        className
      )}
    >
      {renderContent()}
      {isSelected && (
        <div
          onMouseDown={startResize}
          className="absolute -bottom-1 -right-1 w-3 h-3 bg-[var(--lrh-blue)] rounded-sm cursor-nwse-resize z-10"
          aria-label="Resize block"
        />
      )}
    </div>
  );
}
