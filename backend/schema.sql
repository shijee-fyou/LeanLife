-- LeanLife 多用户轻商用 MVP 数据库骨架
-- Database: PostgreSQL

create extension if not exists "pgcrypto";

create table if not exists users (
  id uuid primary key default gen_random_uuid(),
  email varchar(255) not null unique,
  password_hash text not null,
  role varchar(24) not null default 'user',
  status varchar(24) not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists user_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references users(id) on delete cascade,
  display_name varchar(120),
  sex varchar(24),
  birth_date date,
  height_cm numeric(5,2),
  goal_type varchar(32) not null default 'fat_loss',
  activity_level varchar(32),
  training_days_per_week integer,
  lifestyle_payload jsonb not null default '{}'::jsonb,
  timezone varchar(64) not null default 'Asia/Shanghai',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists body_assessments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  profile_id uuid references user_profiles(id) on delete set null,
  assessment_date date not null,
  weight_kg numeric(6,2),
  waist_cm numeric(6,2),
  neck_cm numeric(6,2),
  hip_cm numeric(6,2),
  body_fat_percent numeric(5,2),
  bmr_kcal integer,
  tdee_kcal integer,
  target_calories integer,
  target_protein_g numeric(6,2),
  target_fat_g numeric(6,2),
  target_carbs_g numeric(6,2),
  target_fiber_g numeric(6,2),
  recovery_score numeric(5,2),
  habit_score numeric(5,2),
  recommended_plan_code varchar(64),
  algorithm_version varchar(32) not null,
  input_payload jsonb not null default '{}'::jsonb,
  result_payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists idx_body_assessments_user_date on body_assessments(user_id, assessment_date desc);

create table if not exists diet_plan_templates (
  id uuid primary key default gen_random_uuid(),
  code varchar(64) not null unique,
  name varchar(120) not null,
  version varchar(24) not null,
  summary text,
  calorie_ratio jsonb not null default '{}'::jsonb,
  guidance_payload jsonb not null default '{}'::jsonb,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists food_catalog (
  id uuid primary key default gen_random_uuid(),
  code varchar(80) not null unique,
  name varchar(120) not null,
  category varchar(48) not null,
  measure_base varchar(16) not null check (measure_base in ('g', 'ml')),
  calories_per_100 numeric(8,2) not null default 0,
  protein_per_100 numeric(8,2) not null default 0,
  fat_per_100 numeric(8,2) not null default 0,
  carbs_per_100 numeric(8,2) not null default 0,
  fiber_per_100 numeric(8,2) not null default 0,
  micronutrients jsonb not null default '{}'::jsonb,
  keywords jsonb not null default '[]'::jsonb,
  source_label varchar(120),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_food_catalog_category on food_catalog(category);

create table if not exists food_unit_options (
  id uuid primary key default gen_random_uuid(),
  food_id uuid not null references food_catalog(id) on delete cascade,
  unit_key varchar(24) not null,
  unit_label varchar(32) not null,
  metric_amount numeric(8,2) not null,
  is_default boolean not null default false,
  created_at timestamptz not null default now(),
  unique (food_id, unit_key)
);

create table if not exists daily_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  log_date date not null,
  timezone varchar(64) not null default 'Asia/Shanghai',
  active_plan_code varchar(64),
  active_plan_version varchar(24),
  assessment_id uuid references body_assessments(id) on delete set null,
  energy_score integer,
  hunger_score integer,
  adherence_score integer,
  plan_match_score integer,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, log_date)
);

create index if not exists idx_daily_logs_user_date on daily_logs(user_id, log_date desc);

create table if not exists body_metric_entries (
  id uuid primary key default gen_random_uuid(),
  daily_log_id uuid not null references daily_logs(id) on delete cascade,
  weight_kg numeric(6,2),
  waist_cm numeric(6,2),
  sleep_hours numeric(4,2),
  hydration_ml integer,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (daily_log_id)
);

create table if not exists food_entries (
  id uuid primary key default gen_random_uuid(),
  daily_log_id uuid not null references daily_logs(id) on delete cascade,
  food_id text not null,
  food_name varchar(120) not null default '',
  meal_slot varchar(24) not null,
  unit_key varchar(24) not null,
  amount numeric(8,2) not null,
  base_amount numeric(8,2) not null,
  calories numeric(8,2) not null default 0,
  protein_g numeric(8,2) not null default 0,
  fat_g numeric(8,2) not null default 0,
  carbs_g numeric(8,2) not null default 0,
  fiber_g numeric(8,2) not null default 0,
  micronutrients jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists idx_food_entries_daily_log on food_entries(daily_log_id);

create table if not exists nutrition_snapshots (
  id uuid primary key default gen_random_uuid(),
  daily_log_id uuid not null unique references daily_logs(id) on delete cascade,
  calories numeric(8,2) not null default 0,
  protein_g numeric(8,2) not null default 0,
  fat_g numeric(8,2) not null default 0,
  carbs_g numeric(8,2) not null default 0,
  fiber_g numeric(8,2) not null default 0,
  micronutrients jsonb not null default '{}'::jsonb,
  macro_ratio jsonb not null default '{}'::jsonb,
  score_payload jsonb not null default '{}'::jsonb,
  algorithm_version varchar(32) not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists recommendation_snapshots (
  id uuid primary key default gen_random_uuid(),
  daily_log_id uuid not null references daily_logs(id) on delete cascade,
  assessment_id uuid references body_assessments(id) on delete set null,
  plan_code varchar(64) not null,
  algorithm_version varchar(32) not null,
  snapshot_type varchar(32) not null,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists idx_recommendation_snapshots_daily_log on recommendation_snapshots(daily_log_id, snapshot_type);
