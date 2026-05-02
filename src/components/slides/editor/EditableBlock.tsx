import {
  createContext,
  useCallback,
  useContext,
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
/** Snap step in slide-percent units (1% ≈ 19px wide / 11px tall). */
const SNAP_PCT = 1;
/** Pixel tolerance for alignment guide matching. */
const GUIDE_TOL = 0.6;

// ---------------------------------------------------------------------------
// Context to share peer block geometry with each EditableBlock so we can
// surface alignment guides during drag/resize.
// ---------------------------------------------------------------------------
export interface PeersCtx {
  blocks: Block[];
  /** Active alignment guides while dragging (set by the dragging block). */
  guides: Guide[];
  setGuides: (g: Guide[]) => void;
  /** Optional custom region renderer. */
  renderRegion?: (regionId: string) => ReactNode;
}

export interface Guide {
  axis: "x" | "y";
  /** Position in percent. */
  pos: number;
}

const Peers = createContext<PeersCtx>({
  blocks: [],
  guides: [],
  setGuides: () => {},
});

export function PeersProvider({
  blocks,
  renderRegion,
  children,
}: {
  blocks: Block[];
  renderRegion?: (regionId: string) => ReactNode;
  children: ReactNode;
}) {
  const [guides, setGuides] = useState<Guide[]>([]);
  return (
    <Peers.Provider value={{ blocks, guides, setGuides, renderRegion }}>
      {children}
      <GuideOverlay />
    </Peers.Provider>
  );
}

function GuideOverlay() {
  const { guides } = useContext(Peers);
  if (!guides.length) return null;
  return (
    <div className="absolute inset-0 pointer-events-none z-50">
      {guides.map((g, i) =>
        g.axis === "x" ? (
          <div
            key={i}
            className="absolute top-0 bottom-0 border-l border-dashed border-[var(--lrh-blue-500)]"
            style={{ left: `${g.pos}%` }}
          />
        ) : (
          <div
            key={i}
            className="absolute left-0 right-0 border-t border-dashed border-[var(--lrh-blue-500)]"
            style={{ top: `${g.pos}%` }}
          />
        ),
      )}
    </div>
  );
}

interface Props {
  deckKind: DeckKind;
  slideKey: string;
  block: Block;
  defaults: { blocks: Block[] };
  className?: string;
  children?: ReactNode;
  highlight?: string | null;
}

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

function withHighlight(text: string, highlight?: string | null) {
  if (!highlight) return text;
  const idx = text.toLowerCase().indexOf(highlight.toLowerCase());
  if (idx < 0) return text;
  return (
    <>
      {text.slice(0, idx)}
      <span className="text-[var(--lrh-blue-500)]">
        {text.slice(idx, idx + highlight.length)}
      </span>
      {text.slice(idx + highlight.length)}
    </>
  );
}

/** Snap a value to the SNAP_PCT grid unless the user holds shift. */
function snap(v: number, freeform: boolean) {
  if (freeform) return v;
  return Math.round(v / SNAP_PCT) * SNAP_PCT;
}

/** Compute alignment guides between the moving block and its peers. */
function computeGuides(
  moving: { x: number; y: number; w: number; h: number },
  peers: Block[],
  ignoreId: string,
): { guides: Guide[]; snapX?: number; snapY?: number } {
  const out: Guide[] = [];
  let snapX: number | undefined;
  let snapY: number | undefined;

  const movX = [moving.x, moving.x + moving.w / 2, moving.x + moving.w];
  const movY = [moving.y, moving.y + moving.h / 2, moving.y + moving.h];
  // slide center + edges
  const targetsX = [0, 50, 100];
  const targetsY = [0, 50, 100];
  for (const p of peers) {
    if (p.id === ignoreId || p.hidden) continue;
    targetsX.push(p.x, p.x + p.w / 2, p.x + p.w);
    targetsY.push(p.y, p.y + p.h / 2, p.y + p.h);
  }

  for (let i = 0; i < movX.length; i++) {
    for (const t of targetsX) {
      if (Math.abs(movX[i] - t) <= GUIDE_TOL) {
        out.push({ axis: "x", pos: t });
        if (snapX === undefined) snapX = moving.x + (t - movX[i]);
      }
    }
  }
  for (let i = 0; i < movY.length; i++) {
    for (const t of targetsY) {
      if (Math.abs(movY[i] - t) <= GUIDE_TOL) {
        out.push({ axis: "y", pos: t });
        if (snapY === undefined) snapY = moving.y + (t - movY[i]);
      }
    }
  }
  return { guides: out, snapX, snapY };
}

export function EditableBlock({
  deckKind,
  slideKey,
  block,
  defaults,
  className,
  highlight,
}: Props) {
  const {
    editing,
    selectedBlockId,
    setSelectedBlockId,
    updateBlock,
    updateOverride,
  } = useEditor();
  const peers = useContext(Peers);
  const ref = useRef<HTMLDivElement>(null);
  const rect = useSlideRect(ref);
  const isSelected = editing && selectedBlockId === block.id;
  const [inlineEdit, setInlineEdit] = useState(false);
  useEffect(() => {
    if (!isSelected) setInlineEdit(false);
  }, [isSelected]);

  // Cmd/Ctrl+K while a block is selected: set highlight keyword from current
  // text selection (or clear it if nothing is selected).
  useEffect(() => {
    if (!isSelected) return;
    const onKey = (e: KeyboardEvent) => {
      if (!(e.key === "k" || e.key === "K") || !(e.metaKey || e.ctrlKey)) return;
      e.preventDefault();
      const sel = window.getSelection()?.toString().trim() ?? "";
      updateOverride(
        deckKind,
        slideKey,
        { highlightKeyword: sel || null },
        defaults,
      );
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isSelected, deckKind, slideKey, defaults, updateOverride]);

  const [draft, setDraft] = useState<string>(block.text ?? "");
  const [bulletDraft, setBulletDraft] = useState<string>(
    (block.bullets ?? []).join("\n"),
  );
  useEffect(() => setDraft(block.text ?? ""), [block.text]);
  useEffect(
    () => setBulletDraft((block.bullets ?? []).join("\n")),
    [block.bullets],
  );

  const commitText = useCallback(
    (val: string) => {
      if (val === (block.text ?? "")) return;
      updateBlock(deckKind, slideKey, block.id, { text: val }, defaults);
    },
    [block.id, block.text, deckKind, slideKey, updateBlock, defaults],
  );

  const commitBullets = useCallback(
    (val: string) => {
      const arr = val.split("\n").map((l) => l.trim()).filter(Boolean);
      const cur = block.bullets ?? [];
      if (arr.length === cur.length && arr.every((v, i) => v === cur[i])) return;
      updateBlock(deckKind, slideKey, block.id, { bullets: arr }, defaults);
    },
    [block.id, block.bullets, deckKind, slideKey, updateBlock, defaults],
  );

  // Drag --------------------------------------------------------------------
  const startDrag = useCallback(
    (e: React.MouseEvent) => {
      if (!editing) return;
      const target = e.target as HTMLElement;
      if (target.closest("[data-block-edit]")) return;
      e.preventDefault();
      e.stopPropagation();
      setSelectedBlockId(block.id);
      const startX = e.clientX;
      const startY = e.clientY;
      const startBlock = { x: block.x, y: block.y, w: block.w, h: block.h };
      const pxPerPctX = rect.w / 100;
      const pxPerPctY = rect.h / 100;

      const onMove = (ev: MouseEvent) => {
        const dx = (ev.clientX - startX) / pxPerPctX;
        const dy = (ev.clientY - startY) / pxPerPctY;
        const freeform = ev.shiftKey;
        let nx = snap(startBlock.x + dx, freeform);
        let ny = snap(startBlock.y + dy, freeform);
        // Bounds: keep block inside the slide (0..100-w/h).
        nx = Math.max(0, Math.min(100 - startBlock.w, nx));
        ny = Math.max(0, Math.min(100 - startBlock.h, ny));

        // Alignment guides + magnetic snap to peers/center.
        if (!freeform) {
          const { guides, snapX, snapY } = computeGuides(
            { x: nx, y: ny, w: startBlock.w, h: startBlock.h },
            peers.blocks,
            block.id,
          );
          if (snapX !== undefined)
            nx = Math.max(0, Math.min(100 - startBlock.w, snapX));
          if (snapY !== undefined)
            ny = Math.max(0, Math.min(100 - startBlock.h, snapY));
          peers.setGuides(guides);
        } else {
          peers.setGuides([]);
        }

        updateBlock(deckKind, slideKey, block.id, { x: nx, y: ny }, defaults);
      };
      const onUp = () => {
        peers.setGuides([]);
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
      peers,
    ],
  );

  // Resize from bottom-right corner -----------------------------------------
  const startResize = useCallback(
    (e: React.MouseEvent) => {
      if (!editing) return;
      e.preventDefault();
      e.stopPropagation();
      const startX = e.clientX;
      const startY = e.clientY;
      const startSize = { x: block.x, y: block.y, w: block.w, h: block.h };
      const pxPerPctX = rect.w / 100;
      const pxPerPctY = rect.h / 100;
      const onMove = (ev: MouseEvent) => {
        const dw = (ev.clientX - startX) / pxPerPctX;
        const dh = (ev.clientY - startY) / pxPerPctY;
        const freeform = ev.shiftKey;
        let nw = snap(startSize.w + dw, freeform);
        let nh = snap(startSize.h + dh, freeform);
        nw = Math.max(3, Math.min(100 - startSize.x, nw));
        nh = Math.max(3, Math.min(100 - startSize.y, nh));
        // Snap right/bottom edge to peer/center lines.
        if (!freeform) {
          const { guides, snapX, snapY } = computeGuides(
            { x: startSize.x, y: startSize.y, w: nw, h: nh },
            peers.blocks,
            block.id,
          );
          if (snapX !== undefined) nw = Math.max(3, snapX - startSize.x + nw - (startSize.x + nw - (startSize.x + nw)));
          // Simpler: re-derive nw/nh from edge snap targets.
          if (snapX !== undefined) {
            const candidate = snapX - startSize.x;
            // Only snap when adjusting right edge (snap target near right edge).
            if (Math.abs(candidate - nw) < 2) nw = Math.max(3, candidate);
          }
          if (snapY !== undefined) {
            const candidate = snapY - startSize.y;
            if (Math.abs(candidate - nh) < 2) nh = Math.max(3, candidate);
          }
          peers.setGuides(guides);
        } else {
          peers.setGuides([]);
        }
        updateBlock(deckKind, slideKey, block.id, { w: nw, h: nh }, defaults);
      };
      const onUp = () => {
        peers.setGuides([]);
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
      peers,
    ],
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
    const editingThis = editing && inlineEdit && isSelected;
    switch (block.kind) {
      case "region":
        return peers.renderRegion?.(block.regionId ?? block.id) ?? null;
      case "title":
        return editingThis ? (
          <textarea
            data-block-edit
            autoFocus
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onBlur={() => {
              commitText(draft);
              setInlineEdit(false);
            }}
            className="w-full h-full bg-transparent outline-none resize-none font-heading font-bold tracking-tight leading-[1.05] text-4xl md:text-5xl"
          />
        ) : (
          <h1 className="font-heading font-bold tracking-tight leading-[1.05] text-4xl md:text-5xl">
            {withHighlight(block.text ?? "", highlight)}
          </h1>
        );
      case "eyebrow":
        return editingThis ? (
          <input
            data-block-edit
            autoFocus
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onBlur={() => {
              commitText(draft);
              setInlineEdit(false);
            }}
            className="w-full bg-transparent outline-none uppercase tracking-[0.22em] text-[var(--lrh-blue-500)] font-medium text-[11px]"
          />
        ) : (
          <div className="text-[11px] uppercase tracking-[0.22em] text-[var(--lrh-blue-500)] font-medium">
            {block.text}
          </div>
        );
      case "text":
        return editingThis ? (
          <textarea
            data-block-edit
            autoFocus
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onBlur={() => {
              commitText(draft);
              setInlineEdit(false);
            }}
            className="w-full h-full bg-transparent outline-none resize-none text-base md:text-lg leading-relaxed text-foreground/80"
          />
        ) : (
          <p className="text-base md:text-lg leading-relaxed text-foreground/80 whitespace-pre-wrap">
            {withHighlight(block.text ?? "", highlight)}
          </p>
        );
      case "bullets":
        return editingThis ? (
          <textarea
            data-block-edit
            autoFocus
            value={bulletDraft}
            onChange={(e) => setBulletDraft(e.target.value)}
            onBlur={() => {
              commitBullets(bulletDraft);
              setInlineEdit(false);
            }}
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
                <span className="mt-2 h-1.5 w-1.5 rounded-full bg-[var(--lrh-blue-500)] flex-shrink-0" />
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

  const isTextual =
    block.kind === "title" ||
    block.kind === "text" ||
    block.kind === "bullets" ||
    block.kind === "eyebrow";

  return (
    <div
      ref={ref}
      style={style}
      onMouseDown={inlineEdit ? undefined : startDrag}
      onClick={(e) => {
        if (editing) {
          e.stopPropagation();
          setSelectedBlockId(block.id);
        }
      }}
      onDoubleClick={(e) => {
        if (!editing || !isTextual) return;
        e.stopPropagation();
        setSelectedBlockId(block.id);
        setInlineEdit(true);
      }}
      title={
        editing && isTextual && !inlineEdit
          ? "Double-click to edit · Select text + ⌘K to set highlight"
          : undefined
      }
      className={cn(
        "transition-shadow",
        editing &&
          !inlineEdit &&
          "cursor-move hover:outline hover:outline-1 hover:outline-[var(--lrh-blue-500)]/40",
        isSelected &&
          "outline outline-2 outline-[var(--lrh-blue-500)] rounded-sm",
        inlineEdit && "cursor-text",
        block.hidden && "opacity-30",
        className,
      )}
    >
      {renderContent()}
      {isSelected && !inlineEdit && (
        <div
          onMouseDown={startResize}
          className="absolute -bottom-1 -right-1 w-3 h-3 bg-[var(--lrh-blue-500)] rounded-sm cursor-nwse-resize z-10"
          aria-label="Resize block"
        />
      )}
    </div>
  );
}
