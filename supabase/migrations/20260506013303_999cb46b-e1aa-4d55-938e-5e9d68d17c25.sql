
CREATE POLICY "decks_public_select" ON public.decks
FOR SELECT TO anon, authenticated
USING (is_public = true);

CREATE POLICY "deck_slides_public_select" ON public.deck_slides
FOR SELECT TO anon, authenticated
USING (EXISTS (SELECT 1 FROM public.decks d WHERE d.id = deck_slides.deck_id AND d.is_public = true));

CREATE POLICY "hotspots_public_select" ON public.hotspots
FOR SELECT TO anon, authenticated
USING (EXISTS (SELECT 1 FROM public.decks d WHERE d.id = hotspots.deck_id AND d.is_public = true));
