import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { createClient } from "@supabase/supabase-js";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import type { Database } from "@/integrations/supabase/types";

export interface DeckDTO {
  id: string;
  title: string;
  is_public: boolean;
  created_at: string;
}

export interface DeckSlideDTO {
  id: string;
  variant: string;
  slide_index: number;
  image_url: string;
  width: number | null;
  height: number | null;
  label: string | null;
}

export interface HotspotDTO {
  id: string;
  variant: string;
  slide_index: number;
  x: number;
  y: number;
  w: number;
  h: number;
  action_type: string;
  action_payload: Record<string, any>;
  label: string | null;
}

export const listDecks = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<DeckDTO[]> => {
    const { supabase, userId } = context;
    const { data, error } = await supabase
      .from("decks")
      .select("id,title,is_public,created_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return (data ?? []) as DeckDTO[];
  });

export const createDeck = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z.object({ title: z.string().min(1).max(200) }).parse(input),
  )
  .handler(async ({ data, context }): Promise<DeckDTO> => {
    const { supabase, userId } = context;
    const { data: row, error } = await supabase
      .from("decks")
      .insert({ user_id: userId, title: data.title })
      .select("id,title,is_public,created_at")
      .single();
    if (error || !row) throw new Error(error?.message ?? "Failed to create deck");
    return row as DeckDTO;
  });

export const createDeckFromImages = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z
      .object({
        title: z.string().min(1).max(200),
        slides: z
          .array(
            z.object({
              image_url: z.string().url().max(2048),
              width: z.number().int().min(1).max(20000),
              height: z.number().int().min(1).max(20000),
            }),
          )
          .min(1)
          .max(200),
      })
      .parse(input),
  )
  .handler(async ({ data, context }): Promise<{ deckId: string }> => {
    const { supabase, userId } = context;
    const { data: deck, error: deckErr } = await supabase
      .from("decks")
      .insert({ user_id: userId, title: data.title })
      .select("id")
      .single();
    if (deckErr || !deck) throw new Error(deckErr?.message ?? "Failed to create deck");

    const rows = data.slides.map((s, i) => ({
      deck_id: deck.id,
      variant: "Light",
      slide_index: i,
      image_url: s.image_url,
      width: s.width,
      height: s.height,
    }));
    const { error: sErr } = await supabase.from("deck_slides").insert(rows);
    if (sErr) {
      // Best-effort cleanup so we don't leave an empty deck behind.
      await supabase.from("decks").delete().eq("id", deck.id);
      throw new Error(sErr.message);
    }
    return { deckId: deck.id };
  });

