// Browser-only: rasterize each PDF page to a PNG Blob via pdfjs-dist.
import * as pdfjsLib from "pdfjs-dist";
// Vite serves the worker as a URL.
import workerSrc from "pdfjs-dist/build/pdf.worker.min.mjs?url";

pdfjsLib.GlobalWorkerOptions.workerSrc = workerSrc;

export interface RenderedPage {
  blob: Blob;
  width: number;
  height: number;
}

export interface RenderOptions {
  /** Target pixel width for the output PNG. Default 1920. */
  targetWidth?: number;
  /** Hard cap on number of pages. Default 200. */
  maxPages?: number;
  onProgress?: (pageIndex: number, totalPages: number) => void;
}

export async function renderPdfToPngBlobs(
  file: File,
  opts: RenderOptions = {},
): Promise<RenderedPage[]> {
  const targetWidth = opts.targetWidth ?? 1920;
  const maxPages = opts.maxPages ?? 200;

  const buf = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: buf }).promise;

  if (pdf.numPages > maxPages) {
    throw new Error(
      `PDF has ${pdf.numPages} pages, which exceeds the ${maxPages}-page limit.`,
    );
  }

  const pages: RenderedPage[] = [];

  for (let i = 1; i <= pdf.numPages; i++) {
    opts.onProgress?.(i, pdf.numPages);
    const page = await pdf.getPage(i);
    const viewport1 = page.getViewport({ scale: 1 });
    const scale = targetWidth / viewport1.width;
    const viewport = page.getViewport({ scale });

    const canvas = document.createElement("canvas");
    canvas.width = Math.ceil(viewport.width);
    canvas.height = Math.ceil(viewport.height);
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Could not get 2D canvas context");

    // pdfjs v5 renderTask expects { canvas, canvasContext, viewport } in some
    // builds; passing both keeps it compatible.
    await page.render({
      canvas,
      canvasContext: ctx,
      viewport,
    } as any).promise;

    const blob: Blob = await new Promise((resolve, reject) => {
      canvas.toBlob(
        (b) => (b ? resolve(b) : reject(new Error(`Page ${i} failed to encode`))),
        "image/png",
      );
    });

    pages.push({ blob, width: canvas.width, height: canvas.height });

    // Free pdf.js page resources eagerly.
    page.cleanup();
  }

  return pages;
}
