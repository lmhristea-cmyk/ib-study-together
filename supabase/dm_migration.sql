-- Run this in the Supabase SQL editor before deploying the DM feature.

-- 1. Add user_id to group_messages so clickable names can resolve to a UUID
ALTER TABLE group_messages
  ADD COLUMN IF NOT EXISTS user_id uuid;

-- 2. Direct messages table
CREATE TABLE IF NOT EXISTS direct_messages (
  id               uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id  text        NOT NULL,
  from_user_id     uuid        NOT NULL,
  from_user_name   text        NOT NULL,
  to_user_id       uuid        NOT NULL,
  to_user_name     text        NOT NULL,
  text             text        NOT NULL,
  created_at       timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS dm_conversation_idx ON direct_messages (conversation_id);

ALTER TABLE direct_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read their DMs"
  ON direct_messages FOR SELECT
  USING (auth.uid() = from_user_id OR auth.uid() = to_user_id);

CREATE POLICY "Users can send DMs"
  ON direct_messages FOR INSERT
  WITH CHECK (auth.uid() = from_user_id);

-- 3. Enable Realtime (also enable in Dashboard > Database > Replication if this errors)
ALTER PUBLICATION supabase_realtime ADD TABLE direct_messages;