export const deleteDeck = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => z.object({ deckId: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { error } = await supabase
      .from("decks")
      .delete()
      .eq("id", data.deckId)
      .eq("user_id", userId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const getDeckBundle = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => z.object({ deckId: z.string().uuid() }).parse(input))
  .handler(
    async ({
      data,
      context,
    }): Promise<{ deck: DeckDTO; slides: DeckSlideDTO[]; hotspots: HotspotDTO[] }> => {
      const { supabase } = context;
      const { data: deck, error: deckErr } = await supabase
        .from("decks")
        .select("id,title,is_public,created_at")
        .eq("id", data.deckId)
        .single();
      if (deckErr || !deck) throw new Error(deckErr?.message ?? "Deck not found");

      const [{ data: slides, error: sErr }, { data: hotspots, error: hErr }] =
        await Promise.all([
          supabase
            .from("deck_slides")
            .select("id,variant,slide_index,image_url,width,height")
            .eq("deck_id", data.deckId)
            .order("variant", { ascending: true })
            .order("slide_index", { ascending: true }),
          supabase
            .from("hotspots")
            .select(
              "id,variant,slide_index,x,y,w,h,action_type,action_payload,label",
            )
            .eq("deck_id", data.deckId),
        ]);
      if (sErr) throw new Error(sErr.message);
      if (hErr) throw new Error(hErr.message);

      return {
        deck: deck as DeckDTO,
        slides: (slides ?? []) as DeckSlideDTO[],
        hotspots: ((hotspots ?? []) as unknown as HotspotDTO[]).map((h) => ({
          ...h,
          action_payload: (h.action_payload ?? {}) as Record<string, any>,
        })),
      };
    },
  );

const slideRowSchema = z.object({
  deckId: z.string().uuid(),
  variant: z.string().min(1).max(40),
  slideIndex: z.number().int().min(0).max(500),
  imageUrl: z.string().url().max(2000),
  width: z.number().int().positive().max(20000).nullable().optional(),
  height: z.number().int().positive().max(20000).nullable().optional(),
});

export const upsertSlide = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => slideRowSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { supabase } = context;
    const { error } = await supabase.from("deck_slides").upsert(
      {
        deck_id: data.deckId,
        variant: data.variant,
        slide_index: data.slideIndex,
        image_url: data.imageUrl,
        width: data.width ?? null,
        height: data.height ?? null,
      },
      { onConflict: "deck_id,variant,slide_index" },
    );
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const deleteSlide = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => z.object({ slideId: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase
      .from("deck_slides")
      .delete()
      .eq("id", data.slideId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

const hotspotInputSchema = z.object({
  id: z.string().uuid().optional(),
  deckId: z.string().uuid(),
  variant: z.string().min(1).max(40),
  slideIndex: z.number().int().min(0).max(500),
  x: z.number().min(0).max(100),
  y: z.number().min(0).max(100),
  w: z.number().min(0.5).max(100),
  h: z.number().min(0.5).max(100),
  actionType: z.enum(["goto_slide", "open_url", "open_modal"]),
  actionPayload: z.record(z.string(), z.any()).default({}),
  label: z.string().max(200).nullable().optional(),
});

export const upsertHotspot = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => hotspotInputSchema.parse(input))
  .handler(async ({ data, context }): Promise<HotspotDTO> => {
    const { supabase } = context;
    const row = {
      deck_id: data.deckId,
      variant: data.variant,
      slide_index: data.slideIndex,
      x: data.x,
      y: data.y,
      w: data.w,
      h: data.h,
      action_type: data.actionType,
      action_payload: data.actionPayload,
      label: data.label ?? null,
    };
    const query = data.id
      ? supabase.from("hotspots").update(row).eq("id", data.id).select().single()
      : supabase.from("hotspots").insert(row).select().single();
    const { data: out, error } = await query;
    if (error || !out) throw new Error(error?.message ?? "Failed to save hotspot");
    return {
      id: out.id,
      variant: out.variant,
      slide_index: out.slide_index,
      x: Number(out.x),
      y: Number(out.y),
      w: Number(out.w),
      h: Number(out.h),
      action_type: out.action_type,
      action_payload: (out.action_payload ?? {}) as Record<string, any>,
      label: out.label,
    };
  });

export const deleteHotspot = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => z.object({ hotspotId: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase
      .from("hotspots")
      .delete()
      .eq("id", data.hotspotId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const setDeckPublic = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z.object({ deckId: z.string().uuid(), isPublic: z.boolean() }).parse(input),
  )
  .handler(async ({ data, context }): Promise<DeckDTO> => {
    const { supabase, userId } = context;
    const { data: row, error } = await supabase
      .from("decks")
      .update({ is_public: data.isPublic })
      .eq("id", data.deckId)
      .eq("user_id", userId)
      .select("id,title,is_public,created_at")
      .single();
    if (error || !row) throw new Error(error?.message ?? "Failed to update deck");
    return row as DeckDTO;
  });

export const getPublicDeck = createServerFn({ method: "GET" })
  .inputValidator((input) => z.object({ deckId: z.string().uuid() }).parse(input))
  .handler(
    async ({
      data,
    }): Promise<{ deck: DeckDTO; slides: DeckSlideDTO[]; hotspots: HotspotDTO[] }> => {
      const SUPABASE_URL = process.env.SUPABASE_URL;
      const SUPABASE_PUBLISHABLE_KEY = process.env.SUPABASE_PUBLISHABLE_KEY;
      if (!SUPABASE_URL || !SUPABASE_PUBLISHABLE_KEY) {
        throw new Error("Server is not configured");
      }
      const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
        auth: { persistSession: false, autoRefreshToken: false },
      });

      const { data: deck, error: deckErr } = await supabase
        .from("decks")
        .select("id,title,is_public,created_at")
        .eq("id", data.deckId)
        .eq("is_public", true)
        .maybeSingle();
      if (deckErr) throw new Error(deckErr.message);
      if (!deck) throw new Error("This deck is private or does not exist.");

      const [{ data: slides, error: sErr }, { data: hotspots, error: hErr }] =
        await Promise.all([
          supabase
            .from("deck_slides")
            .select("id,variant,slide_index,image_url,width,height")
            .eq("deck_id", data.deckId)
            .order("variant", { ascending: true })
            .order("slide_index", { ascending: true }),
          supabase
            .from("hotspots")
            .select("id,variant,slide_index,x,y,w,h,action_type,action_payload,label")
            .eq("deck_id", data.deckId),
        ]);
      if (sErr) throw new Error(sErr.message);
      if (hErr) throw new Error(hErr.message);

      return {
        deck: deck as DeckDTO,
        slides: (slides ?? []) as DeckSlideDTO[],
        hotspots: ((hotspots ?? []) as unknown as HotspotDTO[]).map((h) => ({
          ...h,
          action_payload: (h.action_payload ?? {}) as Record<string, any>,
        })),
      };
    },
  );

export const logDeckAccessEvent = createServerFn({ method: "POST" })
  .inputValidator((input) =>
    z
      .object({
        deckId: z.string().nullable().optional(),
        deckTitle: z.string().nullable().optional(),
        errorType: z.enum(["private", "not_found", "no_slides", "error"]),
        errorMessage: z.string().nullable().optional(),
      })
      .parse(input),
  )
  .handler(async ({ data }) => {
    const SUPABASE_URL = process.env.SUPABASE_URL;
    const SUPABASE_PUBLISHABLE_KEY = process.env.SUPABASE_PUBLISHABLE_KEY;
    if (!SUPABASE_URL || !SUPABASE_PUBLISHABLE_KEY) return { ok: false };
    const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    await supabase.from("deck_access_events").insert({
      deck_id: data.deckId ?? null,
      deck_title: data.deckTitle ?? null,
      error_type: data.errorType,
      error_message: data.errorMessage ?? null,
    });
    return { ok: true };
  });
