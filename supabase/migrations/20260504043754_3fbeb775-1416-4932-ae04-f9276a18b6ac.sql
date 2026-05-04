-- Decks
CREATE TABLE public.decks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  title text NOT NULL DEFAULT 'Untitled Deck',
  is_public boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.decks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "decks_owner_select" ON public.decks FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "decks_owner_insert" ON public.decks FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "decks_owner_update" ON public.decks FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "decks_owner_delete" ON public.decks FOR DELETE USING (auth.uid() = user_id);

-- Deck slides
CREATE TABLE public.deck_slides (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  deck_id uuid NOT NULL REFERENCES public.decks(id) ON DELETE CASCADE,
  variant text NOT NULL DEFAULT 'default',
  slide_index integer NOT NULL,
  image_url text NOT NULL,
  width integer,
  height integer,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (deck_id, variant, slide_index)
);

CREATE INDEX idx_deck_slides_deck ON public.deck_slides(deck_id, variant, slide_index);
ALTER TABLE public.deck_slides ENABLE ROW LEVEL SECURITY;

CREATE POLICY "deck_slides_owner_select" ON public.deck_slides FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.decks d WHERE d.id = deck_slides.deck_id AND d.user_id = auth.uid()));
CREATE POLICY "deck_slides_owner_insert" ON public.deck_slides FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM public.decks d WHERE d.id = deck_slides.deck_id AND d.user_id = auth.uid()));
CREATE POLICY "deck_slides_owner_update" ON public.deck_slides FOR UPDATE
  USING (EXISTS (SELECT 1 FROM public.decks d WHERE d.id = deck_slides.deck_id AND d.user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.decks d WHERE d.id = deck_slides.deck_id AND d.user_id = auth.uid()));
CREATE POLICY "deck_slides_owner_delete" ON public.deck_slides FOR DELETE
  USING (EXISTS (SELECT 1 FROM public.decks d WHERE d.id = deck_slides.deck_id AND d.user_id = auth.uid()));

-- Hotspots
CREATE TABLE public.hotspots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  deck_id uuid NOT NULL REFERENCES public.decks(id) ON DELETE CASCADE,
  variant text NOT NULL DEFAULT 'default',
  slide_index integer NOT NULL,
  x numeric NOT NULL,
  y numeric NOT NULL,
  w numeric NOT NULL DEFAULT 10,
  h numeric NOT NULL DEFAULT 10,
  action_type text NOT NULL DEFAULT 'goto_slide',
  action_payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  label text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_hotspots_deck ON public.hotspots(deck_id, variant, slide_index);
ALTER TABLE public.hotspots ENABLE ROW LEVEL SECURITY;

CREATE POLICY "hotspots_owner_select" ON public.hotspots FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.decks d WHERE d.id = hotspots.deck_id AND d.user_id = auth.uid()));
CREATE POLICY "hotspots_owner_insert" ON public.hotspots FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM public.decks d WHERE d.id = hotspots.deck_id AND d.user_id = auth.uid()));
CREATE POLICY "hotspots_owner_update" ON public.hotspots FOR UPDATE
  USING (EXISTS (SELECT 1 FROM public.decks d WHERE d.id = hotspots.deck_id AND d.user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.decks d WHERE d.id = hotspots.deck_id AND d.user_id = auth.uid()));
CREATE POLICY "hotspots_owner_delete" ON public.hotspots FOR DELETE
  USING (EXISTS (SELECT 1 FROM public.decks d WHERE d.id = hotspots.deck_id AND d.user_id = auth.uid()));

-- Triggers for updated_at
CREATE TRIGGER decks_touch_updated_at BEFORE UPDATE ON public.decks
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
CREATE TRIGGER hotspots_touch_updated_at BEFORE UPDATE ON public.hotspots
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- Storage bucket (public-read; writes guarded by policies)
INSERT INTO storage.buckets (id, name, public) VALUES ('interactive-deck-slides', 'interactive-deck-slides', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "ids_public_read" ON storage.objects FOR SELECT
  USING (bucket_id = 'interactive-deck-slides');
CREATE POLICY "ids_owner_insert" ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'interactive-deck-slides' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "ids_owner_update" ON storage.objects FOR UPDATE
  USING (bucket_id = 'interactive-deck-slides' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "ids_owner_delete" ON storage.objects FOR DELETE
  USING (bucket_id = 'interactive-deck-slides' AND auth.uid()::text = (storage.foldername(name))[1]);