import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

// Block model — kept in sync with src/components/slides/editor/types.ts
const blockSchema = z.object({
  id: z.string().min(1).max(64),
  kind: z.enum(["title", "text", "bullets", "image", "eyebrow", "region"]),
  text: z.string().max(20000).optional().nullable(),
  bullets: z.array(z.string().max(2000)).max(50).optional().nullable(),
  imageUrl: z.string().max(2000).optional().nullable(),
  regionId: z.string().max(64).optional(),
  // Position/size in slide coordinate space (1920x1080 reference, %).
  x: z.number().min(-20).max(120),
  y: z.number().min(-20).max(120),
  w: z.number().min(2).max(120),
  h: z.number().min(2).max(120),
  hidden: z.boolean().optional(),
  align: z.enum(["left", "center", "right"]).optional(),
});

const overrideSchema = z.object({
  deckKind: z.enum(["lrh", "imported"]),
  slideKey: z.string().min(1).max(128),
  blocks: z.array(blockSchema).max(50),
  highlightKeyword: z.string().max(120).nullable().optional(),
  layoutVariant: z.string().max(40).nullable().optional(),
});

export interface OverrideDTO {
  deckKind: "lrh" | "imported";
  slideKey: string;
  blocks: z.infer<typeof blockSchema>[];
  highlightKeyword: string | null;
  layoutVariant: string | null;
}

export const listOverrides = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z.object({ deckKind: z.enum(["lrh", "imported"]) }).parse(input)
  )
  .handler(async ({ data, context }): Promise<OverrideDTO[]> => {
    const { supabase, userId } = context;
    const { data: rows, error } = await supabase
      .from("slide_overrides")
      .select("*")
      .eq("user_id", userId)
      .eq("deck_kind", data.deckKind);
    if (error) throw new Error(error.message);
    return (rows ?? []).map((r) => ({
      deckKind: r.deck_kind as "lrh" | "imported",
      slideKey: r.slide_key,
      blocks: (r.blocks as OverrideDTO["blocks"]) ?? [],
      highlightKeyword: r.highlight_keyword,
      layoutVariant: r.layout_variant,
    }));
  });

export const upsertOverride = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => overrideSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { error } = await supabase.from("slide_overrides").upsert(
      {
        user_id: userId,
        deck_kind: data.deckKind,
        slide_key: data.slideKey,
        blocks: data.blocks,
        highlight_keyword: data.highlightKeyword ?? null,
        layout_variant: data.layoutVariant ?? null,
      },
      { onConflict: "user_id,deck_kind,slide_key" }
    );
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const resetOverride = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z
      .object({
        deckKind: z.enum(["lrh", "imported"]),
        slideKey: z.string().min(1).max(128),
      })
      .parse(input)
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { error } = await supabase
      .from("slide_overrides")
      .delete()
      .eq("user_id", userId)
      .eq("deck_kind", data.deckKind)
      .eq("slide_key", data.slideKey);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
