-- Restrict to authenticated role
DROP POLICY "decks_owner_select" ON public.decks;
DROP POLICY "decks_owner_insert" ON public.decks;
DROP POLICY "decks_owner_update" ON public.decks;
DROP POLICY "decks_owner_delete" ON public.decks;
CREATE POLICY "decks_owner_select" ON public.decks FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "decks_owner_insert" ON public.decks FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "decks_owner_update" ON public.decks FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "decks_owner_delete" ON public.decks FOR DELETE TO authenticated USING (auth.uid() = user_id);

DROP POLICY "deck_slides_owner_select" ON public.deck_slides;
DROP POLICY "deck_slides_owner_insert" ON public.deck_slides;
DROP POLICY "deck_slides_owner_update" ON public.deck_slides;
DROP POLICY "deck_slides_owner_delete" ON public.deck_slides;
CREATE POLICY "deck_slides_owner_select" ON public.deck_slides FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.decks d WHERE d.id = deck_slides.deck_id AND d.user_id = auth.uid()));
CREATE POLICY "deck_slides_owner_insert" ON public.deck_slides FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM public.decks d WHERE d.id = deck_slides.deck_id AND d.user_id = auth.uid()));
CREATE POLICY "deck_slides_owner_update" ON public.deck_slides FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.decks d WHERE d.id = deck_slides.deck_id AND d.user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.decks d WHERE d.id = deck_slides.deck_id AND d.user_id = auth.uid()));
CREATE POLICY "deck_slides_owner_delete" ON public.deck_slides FOR DELETE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.decks d WHERE d.id = deck_slides.deck_id AND d.user_id = auth.uid()));

DROP POLICY "hotspots_owner_select" ON public.hotspots;
DROP POLICY "hotspots_owner_insert" ON public.hotspots;
DROP POLICY "hotspots_owner_update" ON public.hotspots;
DROP POLICY "hotspots_owner_delete" ON public.hotspots;
CREATE POLICY "hotspots_owner_select" ON public.hotspots FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.decks d WHERE d.id = hotspots.deck_id AND d.user_id = auth.uid()));
CREATE POLICY "hotspots_owner_insert" ON public.hotspots FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM public.decks d WHERE d.id = hotspots.deck_id AND d.user_id = auth.uid()));
CREATE POLICY "hotspots_owner_update" ON public.hotspots FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.decks d WHERE d.id = hotspots.deck_id AND d.user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.decks d WHERE d.id = hotspots.deck_id AND d.user_id = auth.uid()));
CREATE POLICY "hotspots_owner_delete" ON public.hotspots FOR DELETE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.decks d WHERE d.id = hotspots.deck_id AND d.user_id = auth.uid()));

-- Storage policies: scope mutations to authenticated; keep public read but it permits direct file access only (listing requires more)
DROP POLICY "ids_owner_insert" ON storage.objects;
DROP POLICY "ids_owner_update" ON storage.objects;
DROP POLICY "ids_owner_delete" ON storage.objects;
CREATE POLICY "ids_owner_insert" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'interactive-deck-slides' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "ids_owner_update" ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'interactive-deck-slides' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "ids_owner_delete" ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'interactive-deck-slides' AND auth.uid()::text = (storage.foldername(name))[1]);