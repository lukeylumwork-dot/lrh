import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { useAnonAuth } from "@/components/interactive-deck/useAnonAuth";
import {
  listDecks,
  createDeck,
  createDeckFromImages,
  type DeckDTO,
} from "@/server/interactiveDeck.functions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";

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
  const navigate = useNavigate();
  const [decks, setDecks] = useState<DeckDTO[] | null>(null);
  const [title, setTitle] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  // PDF import state
  const fileRef = useRef<HTMLInputElement>(null);
  const [pdfTitle, setPdfTitle] = useState("");
  const [importStatus, setImportStatus] = useState<string | null>(null);
  const [importing, setImporting] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);

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

  const handlePdfImport = async (file: File) => {
    setImportError(null);
    setImporting(true);
    setImportStatus("Reading PDF…");
    try {
      if (file.size > 100 * 1024 * 1024) {
        throw new Error("PDF is larger than 100 MB. Please split it first.");
      }
      const { data: userRes, error: userErr } = await supabase.auth.getUser();
      if (userErr || !userRes.user) throw new Error("You must be signed in.");
      const userId = userRes.user.id;

      const { renderPdfToPngBlobs } = await import("@/lib/pdfToImages");
      const pages = await renderPdfToPngBlobs(file, {
        targetWidth: 1920,
        onProgress: (i, total) => setImportStatus(`Rendering page ${i} / ${total}…`),
      });

      const importId = crypto.randomUUID();
      const uploaded: { image_url: string; width: number; height: number }[] = [];
      for (let i = 0; i < pages.length; i++) {
        setImportStatus(`Uploading slide ${i + 1} / ${pages.length}…`);
        const p = pages[i];
        const path = `${userId}/imports/${importId}/slide-${String(i + 1).padStart(3, "0")}.png`;
        const { error: upErr } = await supabase.storage
          .from("interactive-deck-slides")
          .upload(path, p.blob, { contentType: "image/png", upsert: false });
        if (upErr) throw new Error(`Upload failed on slide ${i + 1}: ${upErr.message}`);
        const { data: pub } = supabase.storage
          .from("interactive-deck-slides")
          .getPublicUrl(path);
        uploaded.push({ image_url: pub.publicUrl, width: p.width, height: p.height });
      }

      setImportStatus("Saving deck…");
      const finalTitle =
        pdfTitle.trim() || file.name.replace(/\.pdf$/i, "") || "Imported Deck";
      const { deckId } = await createDeckFromImages({
        data: { title: finalTitle, slides: uploaded },
      });

      setImportStatus(null);
      setPdfTitle("");
      if (fileRef.current) fileRef.current.value = "";
      navigate({ to: "/interactive-deck/admin/$deckId", params: { deckId } });
    } catch (e) {
      setImportError(e instanceof Error ? e.message : String(e));
      setImportStatus(null);
    } finally {
      setImporting(false);
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

      <section className="rounded-md border p-4 space-y-3">
        <div>
          <h2 className="text-base font-medium">Import from PDF</h2>
          <p className="text-xs text-muted-foreground">
            Each PDF page becomes one slide (rendered at 1920px, PNG).
          </p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Input
            placeholder="Deck title (optional — defaults to filename)"
            value={pdfTitle}
            onChange={(e) => setPdfTitle(e.target.value)}
            disabled={importing}
          />
          <Input
            ref={fileRef}
            type="file"
            accept="application/pdf"
            disabled={!authReady || importing}
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) void handlePdfImport(f);
            }}
            className="sm:max-w-xs"
          />
        </div>
        {importStatus && (
          <p className="text-sm text-muted-foreground">{importStatus}</p>
        )}
        {importError && <p className="text-sm text-destructive">{importError}</p>}
      </section>

      <div className="flex gap-2">
        <Input
          placeholder="New deck title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleCreate()}
          disabled={!authReady || busy}
        />
        <Button onClick={handleCreate} disabled={!authReady || busy || !title.trim()}>
          Create empty deck
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
