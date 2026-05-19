-- FlowPlanner Row Level Security Policies
-- Developed by Arcano Intelligence

-- 1. Enable Row Level Security on all tables
alter table public.profiles enable row level security;
alter table public.projects enable row level security;
alter table public.tasks enable row level security;
alter table public.subtasks enable row level security;
alter table public.habits enable row level security;
alter table public.habit_logs enable row level security;
alter table public.daily_notes enable row level security;
alter table public.achievements enable row level security; -- Public read, admin write
alter table public.user_achievements enable row level security;
alter table public.xp_events enable row level security;
alter table public.goals enable row level security;
alter table public.ai_suggestions enable row level security;

-- 2. CREATE RLS POLICIES

-- profiles
create policy "Users can view their own profile" on public.profiles
  for select using (auth.uid() = id);

create policy "Users can update their own profile" on public.profiles
  for update using (auth.uid() = id);

-- projects
create policy "Users can manage their own projects" on public.projects
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- tasks
create policy "Users can manage their own tasks" on public.tasks
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- subtasks
create policy "Users can manage their own subtasks" on public.subtasks
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- habits
create policy "Users can manage their own habits" on public.habits
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- habit_logs
create policy "Users can manage their own habit logs" on public.habit_logs
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- daily_notes
create policy "Users can manage their own daily notes" on public.daily_notes
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- achievements (public read, no write except service role or admin)
create policy "Achievements are viewable by everyone" on public.achievements
  for select using (true);

-- user_achievements
create policy "Users can manage their own unlocked achievements" on public.user_achievements
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- xp_events
create policy "Users can manage their own XP events" on public.xp_events
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- goals
create policy "Users can manage their own goals" on public.goals
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ai_suggestions
create policy "Users can manage their own AI suggestions" on public.ai_suggestions
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
