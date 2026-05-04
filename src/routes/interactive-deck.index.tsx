import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useAnonAuth } from "@/components/interactive-deck/useAnonAuth";
import { listDecks, createDeck, type DeckDTO } from "@/server/interactiveDeck.functions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export const Route = createFileRoute("/interactive-deck/")({
  head: () => ({
    meta: [
      { title: "Interactive Decks" },
      { name: "description", content: "Pixel-perfect interactive slide decks." },
    ],
  }),
  component: DeckIndexPage,
});

function DeckIndexPage() {
  const { authReady, authError } = useAnonAuth();
  const [decks, setDecks] = useState<DeckDTO[] | null>(null);
  const [title, setTitle] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!authReady) return;
    listDecks()
      .then(setDecks)
      .catch((e) => setError(e instanceof Error ? e.message : String(e)));
  }, [authReady]);

  const handleCreate = async () => {
    if (!title.trim()) return;
    setBusy(true);
    try {
      const d = await createDeck({ data: { title: title.trim() } });
      setDecks((prev) => [d, ...(prev ?? [])]);
      setTitle("");
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  };

  if (authError) {
    return <ErrorScreen message={authError} />;
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6 p-8">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Interactive Decks</h1>
          <p className="text-sm text-muted-foreground">
            Upload Canva slides as images and add hotspots.
          </p>
        </div>
      </header>

      <div className="flex gap-2">
        <Input
          placeholder="New deck title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleCreate()}
          disabled={!authReady || busy}
        />
        <Button onClick={handleCreate} disabled={!authReady || busy || !title.trim()}>
          Create
        </Button>
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <ul className="divide-y rounded-md border">
        {(decks ?? []).map((d) => (
          <li key={d.id} className="flex items-center justify-between p-4">
            <div>
              <p className="font-medium">{d.title}</p>
              <p className="text-xs text-muted-foreground">
                {new Date(d.created_at).toLocaleString()}
              </p>
            </div>
            <div className="flex gap-2">
              <Button asChild variant="outline" size="sm">
                <Link to="/interactive-deck/$deckId" params={{ deckId: d.id }}>
                  View
                </Link>
              </Button>
              <Button asChild size="sm">
                <Link
                  to="/interactive-deck/admin/$deckId"
                  params={{ deckId: d.id }}
                >
                  Edit
                </Link>
              </Button>
            </div>
          </li>
        ))}
        {decks && decks.length === 0 && (
          <li className="p-6 text-center text-sm text-muted-foreground">
            No decks yet. Create one above.
          </li>
        )}
      </ul>
    </div>
  );
}

function ErrorScreen({ message }: { message: string }) {
  return (
    <div className="mx-auto max-w-lg p-8">
      <div className="rounded-md border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
        {message}
      </div>
    </div>
  );
}
