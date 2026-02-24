-- Add archived column to neighborhoods, buildings, floor_plans, unit_lines, workers, and frequencies tables
-- (add_ons already has this column from a previous migration)

ALTER TABLE neighborhoods
  ADD COLUMN IF NOT EXISTS archived BOOLEAN DEFAULT false;

ALTER TABLE buildings
  ADD COLUMN IF NOT EXISTS archived BOOLEAN DEFAULT false;

ALTER TABLE floor_plans
  ADD COLUMN IF NOT EXISTS archived BOOLEAN DEFAULT false;

ALTER TABLE unit_lines
  ADD COLUMN IF NOT EXISTS archived BOOLEAN DEFAULT false;

ALTER TABLE workers
  ADD COLUMN IF NOT EXISTS archived BOOLEAN DEFAULT false;

ALTER TABLE frequencies
  ADD COLUMN IF NOT EXISTS archived BOOLEAN DEFAULT false;
