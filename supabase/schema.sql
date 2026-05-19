-- FlowPlanner Database Schema
-- Developed by Arcano Intelligence

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. PROFILES
create table public.profiles (
  id uuid primary key references auth.users on delete cascade,
  full_name text,
  avatar_url text,
  timezone text default 'UTC',
  language text default 'es',
  planning_style text default 'simple',
  day_start_time time default '08:00:00',
  day_end_time time default '22:00:00',
  daily_task_goal int default 5,
  theme text default 'dark',
  xp int default 0,
  level int default 1,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- 2. PROJECTS
create table public.projects (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users on delete cascade not null,
  name text not null,
  description text,
  color text default '#00E6A8',
  icon text default 'Folder',
  status text default 'active' check (status in ('active', 'paused', 'completed', 'archived')),
  target_date date,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- 3. TASKS
create table public.tasks (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users on delete cascade not null,
  title text not null,
  description text,
  status text default 'pending' check (status in ('pending', 'completed', 'archived')),
  priority text default 'medium' check (priority in ('low', 'medium', 'high')),
  category text default 'personal' check (category in ('personal', 'trabajo', 'estudio', 'salud', 'finanzas', 'familia', 'proyecto', 'otro')),
  project_id uuid references public.projects(id) on delete set null,
  due_date date not null,
  due_time time,
  duration_minutes int,
  energy_level text default 'medium' check (energy_level in ('low', 'medium', 'high')),
  is_recurring boolean default false,
  recurrence_rule text,
  reminder_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- 4. SUBTASKS
create table public.subtasks (
  id uuid primary key default uuid_generate_v4(),
  task_id uuid references public.tasks(id) on delete cascade not null,
  user_id uuid references auth.users on delete cascade not null,
  title text not null,
  completed boolean default false,
  created_at timestamptz default now() not null
);

-- 5. HABITS
create table public.habits (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users on delete cascade not null,
  title text not null,
  description text,
  frequency_type text default 'daily' check (frequency_type in ('daily', 'weekly', 'monthly', 'flexible')),
  target_count int default 1,
  period text default 'week' check (period in ('day', 'week', 'month')),
  active_days text[], -- Array of strings e.g. ['monday', 'wednesday', 'friday']
  reminder_time time,
  color text default '#9B5CFF',
  icon text default 'Flame',
  is_active boolean default true,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- 6. HABIT LOGS
create table public.habit_logs (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users on delete cascade not null,
  habit_id uuid references public.habits(id) on delete cascade not null,
  log_date date not null,
  count int default 1,
  completed boolean default true,
  created_at timestamptz default now() not null,
  unique (user_id, habit_id, log_date)
);

-- 7. DAILY NOTES
create table public.daily_notes (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users on delete cascade not null,
  note_date date not null,
  intention text,
  reflection text,
  free_notes text,
  mood text check (mood in ('excelente', 'bueno', 'neutral', 'cansado', 'estresado')),
  energy_score int check (energy_score between 1 and 10),
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null,
  unique (user_id, note_date)
);

-- 8. ACHIEVEMENTS
create table public.achievements (
  id uuid primary key default uuid_generate_v4(),
  code text unique not null,
  title text not null,
  description text not null,
  icon text not null,
  xp_reward int not null,
  created_at timestamptz default now() not null
);

-- 9. USER ACHIEVEMENTS
create table public.user_achievements (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users on delete cascade not null,
  achievement_id uuid references public.achievements(id) on delete cascade not null,
  unlocked_at timestamptz default now() not null,
  unique (user_id, achievement_id)
);

-- 10. XP EVENTS
create table public.xp_events (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users on delete cascade not null,
  source_type text not null, -- 'task_completed', 'habit_logged', 'daily_completed', 'weekly_planned', 'achievement'
  source_id uuid,
  points int not null,
  reason text not null,
  created_at timestamptz default now() not null
);

-- 11. GOALS
create table public.goals (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users on delete cascade not null,
  title text not null,
  description text,
  goal_type text default 'monthly' check (goal_type in ('daily', 'weekly', 'monthly', 'yearly')),
  status text default 'in_progress' check (status in ('in_progress', 'paused', 'completed', 'cancelled')),
  target_date date,
  progress int default 0 check (progress between 0 and 100),
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- 12. AI SUGGESTIONS
create table public.ai_suggestions (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users on delete cascade not null,
  suggestion_type text not null, -- 'reschedule', 'balance', 'break', 'weekly_plan'
  content jsonb not null,
  status text default 'pending' check (status in ('pending', 'applied', 'ignored')),
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- INDEXES FOR HIGH PERFORMANCE
create index idx_tasks_user_date on public.tasks(user_id, due_date);
create index idx_tasks_user_status on public.tasks(user_id, status);
create index idx_habits_user on public.habits(user_id);
create index idx_habit_logs_user_date on public.habit_logs(user_id, log_date);
create index idx_daily_notes_user_date on public.daily_notes(user_id, note_date);
create index idx_goals_user_type on public.goals(user_id, goal_type);
create index idx_xp_events_user_created on public.xp_events(user_id, created_at);

-- AUTOMATIC UPDATED_AT TRIGGERS
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger tr_profiles_updated_at before update on public.profiles for each row execute procedure public.handle_updated_at();
create trigger tr_projects_updated_at before update on public.projects for each row execute procedure public.handle_updated_at();
create trigger tr_tasks_updated_at before update on public.tasks for each row execute procedure public.handle_updated_at();
create trigger tr_habits_updated_at before update on public.habits for each row execute procedure public.handle_updated_at();
create trigger tr_daily_notes_updated_at before update on public.daily_notes for each row execute procedure public.handle_updated_at();
create trigger tr_goals_updated_at before update on public.goals for each row execute procedure public.handle_updated_at();
create trigger tr_ai_suggestions_updated_at before update on public.ai_suggestions for each row execute procedure public.handle_updated_at();

-- AUTOMATED XP LEVEL-UP HANDLER ON PROFILE XP UPDATE
create or replace function public.check_xp_levelup()
returns trigger as $$
declare
  new_level int;
begin
  -- Level is calculated as: 1 + floor(xp / 500)
  new_level := 1 + floor(new.xp / 500);
  if new_level <> new.level then
    new.level := new_level;
  end if;
  return new;
end;
$$ language plpgsql;

create trigger tr_profiles_xp_levelup before update of xp on public.profiles for each row execute procedure public.check_xp_levelup();

-- AUTOMATED PROFILE CREATION ON AUTH SIGNUP
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, avatar_url, timezone, language, xp, level)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    new.raw_user_meta_data->>'avatar_url',
    'UTC',
    'es',
    0,
    1
  );
  return new;
end;
$$ language plpgsql;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
