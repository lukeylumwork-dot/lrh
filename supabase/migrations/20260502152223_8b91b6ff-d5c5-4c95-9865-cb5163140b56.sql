drop policy if exists "deck_media_public_read" on storage.objects;

create policy "deck_media_owner_select" on storage.objects for select using (
  bucket_id = 'imported-deck-media' and auth.uid()::text = (storage.foldername(name))[1]
);