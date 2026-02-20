-- Disable RLS on bookings table so admin and all app queries can read/update all rows.
-- This matches the pattern used for neighborhoods, buildings, floor_plans, add_ons,
-- workers, and frequencies tables in this app.
ALTER TABLE bookings DISABLE ROW LEVEL SECURITY;

-- Drop any existing restrictive policies that may block reads/updates
DO $$
BEGIN
  DROP POLICY IF EXISTS "Allow anonymous booking inserts" ON bookings;
  DROP POLICY IF EXISTS "Users can read own bookings" ON bookings;
  DROP POLICY IF EXISTS "Users can update own bookings" ON bookings;
  DROP POLICY IF EXISTS "Enable read access for all users" ON bookings;
  DROP POLICY IF EXISTS "Enable insert for all users" ON bookings;
  DROP POLICY IF EXISTS "Enable update for all users" ON bookings;
  DROP POLICY IF EXISTS "Enable delete for all users" ON bookings;
END
$$;
