-- Add archived column to add_ons table
ALTER TABLE add_ons
  ADD COLUMN IF NOT EXISTS archived BOOLEAN DEFAULT false;
