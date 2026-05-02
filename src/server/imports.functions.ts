import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { parsePptx, parsePdf, mimeForExt, type ParsedSlide } from "./imports.server";

export interface ImportedSlideDTO {
  index: number;
  title: string | null;
  bullets: string[];
  image_urls: string[];
  notes: string | null;
}

export interface ImportedDeckDTO {
  id: string;
  name: string;
  source_type: "pdf" | "pptx";
  created_at: string;
  slides: ImportedSlideDTO[];
}

const uploadSchema = z.object({
  filename: z.string().min(1).max(255),
  mimeType: z.string().min(1).max(255),
  fileBase64: z.string().min(1),
});

function base64ToBytes(b64: string): Uint8Array {
  const bin = atob(b64);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

export const parseAndSaveDeck = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => uploadSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const bytes = base64ToBytes(data.fileBase64);

    const isPptx =
      data.mimeType.includes("presentationml") ||
      data.filename.toLowerCase().endsWith(".pptx");
    const isPdf =
      data.mimeType === "application/pdf" || data.filename.toLowerCase().endsWith(".pdf");

    if (!isPptx && !isPdf) {
      throw new Error("Unsupported file type. Upload .pdf or .pptx");
    }

    let parsed: ParsedSlide[];
    try {
      parsed = isPptx ? await parsePptx(bytes) : await parsePdf(bytes);
    } catch (err) {
      console.error("[parseAndSaveDeck] parser failed", err);
      throw new Error("Failed to parse file");
    }

    if (parsed.length === 0) throw new Error("No slides found in file");

    // Delete previous decks for this user (keep latest only)
    await supabase.from("imported_decks").delete().eq("user_id", userId);

    // Create deck row
    const { data: deck, error: deckErr } = await supabase
      .from("imported_decks")
      .insert({
        user_id: userId,
        name: data.filename,
        source_type: isPptx ? "pptx" : "pdf",
      })
      .select()
      .single();
    if (deckErr || !deck) throw new Error(deckErr?.message ?? "Failed to create deck");

    // Upload images and build slide rows
    const slideRows = await Promise.all(
      parsed.map(async (s) => {
        const image_urls: string[] = [];
        for (let j = 0; j < s.images.length; j++) {
          const img = s.images[j];
          const path = `${userId}/${deck.id}/slide${s.index}_img${j}.${img.ext}`;
          const { error: upErr } = await supabase.storage
            .from("imported-deck-media")
            .upload(path, img.bytes, {
              contentType: mimeForExt(img.ext),
              upsert: true,
            });
          if (upErr) {
            console.error("[parseAndSaveDeck] upload failed", upErr);
            continue;
          }
          const { data: pub } = supabase.storage
            .from("imported-deck-media")
            .getPublicUrl(path);
          image_urls.push(pub.publicUrl);
        }
        return {
          deck_id: deck.id,
          index: s.index,
          title: s.title,
          bullets: s.bullets,
          image_urls,
          notes: s.notes,
        };
      })
    );

    const { error: slidesErr } = await supabase.from("imported_slides").insert(slideRows);
    if (slidesErr) throw new Error(slidesErr.message);

    return { deckId: deck.id, count: slideRows.length };
  });

export const getLatestImportedDeck = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<ImportedDeckDTO | null> => {
    const { supabase, userId } = context;
    const { data: deck } = await supabase
      .from("imported_decks")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (!deck) return null;

    const { data: slides } = await supabase
      .from("imported_slides")
      .select("*")
      .eq("deck_id", deck.id)
      .order("index", { ascending: true });

    return {
      id: deck.id,
      name: deck.name,
      source_type: deck.source_type as "pdf" | "pptx",
      created_at: deck.created_at,
      slides: (slides ?? []).map((s) => ({
        index: s.index,
        title: s.title,
        bullets: (s.bullets as string[]) ?? [],
        image_urls: (s.image_urls as string[]) ?? [],
        notes: s.notes,
      })),
    };
  });

export const deleteImportedDeck = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => z.object({ deckId: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    // Best-effort: remove media folder
    const { data: list } = await supabase.storage
      .from("imported-deck-media")
      .list(`${userId}/${data.deckId}`);
    if (list && list.length) {
      await supabase.storage
        .from("imported-deck-media")
        .remove(list.map((f) => `${userId}/${data.deckId}/${f.name}`));
    }
    const { error } = await supabase
      .from("imported_decks")
      .delete()
      .eq("id", data.deckId)
      .eq("user_id", userId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
