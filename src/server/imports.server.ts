// Server-only parsers for PPTX and PDF -> structured slides.
import { unzipSync, strFromU8 } from "fflate";
import { extractText, getDocumentProxy } from "unpdf";

export interface ParsedSlide {
  index: number;
  title: string | null;
  bullets: string[];
  notes: string | null;
  // Raw image entries — bytes + extension. Upload happens in the function handler
  // so we keep this module pure (no Supabase deps).
  images: { bytes: Uint8Array; ext: string }[];
}

const decoder = new TextDecoder();

function extractTextRuns(xml: string): string[] {
  const out: string[] = [];
  // Capture each <a:p>…</a:p> paragraph, then concatenate <a:t>…</a:t> runs inside.
  const paraRe = /<a:p\b[^>]*>([\s\S]*?)<\/a:p>/g;
  const runRe = /<a:t\b[^>]*>([\s\S]*?)<\/a:t>/g;
  let pm: RegExpExecArray | null;
  while ((pm = paraRe.exec(xml))) {
    let text = "";
    let rm: RegExpExecArray | null;
    while ((rm = runRe.exec(pm[1]))) {
      text += decodeXmlEntities(rm[1]);
    }
    text = text.trim();
    if (text) out.push(text);
  }
  return out;
}

function decodeXmlEntities(s: string): string {
  return s
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&#x([0-9a-fA-F]+);/g, (_, h) => String.fromCodePoint(parseInt(h, 16)))
    .replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(parseInt(d, 10)))
    .replace(/&amp;/g, "&");
}

function extToMime(ext: string): string {
  const e = ext.toLowerCase();
  if (e === "jpg" || e === "jpeg") return "image/jpeg";
  if (e === "png") return "image/png";
  if (e === "gif") return "image/gif";
  if (e === "webp") return "image/webp";
  if (e === "svg") return "image/svg+xml";
  return "application/octet-stream";
}

export function mimeForExt(ext: string): string {
  return extToMime(ext);
}

export async function parsePptx(bytes: Uint8Array): Promise<ParsedSlide[]> {
  const files = unzipSync(bytes);

  // Slide files: ppt/slides/slide1.xml, slide2.xml, ...
  const slideEntries = Object.keys(files)
    .filter((n) => /^ppt\/slides\/slide\d+\.xml$/.test(n))
    .sort((a, b) => {
      const na = parseInt(a.match(/slide(\d+)\.xml$/)![1], 10);
      const nb = parseInt(b.match(/slide(\d+)\.xml$/)![1], 10);
      return na - nb;
    });

  const slides: ParsedSlide[] = [];

  for (let i = 0; i < slideEntries.length; i++) {
    const path = slideEntries[i];
    const xml = strFromU8(files[path]);
    const texts = extractTextRuns(xml);
    const title = texts[0] ?? null;
    const bullets = texts.slice(1);

    // Notes (optional)
    const slideNum = path.match(/slide(\d+)\.xml$/)![1];
    const notesPath = `ppt/notesSlides/notesSlide${slideNum}.xml`;
    let notes: string | null = null;
    if (files[notesPath]) {
      const notesTexts = extractTextRuns(strFromU8(files[notesPath]));
      notes = notesTexts.join("\n") || null;
    }

    // Images: read rels for this slide, find image targets
    const relsPath = `ppt/slides/_rels/slide${slideNum}.xml.rels`;
    const images: ParsedSlide["images"] = [];
    if (files[relsPath]) {
      const relsXml = strFromU8(files[relsPath]);
      const relRe = /<Relationship\b[^>]*Type="[^"]*\/image"[^>]*Target="([^"]+)"/g;
      let rm: RegExpExecArray | null;
      while ((rm = relRe.exec(relsXml))) {
        // Target is like "../media/image1.png"
        const target = rm[1].replace(/^\.\.\//, "ppt/");
        if (files[target]) {
          const ext = target.split(".").pop()!.toLowerCase();
          images.push({ bytes: files[target], ext });
        }
      }
    }

    slides.push({ index: i, title, bullets, notes, images });
  }

  return slides;
}

export async function parsePdf(bytes: Uint8Array): Promise<ParsedSlide[]> {
  const doc = await getDocumentProxy(bytes);
  const { text } = await extractText(doc, { mergePages: false });
  const pages: string[] = Array.isArray(text) ? text : [text];

  return pages.map((pageText, i) => {
    const lines = pageText
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter(Boolean);
    const title = lines[0] ?? null;
    const bullets = lines.slice(1);
    return { index: i, title, bullets, notes: null, images: [] };
  });
}
