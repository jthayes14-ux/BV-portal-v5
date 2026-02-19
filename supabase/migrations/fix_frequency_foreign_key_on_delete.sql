-- Fix: allow frequency deletion even when bookings reference the frequency.
-- Change the foreign key action from RESTRICT (default) to SET NULL so that
-- deleting a frequency sets bookings.frequency_id to NULL instead of blocking.

ALTER TABLE bookings
  DROP CONSTRAINT IF EXISTS bookings_frequency_id_fkey;

ALTER TABLE bookings
  ADD CONSTRAINT bookings_frequency_id_fkey
  FOREIGN KEY (frequency_id) REFERENCES frequencies(id) ON DELETE SET NULL;
