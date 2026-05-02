-- Stores per-slide editor overrides for both LRH coded slides and imported slides.
-- Keyed by (user_id, deck_kind, slide_key). For LRH: deck_kind='lrh', slide_key=slide id (e.g. 'title').
-- For imported: deck_kind='imported', slide_key='<deck_id>:<slide_index>'.
CREATE TABLE public.slide_overrides (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  deck_kind text NOT NULL CHECK (deck_kind IN ('lrh', 'imported')),
  slide_key text NOT NULL,
  blocks jsonb NOT NULL DEFAULT '[]'::jsonb,
  highlight_keyword text,
  layout_variant text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, deck_kind, slide_key)
);

ALTER TABLE public.slide_overrides ENABLE ROW LEVEL SECURITY;

CREATE POLICY overrides_owner_select ON public.slide_overrides
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY overrides_owner_insert ON public.slide_overrides
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY overrides_owner_update ON public.slide_overrides
  FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY overrides_owner_delete ON public.slide_overrides
  FOR DELETE USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.touch_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

CREATE TRIGGER slide_overrides_touch
  BEFORE UPDATE ON public.slide_overrides
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

CREATE INDEX idx_slide_overrides_lookup ON public.slide_overrides (user_id, deck_kind, slide_key);