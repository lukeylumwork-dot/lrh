import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  getPublicDeck,
  type DeckSlideDTO,
  type HotspotDTO,
  type DeckDTO,
} from "@/server/interactiveDeck.functions";
import { DeckViewer } from "@/components/interactive-deck/DeckViewer";
import { VariantToggle } from "@/components/interactive-deck/VariantToggle";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/deck/$deckId")({
  head: () => ({ meta: [{ title: "Interactive Deck" }] }),
  component: PublicDeckPage,
});

function PublicDeckPage() {
  const { deckId } = Route.useParams();
  const [bundle, setBundle] = useState<{
    deck: DeckDTO;
    slides: DeckSlideDTO[];
    hotspots: HotspotDTO[];
  } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [variant, setVariant] = useState("Light");

  useEffect(() => {
    getPublicDeck({ data: { deckId } })
      .then((b) => {
        setBundle(b);
        const variants = Array.from(new Set(b.slides.map((s) => s.variant)));
        if (variants.length && !variants.includes("Light")) setVariant(variants[0]);
      })
      .catch((e) => setError(e instanceof Error ? e.message : String(e)));
  }, [deckId]);

  const variants = useMemo(
    () =>
      bundle ? Array.from(new Set(bundle.slides.map((s) => s.variant))).sort() : [],
    [bundle],
  );

  if (error) {
    const isPrivate = /private|does not exist/i.test(error);
    return (
      <Centered>
        <div className="space-y-2 text-center">
          <h1 className="text-lg font-medium text-foreground">
            {isPrivate ? "This deck isn't available" : "Something went wrong"}
          </h1>
          <p className="text-sm text-muted-foreground">{error}</p>
        </div>
      </Centered>
    );
  }
  if (!bundle) return <Centered>Loading…</Centered>;

  if (bundle.slides.length === 0) {
    return (
      <Centered>
        <div className="space-y-2 text-center">
          <h1 className="text-lg font-medium text-foreground">{bundle.deck.title}</h1>
          <p className="text-sm text-muted-foreground">
            No slides have been uploaded for this deck yet.
          </p>
        </div>
      </Centered>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="flex items-center justify-between border-b px-6 py-3">
        <h1 className="text-base font-medium">{bundle.deck.title}</h1>
        <div className="flex items-center gap-3">
          {variants.length > 1 && (
            <VariantToggle
              variants={variants}
              current={variant}
              onChange={setVariant}
            />
          )}
          <Button asChild size="sm">
            <a
              href="https://londonreportinghouse.com"
              target="_blank"
              rel="noopener noreferrer"
            >
              Book a Demo
            </a>
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
    <div className="flex min-h-screen items-center justify-center p-6 text-sm text-muted-foreground">
      {children}
    </div>
  );
}
