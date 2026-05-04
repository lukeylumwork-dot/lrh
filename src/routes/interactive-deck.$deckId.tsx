import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useAnonAuth } from "@/components/interactive-deck/useAnonAuth";
import {
  getDeckBundle,
  type DeckSlideDTO,
  type HotspotDTO,
  type DeckDTO,
} from "@/server/interactiveDeck.functions";
import { DeckViewer } from "@/components/interactive-deck/DeckViewer";
import { VariantToggle } from "@/components/interactive-deck/VariantToggle";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/interactive-deck/$deckId")({
  head: () => ({
    meta: [{ title: "Interactive Deck" }],
  }),
  component: DeckViewerPage,
});

function DeckViewerPage() {
  const { deckId } = Route.useParams();
  const { authReady, authError } = useAnonAuth();
  const [bundle, setBundle] = useState<{
    deck: DeckDTO;
    slides: DeckSlideDTO[];
    hotspots: HotspotDTO[];
  } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [variant, setVariant] = useState("default");

  useEffect(() => {
    if (!authReady) return;
    getDeckBundle({ data: { deckId } })
      .then((b) => {
        setBundle(b);
        const variants = Array.from(new Set(b.slides.map((s) => s.variant)));
        if (variants.length && !variants.includes("default")) setVariant(variants[0]);
      })
      .catch((e) => setError(e instanceof Error ? e.message : String(e)));
  }, [authReady, deckId]);

  const variants = useMemo(
    () =>
      bundle ? Array.from(new Set(bundle.slides.map((s) => s.variant))).sort() : [],
    [bundle],
  );

  if (authError) return <Centered>{authError}</Centered>;
  if (error) return <Centered>{error}</Centered>;
  if (!authReady || !bundle) return <Centered>Loading…</Centered>;

  return (
    <div className="min-h-screen bg-background">
      <header className="flex items-center justify-between border-b px-6 py-3">
        <div className="flex items-center gap-3">
          <Button asChild variant="ghost" size="sm">
            <Link to="/interactive-deck">← Decks</Link>
          </Button>
          <h1 className="text-base font-medium">{bundle.deck.title}</h1>
        </div>
        <div className="flex items-center gap-3">
          <VariantToggle
            variants={variants.length ? variants : ["default"]}
            current={variant}
            onChange={setVariant}
          />
          <Button asChild variant="outline" size="sm">
            <Link
              to="/interactive-deck/admin/$deckId"
              params={{ deckId: bundle.deck.id }}
            >
              Edit
            </Link>
          </Button>
        </div>
      </header>
      <main className="flex justify-center p-6">
        <DeckViewer
          slides={bundle.slides}
          hotspots={bundle.hotspots}
          variant={variant}
        />
      </main>
    </div>
  );
}

function Centered({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen items-center justify-center text-sm text-muted-foreground">
      {children}
    </div>
  );
}
