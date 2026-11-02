-- LAW & LIFE PLANNER: Supabase database setup
-- Run the entire script in Supabase > SQL Editor > New query.

create extension if not exists pgcrypto;

create table if not exists public.tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  description text default '',
  start_date date not null,
  end_date date not null,
  status text not null default 'todo' check (status in ('todo','doing','done')),
  created_at timestamptz not null default now(),
  constraint tasks_date_order check (end_date >= start_date)
);

create table if not exists public.exams (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  subject text not null default 'อื่น ๆ',
  difficulty text not null default 'พื้นฐาน',
  question text not null,
  answer_key text default '',
  tips text default '',
  created_at timestamptz not null default now()
);

create table if not exists public.planner_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  plan_date date not null,
  category text default 'เรียน',
  start_time time,
  end_time time,
  completed boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.focus_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  mode text not null default 'focus',
  duration_minutes integer not null default 25,
  completed_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

alter table public.tasks enable row level security;
alter table public.exams enable row level security;
alter table public.planner_items enable row level security;
alter table public.focus_sessions enable row level security;

drop policy if exists "Users manage their own tasks" on public.tasks;
create policy "Users manage their own tasks" on public.tasks
for all to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "Users manage their own exams" on public.exams;
create policy "Users manage their own exams" on public.exams
for all to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "Users manage their own planner items" on public.planner_items;
create policy "Users manage their own planner items" on public.planner_items
for all to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "Users manage their own focus sessions" on public.focus_sessions;
create policy "Users manage their own focus sessions" on public.focus_sessions
for all to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);

create index if not exists tasks_user_dates_idx on public.tasks(user_id, start_date, end_date);
create index if not exists exams_user_created_idx on public.exams(user_id, created_at desc);
create index if not exists planner_user_date_idx on public.planner_items(user_id, plan_date);
create index if not exists focus_user_date_idx on public.focus_sessions(user_id, completed_at desc);
