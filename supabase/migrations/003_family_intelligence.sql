CREATE TABLE IF NOT EXISTS family_brief_settings (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id uuid,
  zip_code text,
  children jsonb DEFAULT '[]',
  faith_calendar boolean DEFAULT true,
  sports_tracking boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS family_sports (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id uuid,
  child_name text NOT NULL,
  sport text NOT NULL,
  team text,
  coach text,
  practice_schedule text,
  season_start date,
  season_end date,
  notes text,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS family_events (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id uuid,
  title text NOT NULL,
  event_date date NOT NULL,
  child_name text,
  category text DEFAULT 'general',
  notes text,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_family_sports_client ON family_sports(client_id);
CREATE INDEX IF NOT EXISTS idx_family_events_client ON family_events(client_id);
CREATE INDEX IF NOT EXISTS idx_family_brief_client ON family_brief_settings(client_id);
