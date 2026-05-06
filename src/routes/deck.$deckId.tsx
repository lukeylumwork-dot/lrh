import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import {
  getPublicDeck,
  type DeckSlideDTO,
  type HotspotDTO,
  type DeckDTO,
} from "@/server/interactiveDeck.functions";
import { DeckViewer } from "@/components/interactive-deck/DeckViewer";
import { VariantToggle } from "@/components/interactive-deck/VariantToggle";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  SlideLayout,
  SlideEyebrow,
  SlideTitle,
  SlideBody,
} from "@/components/slides/SlideLayout";
import { SlideCard } from "@/components/slides/Card";

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
          eyebrow="Access restricted"
          title="This deck is"
          highlight="private"
          message="The owner hasn't made this deck publicly viewable. If you believe you should have access, please ask them to share a public link."
          deckId={deckId}
        />
      );
    }
    if (isMissing) {
      return (
        <ErrorScreen
          eyebrow="404"
          title="Deck"
          highlight="not found"
          message="We couldn't find a deck with this link. Double-check the URL or ask the sender for an updated link."
          deckId={deckId}
        />
      );
    }
    return (
      <ErrorScreen
        eyebrow="Error"
        title="Something went"
        highlight="wrong"
        message={error}
        deckId={deckId}
      />
    );
  }
  if (!bundle) return <DeckSkeleton />;

  if (bundle.slides.length === 0) {
    return (
      <ErrorScreen
        eyebrow={bundle.deck.title}
        title="No slides"
        highlight="uploaded yet"
        message="This deck doesn't have any slides yet. Please check back soon."
        deckTitle={bundle.deck.title}
        deckId={deckId}
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

function DeckSkeleton() {
  return (
    <div className="min-h-screen bg-background">
      <header className="flex items-center justify-between border-b px-6 py-3">
        <Skeleton className="h-5 w-48" />
        <div className="flex items-center gap-3">
          <Skeleton className="h-8 w-24" />
          <Skeleton className="h-8 w-28" />
        </div>
      </header>
      <main className="flex justify-center p-6">
        <div className="flex w-full max-w-6xl flex-col items-center gap-4">
          <Skeleton className="aspect-video w-full rounded-lg" />
          <div className="flex items-center gap-3">
            <Skeleton className="h-9 w-9" />
            <Skeleton className="h-4 w-12" />
            <Skeleton className="h-9 w-9" />
          </div>
        </div>
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

function ErrorScreen({
  eyebrow,
  title,
  highlight,
  message,
  action,
  deckTitle,
  deckId,
}: {
  eyebrow: string;
  title: string;
  highlight?: string;
  message: ReactNode;
  action?: ReactNode;
  deckTitle?: string;
  deckId?: string;
}) {
  return (
    <div
      className="relative min-h-screen w-full overflow-hidden"
      style={{ aspectRatio: "auto" }}
    >
      <SlideLayout>
        <div className="grid h-full grid-cols-12 gap-[var(--lrh-space-5)] items-center">
          <div className="col-span-12 md:col-span-7 md:col-start-2">
            <SlideEyebrow>{eyebrow}</SlideEyebrow>
            <SlideTitle highlight={highlight} highlightPosition="after">
              {title}
            </SlideTitle>
            <SlideBody muted className="mt-[var(--lrh-space-4)]">
              {message}
            </SlideBody>
            {action && <div className="mt-[var(--lrh-space-5)]">{action}</div>}
          </div>
          <div className="hidden md:col-span-3 md:block">
            <SlideCard variant="soft" className="h-full">
              <p className="text-xs uppercase tracking-[0.16em] text-[var(--lrh-navy-500)]">
                London Reporting House
              </p>
              <p className="mt-2 text-sm text-[var(--lrh-navy-700)]">
                Private &amp; Confidential
              </p>
              {(deckTitle || deckId) && (
                <div className="mt-[var(--lrh-space-4)] border-t border-[var(--lrh-surface-300)] pt-[var(--lrh-space-3)] space-y-2">
                  {deckTitle && (
                    <div>
                      <p className="text-[10px] uppercase tracking-[0.16em] text-[var(--lrh-navy-500)]">
                        Deck
                      </p>
                      <p className="text-sm text-[var(--lrh-navy-700)] break-words">
                        {deckTitle}
                      </p>
                    </div>
                  )}
                  {deckId && (
                    <div>
                      <p className="text-[10px] uppercase tracking-[0.16em] text-[var(--lrh-navy-500)]">
                        Deck ID
                      </p>
                      <p className="font-mono text-xs text-[var(--lrh-navy-700)] break-all">
                        {deckId}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </SlideCard>
          </div>
        </div>
      </SlideLayout>
    </div>
  );
}
