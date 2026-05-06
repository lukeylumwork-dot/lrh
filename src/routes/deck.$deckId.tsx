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
    const isPrivate = /private/i.test(error);
    const isMissing = /does not exist|not found|no rows/i.test(error);
    if (isPrivate) {
      return (
        <ErrorScreen
          emoji="🔒"
          title="This deck is private"
          message="The owner hasn't made this deck publicly viewable. If you believe you should have access, please ask them to share a public link."
        />
      );
    }
    if (isMissing) {
      return (
        <ErrorScreen
          emoji="🔍"
          title="Deck not found"
          message="We couldn't find a deck with this link. Double-check the URL or ask the sender for an updated link."
        />
      );
    }
    return (
      <ErrorScreen
        emoji="⚠️"
        title="Something went wrong"
        message={error}
      />
    );
  }
  if (!bundle) return <Centered>Loading…</Centered>;

  if (bundle.slides.length === 0) {
    return (
      <ErrorScreen
        emoji="🖼️"
        title={bundle.deck.title}
        message="This deck doesn't have any slides yet. Please check back soon."
      />
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
