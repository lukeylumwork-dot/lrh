import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState, useCallback } from "react";
import { SlideDeck } from "@/components/slides/SlideDeck";
import { TitleSlide } from "@/components/slides/TitleSlide";
import { ProblemSlide } from "@/components/slides/ProblemSlide";
import { SolutionSlide } from "@/components/slides/SolutionSlide";
import { CompetitionSlide } from "@/components/slides/CompetitionSlide";
import { StorySlide } from "@/components/slides/StorySlide";
import { PipelineSlide } from "@/components/slides/PipelineSlide";
import {
  ImportedSlide,
  defaultBlocksForImported,
} from "@/components/slides/ImportedSlide";
import { ImportEmptyState } from "@/components/slides/ImportEmptyState";
import { DeckModeToggle } from "@/components/slides/DeckModeToggle";
import { ExportPdfButton } from "@/components/slides/ExportPdfButton";
import { EditorProvider, useEditor } from "@/components/slides/editor/EditorContext";
import { EditorToolbar } from "@/components/slides/editor/EditorToolbar";
import { EditorSidePanel } from "@/components/slides/editor/EditorSidePanel";
import { LrhKeywordPanel } from "@/components/slides/editor/LrhKeywordPanel";
import { SlideKeywordProvider } from "@/components/slides/Highlighted";
import { supabase } from "@/integrations/supabase/client";
import {
  parseAndSaveDeck,
  getLatestImportedDeck,
  deleteImportedDeck,
  type ImportedDeckDTO,
} from "@/server/imports.functions";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "London Reporting House — Investor Presentation" },
      { name: "description", content: "LRH is building the data layer for global repo markets. Investor presentation, May 2026." },
      { property: "og:title", content: "London Reporting House — Investor Presentation" },
      { property: "og:description", content: "The data layer for global repo markets." },
    ],
  }),
  component: Index,
});

const LRH_SLIDES: { id: string; node: React.ReactNode }[] = [
  { id: "title", node: <TitleSlide /> },
  { id: "problem", node: <ProblemSlide /> },
  { id: "solution", node: <SolutionSlide /> },
  { id: "competition", node: <CompetitionSlide /> },
  { id: "story", node: <StorySlide /> },
  { id: "pipeline", node: <PipelineSlide /> },
];

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => {
      const result = r.result as string;
      const idx = result.indexOf(",");
      resolve(idx >= 0 ? result.slice(idx + 1) : result);
    };
    r.onerror = () => reject(r.error);
    r.readAsDataURL(file);
  });
}

function Index() {
  const [authReady, setAuthReady] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    // Lazy import to keep this client-only.
    import("@/integrations/supabase/install-fetch-auth").then((m) =>
      m.installServerFnAuth(),
    );
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data } = await supabase.auth.getSession();
      if (!data.session) {
        const { error } = await supabase.auth.signInAnonymously();
        if (error && !cancelled) {
          setAuthError(
            "Anonymous sign-in is disabled for this project. Enable it in Cloud → Users → Auth settings → General."
          );
          return;
        }
      }
      if (!cancelled) setAuthReady(true);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <EditorProvider authReady={authReady}>
      <DeckShell authReady={authReady} authError={authError} />
    </EditorProvider>
  );
}

