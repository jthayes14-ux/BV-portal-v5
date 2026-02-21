-- Add archived column to add_ons table
ALTER TABLE add_ons
  ADD COLUMN IF NOT EXISTS archived BOOLEAN DEFAULT false;

-- Create site_settings key-value table for admin-controlled toggles
CREATE TABLE IF NOT EXISTS site_settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Default: add-ons section is visible
INSERT INTO site_settings (key, value) VALUES ('addons_section_visible', 'true')
ON CONFLICT (key) DO NOTHING;

-- Disable RLS so admin CRUD works with the anon key
-- (matches behavior of neighborhoods, buildings, floor_plans, add_ons, workers)
ALTER TABLE site_settings DISABLE ROW LEVEL SECURITY;
