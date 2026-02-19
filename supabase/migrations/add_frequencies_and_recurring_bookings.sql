-- Create frequencies table
CREATE TABLE IF NOT EXISTS frequencies (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  discount_percent NUMERIC DEFAULT 0,
  interval_days INTEGER DEFAULT 0,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Seed default frequency options
INSERT INTO frequencies (name, discount_percent, interval_days, sort_order) VALUES
  ('One-Time', 0, 0, 0),
  ('Weekly', 20, 7, 1),
  ('Biweekly', 15, 14, 2),
  ('Monthly', 10, 30, 3)
ON CONFLICT DO NOTHING;

-- Add frequency_id, recurring_group_id, and frequency_discount columns to bookings
ALTER TABLE bookings
  ADD COLUMN IF NOT EXISTS frequency_id UUID REFERENCES frequencies(id),
  ADD COLUMN IF NOT EXISTS recurring_group_id UUID,
  ADD COLUMN IF NOT EXISTS frequency_discount NUMERIC DEFAULT 0;

-- Allow public read access to frequencies
ALTER TABLE frequencies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access to frequencies"
  ON frequencies FOR SELECT
  USING (true);

CREATE POLICY "Allow authenticated insert to frequencies"
  ON frequencies FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow authenticated update to frequencies"
  ON frequencies FOR UPDATE
  USING (true);

CREATE POLICY "Allow authenticated delete to frequencies"
  ON frequencies FOR DELETE
  USING (true);
