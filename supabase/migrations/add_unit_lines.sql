-- Unit Lines table
-- Each unit line represents a vertical line within a building (e.g., line "01" on floors 1-20)
CREATE TABLE IF NOT EXISTS unit_lines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  building_id UUID NOT NULL REFERENCES buildings(id) ON DELETE CASCADE,
  line_number TEXT NOT NULL,
  floor_min INTEGER NOT NULL DEFAULT 1,
  floor_max INTEGER NOT NULL DEFAULT 99,
  floor_plan_id UUID REFERENCES floor_plans(id) ON DELETE SET NULL,
  custom_price NUMERIC,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Disable RLS for admin operations (consistent with other tables)
ALTER TABLE unit_lines ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all for unit_lines" ON unit_lines FOR ALL USING (true) WITH CHECK (true);
