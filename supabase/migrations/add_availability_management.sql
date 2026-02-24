-- Availability Management Tables
-- Weekly worker schedules, blocked dates, schedule overrides, and service settings

-- Weekly availability schedules per worker
CREATE TABLE IF NOT EXISTS availability (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  worker_id UUID NOT NULL REFERENCES workers(id) ON DELETE CASCADE,
  day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6), -- 0=Monday, 6=Sunday
  start_time TIME NOT NULL DEFAULT '08:00',
  end_time TIME NOT NULL DEFAULT '17:00',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(worker_id, day_of_week)
);

-- Blocked dates (days off, vacations, etc.)
CREATE TABLE IF NOT EXISTS blocked_dates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  worker_id UUID NOT NULL REFERENCES workers(id) ON DELETE CASCADE,
  blocked_date DATE NOT NULL,
  all_day BOOLEAN NOT NULL DEFAULT true,
  start_time TIME,
  end_time TIME,
  reason TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Schedule overrides (one-off availability changes)
CREATE TABLE IF NOT EXISTS schedule_overrides (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  worker_id UUID NOT NULL REFERENCES workers(id) ON DELETE CASCADE,
  override_date DATE NOT NULL,
  start_time TIME NOT NULL DEFAULT '08:00',
  end_time TIME NOT NULL DEFAULT '17:00',
  is_available BOOLEAN NOT NULL DEFAULT true,
  reason TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Service scheduling settings
CREATE TABLE IF NOT EXISTS service_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT NOT NULL UNIQUE,
  value TEXT NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Insert default service settings
INSERT INTO service_settings (key, value) VALUES
  ('slot_duration_minutes', '60'),
  ('buffer_between_jobs_minutes', '15'),
  ('max_bookings_per_slot', '1'),
  ('advance_booking_days', '30'),
  ('minimum_notice_hours', '24')
ON CONFLICT (key) DO NOTHING;

-- Disable RLS for admin operations (consistent with other tables)
ALTER TABLE availability ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all for availability" ON availability FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE blocked_dates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all for blocked_dates" ON blocked_dates FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE schedule_overrides ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all for schedule_overrides" ON schedule_overrides FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE service_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all for service_settings" ON service_settings FOR ALL USING (true) WITH CHECK (true);
