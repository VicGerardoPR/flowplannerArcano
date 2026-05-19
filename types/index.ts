// FlowPlanner Types definition
// Developed by Arcano Intelligence

export type Priority = 'low' | 'medium' | 'high';
export type EnergyLevel = 'low' | 'medium' | 'high';
export type TaskCategory = 'personal' | 'trabajo' | 'estudio' | 'salud' | 'finanzas' | 'familia' | 'proyecto' | 'otro';
export type TaskStatus = 'pending' | 'completed' | 'archived';
export type ProjectStatus = 'active' | 'paused' | 'completed' | 'archived';
export type FrequencyType = 'daily' | 'weekly' | 'monthly' | 'flexible';
export type PeriodType = 'day' | 'week' | 'month';
export type GoalType = 'daily' | 'weekly' | 'monthly' | 'yearly';
export type GoalStatus = 'in_progress' | 'paused' | 'completed' | 'cancelled';
export type Mood = 'excelente' | 'bueno' | 'neutral' | 'cansado' | 'estresado';
export type PlanningStyle = 'simple' | 'schedule' | 'projects' | 'habits' | 'ai';

export interface Profile {
  id: string;
  full_name: string;
  avatar_url: string | null;
  timezone: string;
  language: string;
  planning_style: PlanningStyle;
  day_start_time: string; // e.g. "08:00"
  day_end_time: string; // e.g. "22:00"
  daily_task_goal: number;
  theme: 'dark' | 'light';
  xp: number;
  level: number;
  created_at: string;
  updated_at: string;
}

export interface Project {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  color: string;
  icon: string;
  status: ProjectStatus;
  target_date: string | null;
  created_at: string;
  updated_at: string;
}

export interface Task {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: Priority;
  category: TaskCategory;
  project_id: string | null;
  due_date: string; // YYYY-MM-DD
  due_time: string | null; // HH:MM
  duration_minutes: number | null;
  energy_level: EnergyLevel;
  is_recurring: boolean;
  recurrence_rule: string | null;
  reminder_at: string | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface Subtask {
  id: string;
  task_id: string;
  user_id: string;
  title: string;
  completed: boolean;
  created_at: string;
}

export interface Habit {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  frequency_type: FrequencyType;
  target_count: number;
  period: PeriodType;
  active_days: string[]; // ['monday', 'wednesday', 'friday']
  reminder_time: string | null; // HH:MM
  color: string;
  icon: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface HabitLog {
  id: string;
  user_id: string;
  habit_id: string;
  log_date: string; // YYYY-MM-DD
  count: number;
  completed: boolean;
  created_at: string;
}

export interface DailyNote {
  id: string;
  user_id: string;
  note_date: string; // YYYY-MM-DD
  intention: string | null;
  reflection: string | null;
  free_notes: string | null;
  mood: Mood | null;
  energy_score: number | null; // 1 to 10
  created_at: string;
  updated_at: string;
}

export interface Achievement {
  id: string;
  code: string;
  title: string;
  description: string;
  icon: string;
  xp_reward: number;
  created_at: string;
}

export interface UserAchievement {
  id: string;
  user_id: string;
  achievement_id: string;
  unlocked_at: string;
}

export interface XPEvent {
  id: string;
  user_id: string;
  source_type: 'task_completed' | 'habit_logged' | 'daily_completed' | 'weekly_planned' | 'achievement' | 'weekly_reviewed' | 'plan_created';
  source_id: string | null;
  points: number;
  reason: string;
  created_at: string;
}

export interface Goal {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  goal_type: GoalType;
  status: GoalStatus;
  target_date: string | null;
  progress: number; // 0 to 100
  created_at: string;
  updated_at: string;
}

export interface AISuggestion {
  id: string;
  user_id: string;
  suggestion_type: 'reschedule' | 'balance' | 'break' | 'weekly_plan';
  content: {
    message: string;
    actions: Array<{
      type: 'move_task' | 'add_block' | 'change_priority' | 'split_task';
      task_id?: string;
      title?: string;
      new_date?: string;
      new_priority?: Priority;
      subtasks?: string[];
    }>;
  };
  status: 'pending' | 'applied' | 'ignored';
  created_at: string;
  updated_at: string;
}
