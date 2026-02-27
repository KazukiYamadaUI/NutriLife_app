-- ============================================================
-- NutriLife Supabase Schema
-- Supabase SQL Editor で実行してください
-- ============================================================

-- 1. profiles テーブル (auth.users と 1:1)
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  phone text,
  display_name text not null default 'ユーザー',
  gender text check (gender in ('male', 'female', 'other', '')),
  birth_year text,
  height text,
  weight text,
  is_profile_complete boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 2. meal_logs テーブル
create table if not exists public.meal_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  name text not null,
  cal integer not null default 0,
  protein real not null default 0,
  fat real not null default 0,
  carbs real not null default 0,
  fiber real not null default 0,
  salt real not null default 0,
  score integer not null default 50,
  ingredients text[] not null default '{}',
  advice text,
  missing text,
  praise text,
  image_url text,
  feedback text check (feedback in ('good', 'bad')),
  date text not null,
  time text not null,
  created_at timestamptz not null default now()
);

create index if not exists idx_meal_logs_user_date on public.meal_logs(user_id, date);

-- 3. lifestyles テーブル (ユーザーごとに1レコード)
create table if not exists public.lifestyles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references public.profiles(id) on delete cascade,
  portion_size text,
  exercise_level text,
  appetite text,
  meal_frequency text,
  walk_minutes text,
  updated_at timestamptz not null default now()
);

-- 4. health_data テーブル
create table if not exists public.health_data (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  steps integer,
  heart_rate integer,
  weight real,
  blood_pressure_sys integer,
  blood_pressure_dia integer,
  sleep_hours real,
  synced_at timestamptz not null default now()
);

create index if not exists idx_health_data_user_synced on public.health_data(user_id, synced_at);

-- ============================================================
-- updated_at 自動更新トリガー
-- ============================================================
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger on_profiles_updated
  before update on public.profiles
  for each row execute function public.handle_updated_at();

create trigger on_lifestyles_updated
  before update on public.lifestyles
  for each row execute function public.handle_updated_at();

-- ============================================================
-- 新規ユーザー登録時に profiles を自動作成するトリガー
-- ============================================================
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, phone)
  values (new.id, new.phone);
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============================================================
-- Row Level Security (RLS)
-- ============================================================

-- profiles
alter table public.profiles enable row level security;

create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

create policy "Users can insert own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

-- meal_logs
alter table public.meal_logs enable row level security;

create policy "Users can view own meal logs"
  on public.meal_logs for select
  using (auth.uid() = user_id);

create policy "Users can insert own meal logs"
  on public.meal_logs for insert
  with check (auth.uid() = user_id);

create policy "Users can update own meal logs"
  on public.meal_logs for update
  using (auth.uid() = user_id);

create policy "Users can delete own meal logs"
  on public.meal_logs for delete
  using (auth.uid() = user_id);

-- profiles (delete)
create policy "Users can delete own profile"
  on public.profiles for delete
  using (auth.uid() = id);

-- lifestyles
alter table public.lifestyles enable row level security;

create policy "Users can view own lifestyle"
  on public.lifestyles for select
  using (auth.uid() = user_id);

create policy "Users can insert own lifestyle"
  on public.lifestyles for insert
  with check (auth.uid() = user_id);

create policy "Users can update own lifestyle"
  on public.lifestyles for update
  using (auth.uid() = user_id);

create policy "Users can delete own lifestyle"
  on public.lifestyles for delete
  using (auth.uid() = user_id);

-- health_data
alter table public.health_data enable row level security;

create policy "Users can view own health data"
  on public.health_data for select
  using (auth.uid() = user_id);

create policy "Users can insert own health data"
  on public.health_data for insert
  with check (auth.uid() = user_id);

create policy "Users can delete own health data"
  on public.health_data for delete
  using (auth.uid() = user_id);

-- ============================================================
-- アカウント削除用 RPC (security definer でRLSをバイパス)
-- ============================================================
create or replace function public.delete_own_account()
returns void as $$
declare
  uid uuid := auth.uid();
begin
  delete from public.meal_logs   where user_id = uid;
  delete from public.lifestyles  where user_id = uid;
  delete from public.health_data where user_id = uid;
  delete from public.profiles    where id = uid;
end;
$$ language plpgsql security definer;
