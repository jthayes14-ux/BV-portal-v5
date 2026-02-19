-- Add UPDATE policy to bookings so actions (status changes, worker assignment) work
-- Existing policies: INSERT (anonymous inserts), SELECT (view bookings)
-- Missing: UPDATE policy
CREATE POLICY "Allow public booking updates"
  ON bookings FOR UPDATE
  USING (true)
  WITH CHECK (true);
