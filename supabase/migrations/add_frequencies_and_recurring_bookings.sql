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

-- Disable RLS on frequencies so admin CRUD works with the anon key
-- (matches behavior of neighborhoods, buildings, floor_plans, add_ons, workers)
ALTER TABLE frequencies DISABLE ROW LEVEL SECURITY;

-- If RLS was previously enabled, drop the old restrictive policies and re-disable
DO $$
BEGIN
  DROP POLICY IF EXISTS "Allow public read access to frequencies" ON frequencies;
  DROP POLICY IF EXISTS "Allow authenticated insert to frequencies" ON frequencies;
  DROP POLICY IF EXISTS "Allow authenticated update to frequencies" ON frequencies;
  DROP POLICY IF EXISTS "Allow authenticated delete to frequencies" ON frequencies;
END
$$;

-- Fix bookings table: the guest_booking migration added an INSERT policy which
-- implicitly enabled RLS, but never added SELECT/UPDATE/DELETE policies.
-- This caused silent failures for admin operations (assign worker, mark complete,
-- skip, cancel, read all bookings, etc.)
CREATE POLICY IF NOT EXISTS "Allow public read access to bookings"
  ON bookings FOR SELECT
  USING (true);

CREATE POLICY IF NOT EXISTS "Allow public update access to bookings"
  ON bookings FOR UPDATE
  USING (true);

CREATE POLICY IF NOT EXISTS "Allow public delete access to bookings"
  ON bookings FOR DELETE
  USING (true);
