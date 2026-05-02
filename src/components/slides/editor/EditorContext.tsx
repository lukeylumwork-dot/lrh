import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  listOverrides,
  upsertOverride,
  resetOverride,
  type OverrideDTO,
} from "@/server/overrides.functions";
import type { Block, DeckKind, SlideOverride } from "./types";

interface EditorState {
  editing: boolean;
  setEditing: (v: boolean) => void;
  selectedBlockId: string | null;
  setSelectedBlockId: (id: string | null) => void;
  /** Get the override for a slide; returns null if none persisted. */
  getOverride: (deckKind: DeckKind, slideKey: string) => SlideOverride | null;
  /** Patch the override for a slide; creates one if missing using `defaults`. */
  updateOverride: (
    deckKind: DeckKind,
    slideKey: string,
    patch: Partial<Omit<SlideOverride, "deckKind" | "slideKey">>,
    defaults: { blocks: Block[] }
  ) => void;
  updateBlock: (
    deckKind: DeckKind,
    slideKey: string,
    blockId: string,
    patch: Partial<Block>,
    defaults: { blocks: Block[] }
  ) => void;
  resetSlide: (deckKind: DeckKind, slideKey: string) => Promise<void>;
  saving: boolean;
  ready: boolean;
}

const EditorCtx = createContext<EditorState | null>(null);

const keyOf = (k: DeckKind, s: string) => `${k}::${s}`;

export function EditorProvider({
  children,
  authReady,
}: {
  children: ReactNode;
  authReady: boolean;
}) {
  const [editing, setEditing] = useState(false);
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);
  const [overrides, setOverrides] = useState<Record<string, SlideOverride>>({});
  const [ready, setReady] = useState(false);
  const [saving, setSaving] = useState(false);
  const dirtyRef = useRef<Set<string>>(new Set());
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Initial load of all overrides for both deck kinds.
  useEffect(() => {
    if (!authReady) return;
    let cancelled = false;
    (async () => {
      try {
        const [lrh, imp] = await Promise.all([
          listOverrides({ data: { deckKind: "lrh" } }),
          listOverrides({ data: { deckKind: "imported" } }),
        ]);
        if (cancelled) return;
        const map: Record<string, SlideOverride> = {};
        for (const r of [...lrh, ...imp] as OverrideDTO[]) {
          map[keyOf(r.deckKind, r.slideKey)] = {
            deckKind: r.deckKind,
            slideKey: r.slideKey,
            blocks: r.blocks as Block[],
            highlightKeyword: r.highlightKeyword,
            layoutVariant: r.layoutVariant,
          };
        }
        setOverrides(map);
        setReady(true);
      } catch (err) {
        console.error("[editor] load overrides failed", err);
        setReady(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [authReady]);

  const flush = useCallback(async () => {
    const keys = Array.from(dirtyRef.current);
    dirtyRef.current.clear();
    if (keys.length === 0) return;
    setSaving(true);
    try {
      const snapshot = overridesRef.current;
      await Promise.all(
        keys.map((k) => {
          const o = snapshot[k];
          if (!o) return Promise.resolve();
          return upsertOverride({
            data: {
              deckKind: o.deckKind,
              slideKey: o.slideKey,
              blocks: o.blocks,
              highlightKeyword: o.highlightKeyword,
              layoutVariant: o.layoutVariant,
            },
          });
        })
      );
    } catch (err) {
      console.error("[editor] save failed", err);
    } finally {
      setSaving(false);
    }
  }, []);

  // Keep ref of latest overrides for the debounced flush.
  const overridesRef = useRef(overrides);
  useEffect(() => {
    overridesRef.current = overrides;
  }, [overrides]);

  const scheduleSave = useCallback(
    (k: string) => {
      dirtyRef.current.add(k);
      if (saveTimer.current) clearTimeout(saveTimer.current);
      saveTimer.current = setTimeout(() => {
        flush();
      }, 600);
    },
    [flush]
  );

  // Flush on unmount / page hide.
  useEffect(() => {
    const onHide = () => flush();
    window.addEventListener("beforeunload", onHide);
    window.addEventListener("pagehide", onHide);
    return () => {
      window.removeEventListener("beforeunload", onHide);
      window.removeEventListener("pagehide", onHide);
    };
  }, [flush]);

  const getOverride = useCallback(
    (deckKind: DeckKind, slideKey: string) =>
      overrides[keyOf(deckKind, slideKey)] ?? null,
    [overrides]
  );

  const updateOverride = useCallback<EditorState["updateOverride"]>(
    (deckKind, slideKey, patch, defaults) => {
      const k = keyOf(deckKind, slideKey);
      setOverrides((prev) => {
        const existing = prev[k] ?? {
          deckKind,
          slideKey,
          blocks: defaults.blocks,
          highlightKeyword: null,
          layoutVariant: null,
        };
        const next: SlideOverride = {
          ...existing,
          ...patch,
          deckKind,
          slideKey,
        };
        return { ...prev, [k]: next };
      });
      scheduleSave(k);
    },
    [scheduleSave]
  );

  const updateBlock = useCallback<EditorState["updateBlock"]>(
    (deckKind, slideKey, blockId, patch, defaults) => {
      const k = keyOf(deckKind, slideKey);
      setOverrides((prev) => {
        const existing = prev[k] ?? {
          deckKind,
          slideKey,
          blocks: defaults.blocks,
          highlightKeyword: null,
          layoutVariant: null,
        };
        const blocks = existing.blocks.map((b) =>
          b.id === blockId ? { ...b, ...patch } : b
        );
        return { ...prev, [k]: { ...existing, blocks } };
      });
      scheduleSave(k);
    },
    [scheduleSave]
  );

  const resetSlide = useCallback(
    async (deckKind: DeckKind, slideKey: string) => {
      const k = keyOf(deckKind, slideKey);
      setOverrides((prev) => {
        const next = { ...prev };
        delete next[k];
        return next;
      });
      dirtyRef.current.delete(k);
      try {
        await resetOverride({ data: { deckKind, slideKey } });
      } catch (err) {
        console.error("[editor] reset failed", err);
      }
    },
    []
  );

  const value = useMemo<EditorState>(
    () => ({
      editing,
      setEditing,
      selectedBlockId,
      setSelectedBlockId,
      getOverride,
      updateOverride,
      updateBlock,
      resetSlide,
      saving,
      ready,
    }),
    [
      editing,
      selectedBlockId,
      getOverride,
      updateOverride,
      updateBlock,
      resetSlide,
      saving,
      ready,
    ]
  );

  return <EditorCtx.Provider value={value}>{children}</EditorCtx.Provider>;
}

export function useEditor() {
  const ctx = useContext(EditorCtx);
  if (!ctx) throw new Error("useEditor must be used inside <EditorProvider>");
  return ctx;
}