function DeckShell({
  authReady,
  authError,
}: {
  authReady: boolean;
  authError: string | null;
}) {
  const [mode, setMode] = useState<"lrh" | "imported">("lrh");
  const [deck, setDeck] = useState<ImportedDeckDTO | null>(null);
  const [loading, setLoading] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const { getOverride } = useEditor();

  const loadDeck = useCallback(async () => {
    if (!authReady) return;
    setLoading(true);
    try {
      const d = await getLatestImportedDeck();
      setDeck(d);
    } catch (e) {
      console.error("getLatestImportedDeck failed", e);
    } finally {
      setLoading(false);
    }
  }, [authReady]);

  useEffect(() => {
    loadDeck();
  }, [loadDeck]);

  const handleUpload = useCallback(
    async (file: File) => {
      if (file.size > 20 * 1024 * 1024) {
        throw new Error("File too large (max 20 MB).");
      }
      const fileBase64 = await fileToBase64(file);
      await parseAndSaveDeck({
        data: { filename: file.name, mimeType: file.type, fileBase64 },
      });
      await loadDeck();
    },
    [loadDeck]
  );

  const handleDelete = useCallback(async () => {
    if (!deck) return;
    if (!confirm("Delete the imported deck?")) return;
    await deleteImportedDeck({ data: { deckId: deck.id } });
    setDeck(null);
  }, [deck]);

  const handleReplace = useCallback(async () => {
    if (!deck) return;
    if (!confirm("Replace the imported deck with a new upload?")) return;
    await deleteImportedDeck({ data: { deckId: deck.id } });
    setDeck(null);
  }, [deck]);

  const slides = useMemo(() => {
    if (mode === "lrh") {
      return LRH_SLIDES.map((s) => ({
        id: s.id,
        node: (
          <SlideKeywordProvider deckKind="lrh" slideKey={s.id}>
            {s.node}
          </SlideKeywordProvider>
        ),
      }));
    }
    if (!deck || deck.slides.length === 0) {
      return [
        {
          id: "import-empty",
          node: authError ? (
            <div className="absolute inset-0 flex items-center justify-center px-12 text-center">
              <p className="text-destructive max-w-lg">{authError}</p>
            </div>
          ) : (
            <ImportEmptyState onUpload={handleUpload} />
          ),
        },
      ];
    }
    return deck.slides.map((s) => ({
      id: `imp-${deck.id}-${s.index}`,
      node: (
        <SlideKeywordProvider deckKind="imported" slideKey={`${deck.id}:${s.index}`}>
          <ImportedSlide slide={s} total={deck.slides.length} deckId={deck.id} />
        </SlideKeywordProvider>
      ),
    }));
  }, [mode, deck, handleUpload, authError]);

  // Compute current slide info for the editor side panel.
  const editorContext = useMemo(() => {
    if (mode !== "imported" || !deck || deck.slides.length === 0) return null;
    const slide = deck.slides[currentIndex];
    if (!slide) return null;
    const slideKey = `${deck.id}:${slide.index}`;
    const defaultBlocks = defaultBlocksForImported(slide);
    const ov = getOverride("imported", slideKey);
    return {
      slideKey,
      blocks: ov?.blocks ?? defaultBlocks,
      defaults: { blocks: defaultBlocks },
      highlightKeyword: ov?.highlightKeyword ?? null,
      layoutVariant: ov?.layoutVariant ?? null,
    };
  }, [mode, deck, currentIndex, getOverride]);

  return (
    <>
      <SlideDeck slides={slides} onIndexChange={setCurrentIndex} />
      <ExportPdfButton />
      <DeckModeToggle
        mode={mode}
        onModeChange={(m) => {
          setMode(m);
          setCurrentIndex(0);
        }}
        hasImported={!!deck}
        onReplace={handleReplace}
        onDelete={handleDelete}
      />
      {mode === "imported" && (
        <>
          <EditorToolbar
            deckKind="imported"
            currentSlideKey={editorContext?.slideKey ?? null}
          />
          {editorContext && (
            <EditorSidePanel
              deckKind="imported"
              slideKey={editorContext.slideKey}
              blocks={editorContext.blocks}
              defaults={editorContext.defaults}
              highlightKeyword={editorContext.highlightKeyword}
              layoutVariant={editorContext.layoutVariant}
            />
          )}
        </>
      )}
      {mode === "lrh" && LRH_SLIDES[currentIndex] && (
        <>
          <EditorToolbar
            deckKind="lrh"
            currentSlideKey={LRH_SLIDES[currentIndex].id}
          />
          <LrhKeywordPanel slideKey={LRH_SLIDES[currentIndex].id} />
        </>
      )}
      {loading && mode === "imported" && (
        <div className="fixed bottom-5 right-5 z-30 text-xs text-foreground/50">Loading…</div>
      )}
    </>
  );
}
