CREATE TABLE public.deck_access_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  deck_id text,
  deck_title text,
  error_type text NOT NULL,
  error_message text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.deck_access_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can log deck access events"
ON public.deck_access_events
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

CREATE INDEX idx_deck_access_events_deck_id ON public.deck_access_events (deck_id);
CREATE INDEX idx_deck_access_events_created_at ON public.deck_access_events (created_at DESC);