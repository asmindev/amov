-- Watchparty rooms table
-- Run this in Supabase Dashboard → SQL Editor (schema is dashboard-managed)

CREATE TABLE IF NOT EXISTS watchparty_rooms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  tmdb_id integer NOT NULL,
  title text NOT NULL,
  media_type text NOT NULL CHECK (media_type IN ('movie', 'tv')),
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- RLS: any authenticated user may read a room (to join); only the creator may
-- insert. Rooms are immutable in v1 (no update/delete policies).
ALTER TABLE watchparty_rooms ENABLE ROW LEVEL SECURITY;

CREATE POLICY "watchparty_rooms_select" ON watchparty_rooms
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "watchparty_rooms_insert" ON watchparty_rooms
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = created_by);
