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
import { AlertTriangle, ArrowDown, ArrowUp, CheckCircle2, Trash2, XCircle } from "lucide-react";
import { toast } from "sonner";
import {
  checkSlideQuality,
  type SlideQualityReport,
} from "@/lib/slideQualityCheck";

export const Route = createFileRoute("/interactive-deck/")({
  head: () => ({
    meta: [
      { title: "Interactive Decks" },
      { name: "description", content: "Pixel-perfect interactive slide decks." },
    ],
  }),
  component: DeckIndexPage,
});

type RenderedSlide = {
  tempId: string;
  blob: Blob;
  previewUrl: string;
  width: number;
  height: number;
  label: string;
  quality: SlideQualityReport;
};

const TARGET_WIDTH = 1920;

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
  const [reviewSlides, setReviewSlides] = useState<RenderedSlide[] | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!authReady) return;
    listDecks()
      .then(setDecks)
      .catch((e) => setError(e instanceof Error ? e.message : String(e)));
  }, [authReady]);

  // Cleanup blob URLs on unmount or when review changes.
  useEffect(() => {
    return () => {
      reviewSlides?.forEach((s) => URL.revokeObjectURL(s.previewUrl));
    };
  }, [reviewSlides]);

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

  const handlePdfPick = async (file: File) => {
    setImportError(null);
    setImporting(true);
    setImportStatus("Reading PDF…");
    try {
      if (file.size > 100 * 1024 * 1024) {
        throw new Error("PDF is larger than 100 MB. Please split it first.");
      }
      const { renderPdfToPngBlobs } = await import("@/lib/pdfToImages");
      const pages = await renderPdfToPngBlobs(file, {
        targetWidth: TARGET_WIDTH,
        onProgress: (i, total) => setImportStatus(`Rendering page ${i} / ${total}…`),
      });
      const baseName = file.name.replace(/\.pdf$/i, "");
      if (!pdfTitle.trim()) setPdfTitle(baseName);

      const rendered: RenderedSlide[] = [];
      for (let i = 0; i < pages.length; i++) {
        setImportStatus(`Checking quality ${i + 1} / ${pages.length}…`);
        const p = pages[i];
        const quality = await checkSlideQuality(p.blob, p.width, p.height, {
          targetWidth: TARGET_WIDTH,
        });
        rendered.push({
          tempId: crypto.randomUUID(),
          blob: p.blob,
          previewUrl: URL.createObjectURL(p.blob),
          width: p.width,
          height: p.height,
          label: `Slide ${i + 1}`,
          quality,
        });
      }
      setReviewSlides(rendered);
      setImportStatus(null);
    } catch (e) {
      setImportError(e instanceof Error ? e.message : String(e));
      setImportStatus(null);
    } finally {
      setImporting(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const cancelReview = () => {
    reviewSlides?.forEach((s) => URL.revokeObjectURL(s.previewUrl));
    setReviewSlides(null);
    setPdfTitle("");
  };

  const moveSlide = (idx: number, dir: -1 | 1) => {
    setReviewSlides((prev) => {
      if (!prev) return prev;
      const j = idx + dir;
      if (j < 0 || j >= prev.length) return prev;
      const next = prev.slice();
      [next[idx], next[j]] = [next[j], next[idx]];
      return next;
    });
  };

  const removeSlide = (idx: number) => {
    setReviewSlides((prev) => {
      if (!prev) return prev;
      URL.revokeObjectURL(prev[idx].previewUrl);
      const next = prev.slice();
      next.splice(idx, 1);
      return next.length ? next : null;
    });
  };

  const renameSlide = (idx: number, label: string) => {
    setReviewSlides((prev) => {
      if (!prev) return prev;
      const next = prev.slice();
      next[idx] = { ...next[idx], label };
      return next;
    });
  };

  const qualitySummary = (() => {
    if (!reviewSlides) return { errors: 0, warnings: 0 };
    let errors = 0;
    let warnings = 0;
    for (const s of reviewSlides) {
      if (s.quality.worst === "error") errors++;
      else if (s.quality.worst === "warning") warnings++;
    }
    return { errors, warnings };
  })();

  const confirmAndSave = async (force = false) => {
    if (!reviewSlides || reviewSlides.length === 0) return;
    if (qualitySummary.errors > 0 && !force) {
      setImportError(
        `${qualitySummary.errors} slide(s) failed the export-quality check. Fix or remove them, or click "Save anyway".`,
      );
      return;
    }
    setSaving(true);
    setImportError(null);
    try {
      const { data: userRes, error: userErr } = await supabase.auth.getUser();
      if (userErr || !userRes.user) throw new Error("You must be signed in.");
      const userId = userRes.user.id;

      const importId = crypto.randomUUID();
      const uploaded: {
        image_url: string;
        width: number;
        height: number;
        label: string | null;
      }[] = [];
      for (let i = 0; i < reviewSlides.length; i++) {
        setImportStatus(`Uploading slide ${i + 1} / ${reviewSlides.length}…`);
        const s = reviewSlides[i];
        const path = `${userId}/imports/${importId}/slide-${String(i + 1).padStart(3, "0")}.png`;
        const { error: upErr } = await supabase.storage
          .from("interactive-deck-slides")
          .upload(path, s.blob, { contentType: "image/png", upsert: false });
        if (upErr) throw new Error(`Upload failed on slide ${i + 1}: ${upErr.message}`);
        const { data: pub } = supabase.storage
          .from("interactive-deck-slides")
          .getPublicUrl(path);
        uploaded.push({
          image_url: pub.publicUrl,
          width: s.width,
          height: s.height,
          label: s.label.trim() || null,
        });
      }

      setImportStatus("Saving deck…");
      const finalTitle = pdfTitle.trim() || "Imported Deck";
      const { deckId } = await createDeckFromImages({
        data: { title: finalTitle, slides: uploaded },
      });

      reviewSlides.forEach((s) => URL.revokeObjectURL(s.previewUrl));
      setReviewSlides(null);
      setPdfTitle("");
      setImportStatus(null);
      toast.success("Deck imported");
      navigate({ to: "/interactive-deck/admin/$deckId", params: { deckId } });
    } catch (e) {
      setImportError(e instanceof Error ? e.message : String(e));
      setImportStatus(null);
    } finally {
      setSaving(false);
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

      <section className="space-y-3 rounded-md border p-4">
        <div>
          <h2 className="text-base font-medium">Import from PDF</h2>
          <p className="text-xs text-muted-foreground">
            Each PDF page becomes one slide (rendered at 1920px, PNG). You'll be able to
            review, rename, reorder, and remove slides before saving.
          </p>
        </div>

        {!reviewSlides && (
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
                if (f) void handlePdfPick(f);
              }}
              className="sm:max-w-xs"
            />
          </div>
        )}

        {importStatus && (
          <p className="text-sm text-muted-foreground">{importStatus}</p>
        )}
        {importError && <p className="text-sm text-destructive">{importError}</p>}

        {reviewSlides && (
          <div className="space-y-3">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <Input
                placeholder="Deck title"
                value={pdfTitle}
                onChange={(e) => setPdfTitle(e.target.value)}
                disabled={saving}
                className="sm:max-w-sm"
              />
              <p className="text-xs text-muted-foreground">
                {reviewSlides.length} slide{reviewSlides.length === 1 ? "" : "s"} ready
              </p>
            </div>

            <ul className="divide-y rounded-md border">
              {reviewSlides.map((s, idx) => (
                <li key={s.tempId} className="flex items-center gap-3 p-2">
                  <span className="w-8 shrink-0 text-center text-xs text-muted-foreground">
                    {idx + 1}
                  </span>
                  <div
                    className="shrink-0 overflow-hidden rounded border bg-muted"
                    style={{ width: 96, aspectRatio: "16 / 9" }}
                  >
                    <img
                      src={s.previewUrl}
                      alt={`Slide ${idx + 1} preview`}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <Input
                    value={s.label}
                    onChange={(e) => renameSlide(idx, e.target.value)}
                    placeholder={`Slide ${idx + 1}`}
                    disabled={saving}
                    className="flex-1"
                  />
                  <div className="flex shrink-0 gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => moveSlide(idx, -1)}
                      disabled={saving || idx === 0}
                      aria-label="Move up"
                    >
                      <ArrowUp className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => moveSlide(idx, 1)}
                      disabled={saving || idx === reviewSlides.length - 1}
                      aria-label="Move down"
                    >
                      <ArrowDown className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeSlide(idx)}
                      disabled={saving}
                      aria-label="Remove slide"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </li>
              ))}
            </ul>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={cancelReview} disabled={saving}>
                Cancel
              </Button>
              <Button onClick={confirmAndSave} disabled={saving || reviewSlides.length === 0}>
                {saving ? "Saving…" : `Save deck (${reviewSlides.length} slides)`}
              </Button>
            </div>
          </div>
        )}
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
