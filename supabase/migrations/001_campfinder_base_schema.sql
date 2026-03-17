-- CampFinder Base Schema
-- Date: 2026-03-17
-- Isolated Supabase project — zero data bleed with Maestra

-- ─── Universal tables (same structure as all Knowledge Foundry products) ────

CREATE TABLE IF NOT EXISTS clients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid,
  product_id text NOT NULL DEFAULT 'campfinder',
  intake_answers jsonb,
  system_prompt text,
  system_prompt_version int DEFAULT 1,
  status text DEFAULT 'trial',
  generations_used int DEFAULT 0,
  trial_limit int DEFAULT 3,
  stripe_customer_id text,
  stripe_subscription_id text,
  stripe_status text,
  is_test_user boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS generations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid REFERENCES clients(id),
  user_id uuid,
  product_id text NOT NULL DEFAULT 'campfinder',
  input_params jsonb,
  output text,
  output_type text,
  model_version text,
  tokens_used int,
  prompt_version int,
  created_at timestamptz DEFAULT now(),
  copied_at timestamptz,
  edited boolean DEFAULT false
);

CREATE TABLE IF NOT EXISTS feedback (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  generation_id uuid REFERENCES generations(id),
  user_id uuid,
  signal text,
  edit_description text,
  miss_reason text,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS knowledge_ledger (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid REFERENCES clients(id),
  product_id text NOT NULL DEFAULT 'campfinder',
  category text,
  item text,
  covered_date date,
  times_reinforced int DEFAULT 1,
  last_used timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS resources_master (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id text NOT NULL DEFAULT 'campfinder',
  resource_name text,
  resource_type text,
  approved boolean DEFAULT false,
  approved_at timestamptz,
  approved_by text
);

CREATE TABLE IF NOT EXISTS resources_suggested (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid REFERENCES clients(id),
  product_id text NOT NULL DEFAULT 'campfinder',
  suggestion_text text,
  voice_note_url text,
  reviewed boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- ─── CampFinder-specific tables ─────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS camp_options (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  location text,
  address text,
  lat double precision,
  lng double precision,
  age_min int,
  age_max int,
  weekly_cost decimal(10,2),
  registration_open date,
  registration_close date,
  camp_type text,
  source text DEFAULT 'manual',
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS family_plan (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid REFERENCES clients(id),
  option_selected text,
  week_of date,
  total_cost decimal(10,2),
  drive_time_minutes int,
  conflicts_resolved jsonb,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS carpool_matches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  camp_id uuid REFERENCES camp_options(id),
  family_id uuid REFERENCES clients(id),
  zip_code text NOT NULL,
  opted_in boolean DEFAULT false,
  kids_ages int[],
  created_at timestamptz DEFAULT now()
);
