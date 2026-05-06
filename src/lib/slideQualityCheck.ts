// Browser-only: inspect rendered slide PNGs and flag quality issues
// before the deck is saved.

export type QualityLevel = "ok" | "warning" | "error";

export interface QualityIssue {
  level: QualityLevel;
  code:
    | "low_resolution"
    | "aspect_ratio"
    | "near_blank"
    | "low_detail"
    | "oversized";
  message: string;
}

export interface SlideQualityReport {
  width: number;
  height: number;
  bytes: number;
  aspectRatio: number;
  brightnessMean: number;
  brightnessStdDev: number;
  issues: QualityIssue[];
  worst: QualityLevel;
}

export interface QualityCheckOptions {
  /** Target render width in CSS pixels. Default 1920. */
  targetWidth?: number;
  /** Target aspect ratio (w/h). Default 16/9. */
  targetAspect?: number;
  /** Allowed aspect deviation (fraction). Default 0.02 (≈2%). */
  aspectTolerance?: number;
  /** Hard min width as a fraction of target. Below = error. Default 0.95. */
  minWidthRatio?: number;
  /** Soft min width as a fraction of target. Below = warning. Default 1.0. */
  warnWidthRatio?: number;
  /** PNG byte ceiling per slide before warning. Default 5 MB. */
  maxBytes?: number;
}

const worstOf = (a: QualityLevel, b: QualityLevel): QualityLevel => {
  const rank: Record<QualityLevel, number> = { ok: 0, warning: 1, error: 2 };
  return rank[a] >= rank[b] ? a : b;
};

async function decodeBlob(blob: Blob): Promise<ImageBitmap> {
  // createImageBitmap is widely supported and avoids HTMLImageElement load races.
  return await createImageBitmap(blob);
}

/**
 * Sample brightness mean and standard deviation on a downscaled copy of the
 * slide. Very low std-dev indicates a near-blank or solid-color page; very
 * low mean variance is a proxy for "missing content / failed render".
 */
function sampleStats(bitmap: ImageBitmap): { mean: number; std: number } {
  const sampleW = 160;
  const sampleH = Math.max(1, Math.round((bitmap.height / bitmap.width) * sampleW));
  const canvas = document.createElement("canvas");
  canvas.width = sampleW;
  canvas.height = sampleH;
  const ctx = canvas.getContext("2d");
  if (!ctx) return { mean: 255, std: 0 };
  ctx.drawImage(bitmap, 0, 0, sampleW, sampleH);
  const { data } = ctx.getImageData(0, 0, sampleW, sampleH);

  let sum = 0;
  let sumSq = 0;
  const n = data.length / 4;
  for (let i = 0; i < data.length; i += 4) {
    // Rec.709 luma
    const y = 0.2126 * data[i] + 0.7152 * data[i + 1] + 0.0722 * data[i + 2];
    sum += y;
    sumSq += y * y;
  }
  const mean = sum / n;
  const variance = Math.max(0, sumSq / n - mean * mean);
  return { mean, std: Math.sqrt(variance) };
}

export async function checkSlideQuality(
  blob: Blob,
  width: number,
  height: number,
  opts: QualityCheckOptions = {},
): Promise<SlideQualityReport> {
  const targetWidth = opts.targetWidth ?? 1920;
  const targetAspect = opts.targetAspect ?? 16 / 9;
  const aspectTolerance = opts.aspectTolerance ?? 0.02;
  const minWidthRatio = opts.minWidthRatio ?? 0.95;
  const warnWidthRatio = opts.warnWidthRatio ?? 1.0;
  const maxBytes = opts.maxBytes ?? 5 * 1024 * 1024;

  const issues: QualityIssue[] = [];
  const aspect = width / height;

  // Resolution checks — text legibility scales with pixel density.
  if (width < targetWidth * minWidthRatio) {
    issues.push({
      level: "error",
      code: "low_resolution",
      message: `Rendered at ${width}px wide; target is ${targetWidth}px. Text may look soft when projected.`,
    });
  } else if (width < targetWidth * warnWidthRatio) {
    issues.push({
      level: "warning",
      code: "low_resolution",
      message: `Slightly under target width (${width}px vs ${targetWidth}px).`,
    });
  }

  // Aspect ratio — outliers will be letter-/pillar-boxed in the 16:9 viewer.
  const aspectDelta = Math.abs(aspect - targetAspect) / targetAspect;
  if (aspectDelta > aspectTolerance) {
    issues.push({
      level: "warning",
      code: "aspect_ratio",
      message: `Aspect ratio ${aspect.toFixed(3)} differs from target ${targetAspect.toFixed(3)} by ${(aspectDelta * 100).toFixed(1)}%.`,
    });
  }

  // Decode + sample for blank/low-detail detection.
  let mean = 255;
  let std = 0;
  try {
    const bitmap = await decodeBlob(blob);
    const stats = sampleStats(bitmap);
    mean = stats.mean;
    std = stats.std;
    bitmap.close?.();
  } catch {
    issues.push({
      level: "error",
      code: "near_blank",
      message: "Could not decode rendered image.",
    });
  }

  if (std < 2) {
    issues.push({
      level: "error",
      code: "near_blank",
      message: "Slide appears blank (no detectable content).",
    });
  } else if (std < 8) {
    issues.push({
      level: "warning",
      code: "low_detail",
      message: "Very little visual contrast — content may be missing or extremely faint.",
    });
  }

  if (blob.size > maxBytes) {
    issues.push({
      level: "warning",
      code: "oversized",
      message: `PNG is ${(blob.size / (1024 * 1024)).toFixed(1)} MB — uploads will be slow.`,
    });
  }

  const worst = issues.reduce<QualityLevel>(
    (acc, i) => worstOf(acc, i.level),
    "ok",
  );

  return {
    width,
    height,
    bytes: blob.size,
    aspectRatio: aspect,
    brightnessMean: mean,
    brightnessStdDev: std,
    issues,
    worst,
  };
}
