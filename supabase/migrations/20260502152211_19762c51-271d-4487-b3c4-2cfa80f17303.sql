-- Imported decks tables
create table public.imported_decks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  source_type text not null check (source_type in ('pdf','pptx')),
  created_at timestamptz not null default now()
);

create table public.imported_slides (
  id uuid primary key default gen_random_uuid(),
  deck_id uuid not null references public.imported_decks(id) on delete cascade,
  index int not null,
  title text,
  bullets jsonb not null default '[]'::jsonb,
  image_urls jsonb not null default '[]'::jsonb,
  notes text
);

create index on public.imported_slides(deck_id, index);

alter table public.imported_decks enable row level security;
alter table public.imported_slides enable row level security;

create policy "decks_owner_select" on public.imported_decks for select using (auth.uid() = user_id);
create policy "decks_owner_insert" on public.imported_decks for insert with check (auth.uid() = user_id);
create policy "decks_owner_delete" on public.imported_decks for delete using (auth.uid() = user_id);

create policy "slides_owner_select" on public.imported_slides for select using (
  exists(select 1 from public.imported_decks d where d.id = deck_id and d.user_id = auth.uid())
);
create policy "slides_owner_insert" on public.imported_slides for insert with check (
  exists(select 1 from public.imported_decks d where d.id = deck_id and d.user_id = auth.uid())
);
create policy "slides_owner_delete" on public.imported_slides for delete using (
  exists(select 1 from public.imported_decks d where d.id = deck_id and d.user_id = auth.uid())
);

-- Storage bucket for slide media
insert into storage.buckets (id, name, public) values ('imported-deck-media', 'imported-deck-media', true)
on conflict (id) do nothing;

create policy "deck_media_public_read" on storage.objects for select using (bucket_id = 'imported-deck-media');
create policy "deck_media_owner_insert" on storage.objects for insert with check (
  bucket_id = 'imported-deck-media' and auth.uid()::text = (storage.foldername(name))[1]
);
create policy "deck_media_owner_delete" on storage.objects for delete using (
  bucket_id = 'imported-deck-media' and auth.uid()::text = (storage.foldername(name))[1]
);