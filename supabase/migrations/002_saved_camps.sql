CREATE TABLE IF NOT EXISTS saved_camps (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id uuid,
  camp_name text NOT NULL,
  location text,
  age_range text,
  activity_type text,
  weekly_cost text,
  notes text,
  rating integer,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_saved_camps_client ON saved_camps(client_id);
