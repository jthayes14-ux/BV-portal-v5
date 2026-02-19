-- Disable RLS on bookings so admin actions (update status, assign worker) work with the anon key
-- (matches behavior of neighborhoods, buildings, floor_plans, add_ons, workers, frequencies)
ALTER TABLE bookings DISABLE ROW LEVEL SECURITY;
