import { useState } from "react";
import { FileDown, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface ExportPdfButtonProps {
  className?: string;
}

/**
 * Triggers the browser's native print dialog with a print stylesheet that
 * lays out every slide at exact 1920x1080 (landscape) so "Save as PDF"
 * yields a deck whose pages match the on-screen preview.
 *
 * The print container (.print-deck) is rendered into the DOM by SlideDeck.
 */
export function ExportPdfButton({ className }: ExportPdfButtonProps) {
  const [busy, setBusy] = useState(false);

  const handleExport = async () => {
    setBusy(true);
    document.body.classList.add("printing-deck");
    // Allow layout/fonts/images a tick to settle before opening the dialog.
    await new Promise((r) => setTimeout(r, 150));
    try {
      window.print();
    } finally {
      // Small delay so the print preview has captured the DOM before we revert.
      setTimeout(() => {
        document.body.classList.remove("printing-deck");
        setBusy(false);
      }, 500);
    }
  };

  return (
    <button
      type="button"
      onClick={handleExport}
      disabled={busy}
      aria-label="Export deck as PDF"
      className={cn(
        "fixed top-4 right-16 z-30 h-9 px-3 rounded-full bg-card/90 backdrop-blur border border-border",
        "flex items-center gap-2 text-xs font-medium text-foreground",
        "hover:bg-[var(--lrh-soft-blue)]/40 transition-all hover:scale-105 active:scale-95",
        "disabled:opacity-60 disabled:cursor-wait",
        className,
      )}
    >
      {busy ? <Loader2 size={14} className="animate-spin" /> : <FileDown size={14} />}
      <span>Export PDF</span>
    </button>
  );
}
