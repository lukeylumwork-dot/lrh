import { ReactNode, createContext, useContext, useMemo } from "react";
import { useEditor } from "./editor/EditorContext";
import { LRH_KEYWORDS } from "./keywordMap";
import type { DeckKind } from "./editor/types";

interface SlideKeywordCtx {
  /** The keyword to color brand blue on this slide (or null = no highlight). */
  keyword: string | null;
  deckKind: DeckKind;
  slideKey: string;
}

const Ctx = createContext<SlideKeywordCtx | null>(null);

/**
 * Wrap any slide to expose a keyword to its descendants.
 *
 * Resolution order (highest priority first):
 *   1. Per-user override saved via the editor side panel.
 *   2. The static mapping in `keywordMap.ts` (LRH deck only).
 *   3. The `fallback` prop, if provided.
 */
export function SlideKeywordProvider({
  deckKind,
  slideKey,
  fallback,
  children,
}: {
  deckKind: DeckKind;
  slideKey: string;
  fallback?: string | null;
  children: ReactNode;
}) {
  const { getOverride } = useEditor();

  const value = useMemo<SlideKeywordCtx>(() => {
    const override = getOverride(deckKind, slideKey);
    if (override?.highlightKeyword !== undefined && override.highlightKeyword !== null) {
      return { keyword: override.highlightKeyword || null, deckKind, slideKey };
    }
    if (deckKind === "lrh" && LRH_KEYWORDS[slideKey]) {
      return { keyword: LRH_KEYWORDS[slideKey], deckKind, slideKey };
    }
    return { keyword: fallback ?? null, deckKind, slideKey };
  }, [deckKind, slideKey, fallback, getOverride]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

/** Read the active keyword for the surrounding slide. */
export function useSlideKeyword(): SlideKeywordCtx {
  return (
    useContext(Ctx) ?? { keyword: null, deckKind: "lrh", slideKey: "" }
  );
}

/**
 * Render text with the surrounding slide's keyword colored brand blue.
 * First case-insensitive match wins. Whole-word matching prevents
 * highlighting "data" inside "database".
 */
export function Highlighted({
  children,
  /** Override the slide-level keyword for this single instance. */
  keyword: override,
  /** Match on word boundary (default true). Set false for partial matches. */
  wholeWord = true,
}: {
  children: string;
  keyword?: string | null;
  wholeWord?: boolean;
}) {
  const ctx = useSlideKeyword();
  const keyword = override !== undefined ? override : ctx.keyword;
  if (!keyword || !children) return <>{children}</>;

  const escaped = keyword.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const pattern = wholeWord ? `\\b${escaped}\\b` : escaped;
  const re = new RegExp(pattern, "i");
  const m = children.match(re);
  if (!m || m.index === undefined) return <>{children}</>;

  const before = children.slice(0, m.index);
  const hit = children.slice(m.index, m.index + m[0].length);
  const after = children.slice(m.index + m[0].length);
  return (
    <>
      {before}
      <span className="text-[var(--lrh-blue-500)]">{hit}</span>
      {after}
    </>
  );
}
