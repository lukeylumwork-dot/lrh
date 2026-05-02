import { useRef, useState } from "react";
import { Upload, FileText, Loader2 } from "lucide-react";
import { SlideLayout, SlideTitle } from "./SlideLayout";

interface Props {
  onUpload: (file: File) => Promise<void>;
}

export function ImportEmptyState({ onUpload }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [drag, setDrag] = useState(false);

  const handleFile = async (file: File) => {
    setError(null);
    setBusy(true);
    try {
      await onUpload(file);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <SlideLayout>
      <div className="flex-1 flex flex-col items-center justify-center text-center">
        <SlideTitle highlight="deck" highlightPosition="after" className="mb-4 text-4xl md:text-5xl">
          Import your existing
        </SlideTitle>
        <p className="text-foreground/60 mb-10 max-w-xl">
          Upload a <strong>.pptx</strong> or <strong>.pdf</strong>. Each slide will be parsed into
          a structured slide — title, bullets, and images for PPTX.
        </p>

        <label
          onDragOver={(e) => {
            e.preventDefault();
            setDrag(true);
          }}
          onDragLeave={() => setDrag(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDrag(false);
            const f = e.dataTransfer.files?.[0];
            if (f) handleFile(f);
          }}
          className={`relative w-full max-w-xl cursor-pointer rounded-md border-2 border-dashed transition px-10 py-16 flex flex-col items-center gap-4 ${
            drag
              ? "border-[var(--lrh-blue)] bg-[var(--lrh-soft-blue)]/40"
              : "border-border hover:border-[var(--lrh-blue)] hover:bg-[var(--lrh-soft-blue)]/20"
          }`}
        >
          <input
            ref={inputRef}
            type="file"
            accept=".pdf,.pptx,application/pdf,application/vnd.openxmlformats-officedocument.presentationml.presentation"
            className="sr-only"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) handleFile(f);
            }}
            disabled={busy}
          />
          {busy ? (
            <>
              <Loader2 className="h-10 w-10 text-[var(--lrh-blue)] animate-spin" />
              <span className="text-foreground/70">Parsing slides…</span>
            </>
          ) : (
            <>
              <div className="h-12 w-12 rounded-full bg-[var(--lrh-soft-blue)]/60 flex items-center justify-center">
                <Upload className="h-5 w-5 text-[var(--lrh-blue)]" />
              </div>
              <div>
                <div className="font-medium text-foreground">
                  Drop file here or click to browse
                </div>
                <div className="text-sm text-foreground/50 mt-1 flex items-center gap-2 justify-center">
                  <FileText className="h-3.5 w-3.5" />
                  PDF or PPTX, up to ~15 MB
                </div>
              </div>
            </>
          )}
        </label>

        {error && (
          <div className="mt-6 text-sm text-destructive max-w-xl">
            {error}
          </div>
        )}
      </div>
    </SlideLayout>
  );
}
