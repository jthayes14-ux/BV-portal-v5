-- Add auth_id column to workers table to link workers to their Supabase auth accounts
ALTER TABLE workers
  ADD COLUMN IF NOT EXISTS auth_id UUID UNIQUE REFERENCES auth.users(id);

-- Index for fast lookups by auth_id
CREATE INDEX IF NOT EXISTS idx_workers_auth_id ON workers(auth_id);
