// FlowStore - Zustand Central State Management
// Developed by Arcano Intelligence

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { 
  Profile, Task, Subtask, Project, Habit, HabitLog, 
  DailyNote, Achievement, UserAchievement, XPEvent, Goal, 
  AISuggestion, Priority, EnergyLevel, TaskCategory, Mood, PlanningStyle, GoalType
} from '../types';

// Standard Achievements List
const SYSTEM_ACHIEVEMENTS: Achievement[] = [
  { id: 'ach-1', code: 'FIRST_TASK_COMPLETED', title: 'Primer Paso', description: 'Completaste tu primera tarea en FlowPlanner.', icon: 'CheckCircle', xp_reward: 50, created_at: new Date().toISOString() },
  { id: 'ach-2', code: 'FIVE_TASKS_COMPLETED', title: 'Impulso Inicial', description: 'Completaste 5 tareas. Estás construyendo tracción.', icon: 'Sparkles', xp_reward: 100, created_at: new Date().toISOString() },
  { id: 'ach-3', code: 'FIRST_WEEK_PLANNED', title: 'Estratega Semanal', description: 'Planificaste tu primera semana completa. Claridad mental.', icon: 'Calendar', xp_reward: 100, created_at: new Date().toISOString() },
  { id: 'ach-4', code: 'SEVEN_DAY_CONSISTENCY', title: 'Flujo Imparable', description: 'Mantuviste consistencia por 7 días seguidos.', icon: 'Flame', xp_reward: 200, created_at: new Date().toISOString() },
  { id: 'ach-5', code: 'MONTHLY_REVIEW_DONE', title: 'Visión Elevada', description: 'Realizaste tu primera revisión mensual.', icon: 'TrendingUp', xp_reward: 150, created_at: new Date().toISOString() },
  { id: 'ach-6', code: 'FIRST_HABIT_CREATED', title: 'Semilla de Cambio', description: 'Creaste tu primer hábito flexible.', icon: 'Target', xp_reward: 50, created_at: new Date().toISOString() },
  { id: 'ach-7', code: 'FOCUS_MASTER', title: 'Enfoque Profundo', description: 'Completaste una tarea de alta energía.', icon: 'Zap', xp_reward: 150, created_at: new Date().toISOString() },
  { id: 'ach-8', code: 'FLOW_STRATEGIST', title: 'Arquitecto del Tiempo', description: 'Asociaste 10 tareas a proyectos.', icon: 'Layers', xp_reward: 150, created_at: new Date().toISOString() },
  { id: 'ach-9', code: 'PERFECT_FLOW_DAY', title: 'Día Perfecto', description: 'Completaste todas tus tareas planificadas para hoy.', icon: 'Award', xp_reward: 250, created_at: new Date().toISOString() }
];

interface FlowState {
  // Authentication & Profile
  isAuthenticated: boolean;
  profile: Profile;
  
  // App Collections
  tasks: Task[];
  subtasks: Subtask[];
  projects: Project[];
  habits: Habit[];
  habitLogs: HabitLog[];
  dailyNotes: DailyNote[];
  achievements: Achievement[];
  userAchievements: UserAchievement[];
  xpEvents: XPEvent[];
  goals: Goal[];
  aiSuggestions: AISuggestion[];
  
  // UI States
  isOnboarded: boolean;
  lastLevelUp: number | null; // Trigger level up animation
  activeNotification: { message: string; sub: string; type: string } | null;
  
  // Actions
  login: (email: string) => void;
  logout: () => void;
  setOnboarded: (onboarded: boolean) => void;
  completeOnboarding: (name: string, focusGoal: string, planningStyle: string) => void;
  updateProfile: (data: Partial<Profile>) => void;
  clearActiveNotification: () => void;
  
  // XP & Gamification Engine
  addXP: (points: number, reason: string, sourceType: XPEvent['source_type'], sourceId?: string | null) => void;
  triggerNotification: (message: string, sub: string, type: string) => void;
  unlockAchievement: (code: string) => void;
  
  // Task Actions
  addTask: (task: Omit<Task, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => string;
  completeTask: (id: string) => void;
  uncompleteTask: (id: string) => void;
  deleteTask: (id: string) => void;
  updateTask: (id: string, data: Partial<Task>) => void;
  
  // Subtask Actions
  addSubtask: (taskId: string, title: string) => void;
  toggleSubtask: (subtaskId: string) => void;
  deleteSubtask: (subtaskId: string) => void;
  
  // Project Actions
  addProject: (name: string, description: string, color: string, icon: string, targetDate?: string | null) => void;
  updateProject: (id: string, data: Partial<Project>) => void;
  deleteProject: (id: string) => void;
  
  // Habit Actions
  addHabit: (habit: Omit<Habit, 'id' | 'user_id' | 'is_active' | 'created_at' | 'updated_at'>) => void;
  toggleHabit: (habitId: string, date: string) => void;
  deleteHabit: (id: string) => void;
  updateHabit: (id: string, data: Partial<Habit>) => void;
  
  // Daily Notes Actions
  saveDailyNote: (date: string, data: Partial<Omit<DailyNote, 'id' | 'user_id' | 'note_date' | 'created_at' | 'updated_at'>>) => void;
  
  // Goal Actions
  addGoal: (title: string, description: string, goalType: GoalType, targetDate?: string | null) => void;
  updateGoal: (id: string, data: Partial<Goal>) => void;
  
  // AI Suggestions Actions
  addAISuggestion: (type: AISuggestion['suggestion_type'], message: string, actions: AISuggestion['content']['actions']) => void;
  respondToSuggestion: (id: string, status: 'applied' | 'ignored') => void;
  
  // Hoy Limpio Logic
  reschedulePendingTasks: (taskIds: string[], targetDate: string) => void;
  archivePendingTasks: (taskIds: string[]) => void;
  
  // Reset all local storage
  resetAll: () => void;
}

// Generate relative dates from the local today's date dynamically
const getRelativeDateStr = (offsetDays: number): string => {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const defaultProfile: Profile = {
  id: 'demo-user-id',
  full_name: 'Mateo Arcano',
  avatar_url: null,
  timezone: 'America/Bogota',
  language: 'es',
  planning_style: 'simple',
  day_start_time: '07:30',
  day_end_time: '22:30',
  daily_task_goal: 5,
  theme: 'dark',
  xp: 1250,
  level: 3,
  created_at: new Date(Date.now() - 17 * 86400000).toISOString(),
  updated_at: new Date().toISOString(),
  google_calendar_connected: false,
  google_calendar_email: null,
  google_calendar_target_list: null,
  apple_calendar_connected: false,
  sync_tasks_enabled: true,
  sync_habits_enabled: false,
};

// Initial Projects Seed
const initialProjects: Project[] = [
  { id: 'proj-1', user_id: 'demo-user-id', name: '🚀 Lanzamiento Flow', description: 'Preparativos para la versión MVP de FlowPlanner', color: '#00E6A8', icon: 'Rocket', status: 'active', target_date: getRelativeDateStr(12), created_at: getRelativeDateStr(-10), updated_at: getRelativeDateStr(-10) },
  { id: 'proj-2', user_id: 'demo-user-id', name: '💪 Salud Radical', description: 'Hábitos físicos y de bienestar holístico', color: '#4D8DFF', icon: 'Heart', status: 'active', target_date: null, created_at: getRelativeDateStr(-15), updated_at: getRelativeDateStr(-15) },
  { id: 'proj-3', user_id: 'demo-user-id', name: '🧠 Aprendizaje Continuo', description: 'Lecturas, cursos y entrenamiento mental', color: '#9B5CFF', icon: 'BookOpen', status: 'active', target_date: getRelativeDateStr(30), created_at: getRelativeDateStr(-10), updated_at: getRelativeDateStr(-10) }
];

// Initial Tasks Seed
const initialTasks: Task[] = [
  // Past tasks (Completed to populate stats)
  { id: 'task-c1', user_id: 'demo-user-id', title: 'Definir paleta de colores premium', description: 'Elegir tonos oscuros de fondo y acentos neon de marca', status: 'completed', priority: 'high', category: 'proyecto', project_id: 'proj-1', due_date: getRelativeDateStr(-3), due_time: '10:00', duration_minutes: 60, energy_level: 'high', is_recurring: false, recurrence_rule: null, reminder_at: null, completed_at: new Date(getRelativeDateStr(-3) + 'T11:00:00').toISOString(), created_at: getRelativeDateStr(-5), updated_at: getRelativeDateStr(-3) },
  { id: 'task-c2', user_id: 'demo-user-id', title: 'Crear esquema SQL de Supabase', description: 'Configurar todas las tablas, índices y RLS', status: 'completed', priority: 'medium', category: 'trabajo', project_id: 'proj-1', due_date: getRelativeDateStr(-2), due_time: '14:00', duration_minutes: 120, energy_level: 'high', is_recurring: false, recurrence_rule: null, reminder_at: null, completed_at: new Date(getRelativeDateStr(-2) + 'T16:00:00').toISOString(), created_at: getRelativeDateStr(-4), updated_at: getRelativeDateStr(-2) },
  { id: 'task-c3', user_id: 'demo-user-id', title: 'Estirar 15 minutos en la mañana', description: 'Movilidad articular básica', status: 'completed', priority: 'low', category: 'salud', project_id: 'proj-2', due_date: getRelativeDateStr(-1), due_time: '08:00', duration_minutes: 15, energy_level: 'low', is_recurring: false, recurrence_rule: null, reminder_at: null, completed_at: new Date(getRelativeDateStr(-1) + 'T08:15:00').toISOString(), created_at: getRelativeDateStr(-1), updated_at: getRelativeDateStr(-1) },
  { id: 'task-c4', user_id: 'demo-user-id', title: 'Leer 10 páginas de filosofía', description: 'Meditaciones de Marco Aurelio', status: 'completed', priority: 'medium', category: 'estudio', project_id: 'proj-3', due_date: getRelativeDateStr(-1), due_time: '21:30', duration_minutes: 30, energy_level: 'low', is_recurring: false, recurrence_rule: null, reminder_at: null, completed_at: new Date(getRelativeDateStr(-1) + 'T22:00:00').toISOString(), created_at: getRelativeDateStr(-2), updated_at: getRelativeDateStr(-1) },

  // TODAY TASKS (Mix of pending and one completed)
  { id: 'task-t1', user_id: 'demo-user-id', title: 'Implementar store de Zustand', description: 'Conectar tareas, hábitos y lógica de XP offline-first', status: 'pending', priority: 'high', category: 'trabajo', project_id: 'proj-1', due_date: getRelativeDateStr(0), due_time: '09:00', duration_minutes: 90, energy_level: 'high', is_recurring: false, recurrence_rule: null, reminder_at: null, completed_at: null, created_at: getRelativeDateStr(-1), updated_at: getRelativeDateStr(0) },
  { id: 'task-t2', user_id: 'demo-user-id', title: 'Diseñar la pantalla de Onboarding', description: 'Crear transiciones fluidas de bienvenida y selección de objetivos', status: 'pending', priority: 'high', category: 'proyecto', project_id: 'proj-1', due_date: getRelativeDateStr(0), due_time: '11:30', duration_minutes: 60, energy_level: 'medium', is_recurring: false, recurrence_rule: null, reminder_at: null, completed_at: null, created_at: getRelativeDateStr(-1), updated_at: getRelativeDateStr(0) },
  { id: 'task-t3', user_id: 'demo-user-id', title: 'Hacer cardio suave 30 minutos', description: 'Caminar a paso ligero o trote suave', status: 'completed', priority: 'medium', category: 'salud', project_id: 'proj-2', due_date: getRelativeDateStr(0), due_time: '08:00', duration_minutes: 30, energy_level: 'medium', is_recurring: false, recurrence_rule: null, reminder_at: null, completed_at: new Date(getRelativeDateStr(0) + 'T08:30:00').toISOString(), created_at: getRelativeDateStr(0), updated_at: getRelativeDateStr(0) },
  { id: 'task-t4', user_id: 'demo-user-id', title: 'Revisión técnica de Tailwind CSS v4', description: 'Revisar mejoras y configuración del archivo globals.css', status: 'pending', priority: 'low', category: 'estudio', project_id: 'proj-3', due_date: getRelativeDateStr(0), due_time: '18:00', duration_minutes: 45, energy_level: 'medium', is_recurring: false, recurrence_rule: null, reminder_at: null, completed_at: null, created_at: getRelativeDateStr(0), updated_at: getRelativeDateStr(0) },

  // Overdue / Pending Task (to test "Hoy Limpio" feature)
  { id: 'task-overdue', user_id: 'demo-user-id', title: 'Enviar diseño preliminar de marca', description: 'Exportar paleta e iconos en formato SVG', status: 'pending', priority: 'high', category: 'proyecto', project_id: 'proj-1', due_date: getRelativeDateStr(-2), due_time: '17:00', duration_minutes: 40, energy_level: 'medium', is_recurring: false, recurrence_rule: null, reminder_at: null, completed_at: null, created_at: getRelativeDateStr(-4), updated_at: getRelativeDateStr(-2) },

  // Future tasks
  { id: 'task-f1', user_id: 'demo-user-id', title: 'Estructurar pantalla de Calendario', description: 'Soportar vistas diaria, semanal y mensual deslizable', status: 'pending', priority: 'high', category: 'proyecto', project_id: 'proj-1', due_date: getRelativeDateStr(1), due_time: '10:00', duration_minutes: 120, energy_level: 'high', is_recurring: false, recurrence_rule: null, reminder_at: null, completed_at: null, created_at: getRelativeDateStr(-1), updated_at: getRelativeDateStr(-1) },
  { id: 'task-f2', user_id: 'demo-user-id', title: 'Sesión de entrenamiento de fuerza', description: 'Empuje y tracción, 4 series por ejercicio', status: 'pending', priority: 'medium', category: 'salud', project_id: 'proj-2', due_date: getRelativeDateStr(2), due_time: '07:30', duration_minutes: 65, energy_level: 'high', is_recurring: false, recurrence_rule: null, reminder_at: null, completed_at: null, created_at: getRelativeDateStr(0), updated_at: getRelativeDateStr(0) },
  { id: 'task-f3', user_id: 'demo-user-id', title: 'Revisión Semanal del progreso', description: 'Completar formulario de reflexión e insights con Flow AI', status: 'pending', priority: 'medium', category: 'personal', project_id: null, due_date: getRelativeDateStr(6), due_time: '17:00', duration_minutes: 30, energy_level: 'low', is_recurring: true, recurrence_rule: 'weekly', reminder_at: null, completed_at: null, created_at: getRelativeDateStr(-1), updated_at: getRelativeDateStr(-1) }
];

// Initial Habits Seed
const initialHabits: Habit[] = [
  { id: 'hab-1', user_id: 'demo-user-id', title: 'Meditación matutina', description: '10 min de respiración consciente al despertar', frequency_type: 'daily', target_count: 1, period: 'day', active_days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'], reminder_time: '07:30', color: '#9B5CFF', icon: 'Brain', is_active: true, created_at: getRelativeDateStr(-15), updated_at: getRelativeDateStr(-15) },
  { id: 'hab-2', user_id: 'demo-user-id', title: 'Entrenamiento de fuerza', description: 'Rutina de calistenia o pesas en gimnasio', frequency_type: 'flexible', target_count: 3, period: 'week', active_days: [], reminder_time: '18:00', color: '#4D8DFF', icon: 'Flame', is_active: true, created_at: getRelativeDateStr(-15), updated_at: getRelativeDateStr(-15) },
  { id: 'hab-3', user_id: 'demo-user-id', title: 'Lectura técnica', description: 'Aprender algo nuevo sobre desarrollo, UX o estrategia', frequency_type: 'weekly', target_count: 1, period: 'day', active_days: ['monday', 'wednesday', 'friday'], reminder_time: '21:00', color: '#00E6A8', icon: 'BookOpen', is_active: true, created_at: getRelativeDateStr(-10), updated_at: getRelativeDateStr(-10) },
  { id: 'hab-4', user_id: 'demo-user-id', title: 'Planificación Semanal', description: 'Revisar la semana anterior y agendar bloques en el calendario', frequency_type: 'weekly', target_count: 1, period: 'week', active_days: ['sunday'], reminder_time: '19:00', color: '#FFCC66', icon: 'Compass', is_active: true, created_at: getRelativeDateStr(-10), updated_at: getRelativeDateStr(-10) }
];

// Habit Logs to simulate 14 days of consistency
const initialHabitLogs: HabitLog[] = [];
for (let i = -14; i < 0; i++) {
  const dateStr = getRelativeDateStr(i);
  const [yr, mo, dy] = dateStr.split('-').map(Number);
  const dayName = new Date(yr, mo - 1, dy).toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
  
  // Meditate almost every day (85% consistency)
  if (Math.random() < 0.85) {
    initialHabitLogs.push({ id: `hlog-${i}-1`, user_id: 'demo-user-id', habit_id: 'hab-1', log_date: dateStr, count: 1, completed: true, created_at: dateStr + 'T07:45:00Z' });
  }
  // Strength training 3x a week (Mon, Wed, Fri mostly)
  if (['monday', 'wednesday', 'friday'].includes(dayName)) {
    initialHabitLogs.push({ id: `hlog-${i}-2`, user_id: 'demo-user-id', habit_id: 'hab-2', log_date: dateStr, count: 1, completed: true, created_at: dateStr + 'T18:30:00Z' });
  }
  // Reading on Mon, Wed, Fri
  if (['monday', 'wednesday', 'friday'].includes(dayName) && Math.random() < 0.9) {
    initialHabitLogs.push({ id: `hlog-${i}-3`, user_id: 'demo-user-id', habit_id: 'hab-3', log_date: dateStr, count: 1, completed: true, created_at: dateStr + 'T21:15:00Z' });
  }
  // Weekly planning on Sunday
  if (dayName === 'sunday') {
    initialHabitLogs.push({ id: `hlog-${i}-4`, user_id: 'demo-user-id', habit_id: 'hab-4', log_date: dateStr, count: 1, completed: true, created_at: dateStr + 'T19:30:00Z' });
  }
}

// Pre-unlocked User Achievements (badges)
const initialUserAchievements: UserAchievement[] = [
  { id: 'uach-1', user_id: 'demo-user-id', achievement_id: 'ach-1', unlocked_at: getRelativeDateStr(-10) + 'T11:00:00Z' },
  { id: 'uach-2', user_id: 'demo-user-id', achievement_id: 'ach-2', unlocked_at: getRelativeDateStr(-8) + 'T18:00:00Z' },
  { id: 'uach-3', user_id: 'demo-user-id', achievement_id: 'ach-3', unlocked_at: getRelativeDateStr(-7) + 'T20:00:00Z' },
  { id: 'uach-4', user_id: 'demo-user-id', achievement_id: 'ach-6', unlocked_at: getRelativeDateStr(-10) + 'T07:45:00Z' },
  { id: 'uach-5', user_id: 'demo-user-id', achievement_id: 'ach-7', unlocked_at: getRelativeDateStr(-3) + 'T12:00:00Z' }
];

// Initial Goals
const initialGoals: Goal[] = [
  { id: 'goal-1', user_id: 'demo-user-id', title: 'Lanzar MVP Alpha de FlowPlanner', description: 'Tener base de datos conectada, lógica de XP funcionando y UI premium lista para QA', goal_type: 'monthly', status: 'in_progress', target_date: getRelativeDateStr(12), progress: 70, created_at: getRelativeDateStr(-10), updated_at: getRelativeDateStr(0) },
  { id: 'goal-2', user_id: 'demo-user-id', title: 'Completar 12 entrenamientos de fuerza', description: 'Mejorar masa muscular y resistencia cardiovascular general', goal_type: 'monthly', status: 'in_progress', target_date: getRelativeDateStr(12), progress: 45, created_at: getRelativeDateStr(-15), updated_at: getRelativeDateStr(0) }
];

// Daily notes history to simulate mood/energy trackers
const initialDailyNotes: DailyNote[] = [
  { id: 'dn-1', user_id: 'demo-user-id', note_date: getRelativeDateStr(-3), intention: 'Enfoque absoluto en diseño premium', reflection: 'Gran avance definiendo la marca, la paleta oscura se siente increíble', free_notes: 'Me encantaron los tonos #00E6A8 y #9B5CFF juntos', mood: 'excelente', energy_score: 9, created_at: getRelativeDateStr(-3), updated_at: getRelativeDateStr(-3) },
  { id: 'dn-2', user_id: 'demo-user-id', note_date: getRelativeDateStr(-2), intention: 'Definir el backend relacional', reflection: 'Supabase SQL creado. Las tablas de XP y hábitos flexibles están bien estructuradas', free_notes: 'Cuidado con la recursividad de tareas más adelante', mood: 'bueno', energy_score: 8, created_at: getRelativeDateStr(-2), updated_at: getRelativeDateStr(-2) },
  { id: 'dn-3', user_id: 'demo-user-id', note_date: getRelativeDateStr(-1), intention: 'Descanso activo y lecturas', reflection: 'Día tranquilo. Cargué energías para la semana de desarrollo', free_notes: 'La meditación matutina ayuda mucho a mitigar la ansiedad laboral', mood: 'excelente', energy_score: 9, created_at: getRelativeDateStr(-1), updated_at: getRelativeDateStr(-1) }
];

export const useFlowStore = create<FlowState>()(
  persist(
    (set, get) => ({
      isAuthenticated: true,
      profile: defaultProfile,
      tasks: initialTasks,
      subtasks: [],
      projects: initialProjects,
      habits: initialHabits,
      habitLogs: initialHabitLogs,
      dailyNotes: initialDailyNotes,
      achievements: SYSTEM_ACHIEVEMENTS,
      userAchievements: initialUserAchievements,
      xpEvents: [],
      goals: initialGoals,
      aiSuggestions: [
        {
          id: 'sug-1',
          user_id: 'demo-user-id',
          suggestion_type: 'balance',
          content: {
            message: 'Detecté que tu miércoles está cargado de tareas de alta energía. Te sugiero mover "Definir onboarding avanzado" para el viernes y reservar un bloque de enfoque de 90 minutos.',
            actions: [
              { type: 'move_task', task_id: 'task-overdue', title: 'Enviar diseño preliminar de marca', new_date: getRelativeDateStr(1) }
            ]
          },
          status: 'pending',
          created_at: getRelativeDateStr(0) + 'T08:00:00Z',
          updated_at: getRelativeDateStr(0) + 'T08:00:00Z'
        }
      ],
      
      isOnboarded: true,
      lastLevelUp: null,
      activeNotification: null,

      login: (email) => set({ 
        isAuthenticated: true, 
        profile: { ...defaultProfile, full_name: email.split('@')[0] } 
      }),
      
      logout: () => set({ isAuthenticated: false }),
      
      setOnboarded: (onboarded) => set({ isOnboarded: onboarded }),
      
      completeOnboarding: (name, focusGoal, planningStyle) => {
        const mappedStyle: PlanningStyle = 
          planningStyle === 'rigid' ? 'schedule' :
          planningStyle === 'goals' ? 'projects' : 'simple';

        set((state) => ({
          isOnboarded: true,
          profile: {
            ...state.profile,
            full_name: name,
            planning_style: mappedStyle,
            updated_at: new Date().toISOString()
          }
        }));

        get().addXP(100, 'Completaste el proceso de Onboarding inicial', 'achievement');
      },
      
      updateProfile: (data) => set((state) => ({
        profile: { ...state.profile, ...data, updated_at: new Date().toISOString() }
      })),
      
      clearActiveNotification: () => set({ activeNotification: null }),

      // 🏆 GAMIFICATION SYSTEM
      addXP: (points, reason, sourceType, sourceId = null) => {
        const { profile } = get();
        const currentXP = profile.xp;
        const newXP = currentXP + points;
        
        // Level up formula: 1 level every 500 XP
        const currentLevel = profile.level;
        const newLevel = Math.floor(newXP / 500) + 1;
        const didLevelUp = newLevel > currentLevel;
        
        const newEvent: XPEvent = {
          id: 'xp-' + Math.random().toString(36).substr(2, 9),
          user_id: profile.id,
          source_type: sourceType,
          source_id: sourceId,
          points,
          reason,
          created_at: new Date().toISOString()
        };

        set((state) => ({
          profile: {
            ...state.profile,
            xp: newXP,
            level: newLevel,
            updated_at: new Date().toISOString()
          },
          xpEvents: [newEvent, ...state.xpEvents],
          lastLevelUp: didLevelUp ? newLevel : state.lastLevelUp
        }));

        if (didLevelUp) {
          get().triggerNotification(
            '¡NIVEL ALCANZADO!',
            `¡Felicidades Mateo! Has subido al Nivel ${newLevel}: ${
              newLevel === 2 ? 'Organizador' :
              newLevel === 3 ? 'Enfoque Profundo' :
              newLevel === 4 ? 'Estratega' :
              newLevel === 5 ? 'Arquitecto' : 'Maestro Flow'
            }`,
            'level_up'
          );
        }
      },

      triggerNotification: (message, sub, type) => {
        set({ activeNotification: { message, sub, type } });
        // Auto dismiss after 4 seconds
        setTimeout(() => {
          set((state) => {
            if (state.activeNotification && state.activeNotification.message === message) {
              return { activeNotification: null };
            }
            return {};
          });
        }, 4000);
      },

      // 📝 TASK ACTIONS
      addTask: (taskData) => {
        const id = 'task-' + Math.random().toString(36).substr(2, 9);
        const newTask: Task = {
          ...taskData,
          id,
          user_id: get().profile.id,
          status: 'pending',
          completed_at: null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };

        set((state) => ({
          tasks: [newTask, ...state.tasks]
        }));
        
        // Award XP for planning
        get().addXP(5, `Creaste la tarea: "${newTask.title}"`, 'plan_created', id);
        return id;
      },

      completeTask: (id) => {
        const { tasks, profile } = get();
        const task = tasks.find(t => t.id === id);
        if (!task || task.status === 'completed') return;

        const now = new Date().toISOString();
        const xpEarned = task.priority === 'high' ? 20 : 10;

        set((state) => ({
          tasks: state.tasks.map(t => t.id === id ? { ...t, status: 'completed', completed_at: now, updated_at: now } : t)
        }));

        // Award XP
        get().addXP(xpEarned, `Completaste la tarea: "${task.title}"`, 'task_completed', id);

        // Check achievements!
        const updatedTasks = get().tasks.filter(t => t.status === 'completed');
        const totalCompleted = updatedTasks.length;

        // 1st Task Achievement
        if (totalCompleted === 1) {
          get().unlockAchievement('FIRST_TASK_COMPLETED');
        }
        // 5th Tasks Achievement
        if (totalCompleted === 5) {
          get().unlockAchievement('FIVE_TASKS_COMPLETED');
        }

        // Daily Goal completion check
        const todayStr = getRelativeDateStr(0);
        const completedToday = get().tasks.filter(t => t.due_date === todayStr && t.status === 'completed').length;
        if (completedToday === profile.daily_task_goal) {
          // Trigger Perfect Flow Day!
          get().addXP(50, 'Bono: ¡Cumpliste tu meta de tareas diarias!', 'daily_completed');
          get().unlockAchievement('PERFECT_FLOW_DAY');
        }
        
        // Focus Master Achievement check
        if (task.priority === 'high' && task.energy_level === 'high') {
          get().unlockAchievement('FOCUS_MASTER');
        }
      },

      uncompleteTask: (id) => {
        const { tasks } = get();
        const task = tasks.find(t => t.id === id);
        if (!task || task.status !== 'completed') return;

        const xpLost = task.priority === 'high' ? 20 : 10;
        
        set((state) => ({
          tasks: state.tasks.map(t => t.id === id ? { ...t, status: 'pending', completed_at: null, updated_at: new Date().toISOString() } : t)
        }));

        // Adjust XP (Negative XP)
        get().addXP(-xpLost, `Reabriste la tarea: "${task.title}"`, 'task_completed', id);
      },

      deleteTask: (id) => set((state) => ({
        tasks: state.tasks.filter(t => t.id !== id)
      })),

      updateTask: (id, data) => set((state) => ({
        tasks: state.tasks.map(t => t.id === id ? { ...t, ...data, updated_at: new Date().toISOString() } : t)
      })),

      // 📑 SUBTASK ACTIONS
      addSubtask: (taskId, title) => {
        const newSub: Subtask = {
          id: 'sub-' + Math.random().toString(36).substr(2, 9),
          task_id: taskId,
          user_id: get().profile.id,
          title,
          completed: false,
          created_at: new Date().toISOString()
        };
        set((state) => ({
          subtasks: [...state.subtasks, newSub]
        }));
      },

      toggleSubtask: (subtaskId) => set((state) => ({
        subtasks: state.subtasks.map(s => s.id === subtaskId ? { ...s, completed: !s.completed } : s)
      })),

      deleteSubtask: (subtaskId) => set((state) => ({
        subtasks: state.subtasks.filter(s => s.id !== subtaskId)
      })),

      // 📁 PROJECT ACTIONS
      addProject: (name, description, color, icon, targetDate = null) => {
        const newProj: Project = {
          id: 'proj-' + Math.random().toString(36).substr(2, 9),
          user_id: get().profile.id,
          name,
          description,
          color,
          icon,
          status: 'active',
          target_date: targetDate,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        set((state) => ({
          projects: [...state.projects, newProj]
        }));
        
        get().addXP(15, `Creaste un nuevo proyecto: "${name}"`, 'plan_created', newProj.id);
      },

      updateProject: (id, data) => set((state) => ({
        projects: state.projects.map(p => p.id === id ? { ...p, ...data, updated_at: new Date().toISOString() } : p)
      })),

      deleteProject: (id) => set((state) => ({
        projects: state.projects.filter(p => p.id !== id),
        // Detach tasks associated
        tasks: state.tasks.map(t => t.project_id === id ? { ...t, project_id: null } : t)
      })),

      // 🎯 HABIT ACTIONS
      addHabit: (habitData) => {
        const id = 'hab-' + Math.random().toString(36).substr(2, 9);
        const newHabit: Habit = {
          ...habitData,
          id,
          user_id: get().profile.id,
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };

        set((state) => ({
          habits: [...state.habits, newHabit]
        }));

        get().addXP(15, `Empezaste un nuevo hábito: "${newHabit.title}"`, 'plan_created', id);
        get().unlockAchievement('FIRST_HABIT_CREATED');
      },

      toggleHabit: (habitId, date) => {
        const { habitLogs, profile } = get();
        const existingLogIndex = habitLogs.findIndex(l => l.habit_id === habitId && l.log_date === date);
        const habit = get().habits.find(h => h.id === habitId);
        
        if (!habit) return;

        if (existingLogIndex >= 0) {
          // Uncomplete habit log
          const newLogs = [...habitLogs];
          newLogs.splice(existingLogIndex, 1);
          set({ habitLogs: newLogs });
          get().addXP(-10, `Cancelaste registro de hábito: "${habit.title}"`, 'habit_logged', habitId);
        } else {
          // Complete habit log
          const newLog: HabitLog = {
            id: 'hlog-' + Math.random().toString(36).substr(2, 9),
            user_id: profile.id,
            habit_id: habitId,
            log_date: date,
            count: 1,
            completed: true,
            created_at: new Date().toISOString()
          };
          set((state) => ({
            habitLogs: [...state.habitLogs, newLog]
          }));
          get().addXP(10, `Completaste tu hábito: "${habit.title}"`, 'habit_logged', habitId);

          // Racha / Streak Check (e.g. check 7 days consistency)
          // Simple local check for any 7 logs in the last 7 days
          const last7Days = Array.from({ length: 7 }, (_, i) => getRelativeDateStr(-i));
          const completedLogsLast7 = get().habitLogs.filter(l => last7Days.includes(l.log_date)).length;
          if (completedLogsLast7 >= 7) {
            get().unlockAchievement('SEVEN_DAY_CONSISTENCY');
          }
        }
      },

      deleteHabit: (id) => set((state) => ({
        habits: state.habits.filter(h => h.id !== id),
        habitLogs: state.habitLogs.filter(l => l.habit_id !== id)
      })),

      updateHabit: (id, data) => set((state) => ({
        habits: state.habits.map(h => h.id === id ? { ...h, ...data, updated_at: new Date().toISOString() } : h)
      })),

      // 📓 DAILY NOTES (INTENTION / MOOD TRACKER)
      saveDailyNote: (date, data) => {
        const { dailyNotes, profile } = get();
        const existingIndex = dailyNotes.findIndex(n => n.note_date === date);

        if (existingIndex >= 0) {
          // Update
          const updated = [...dailyNotes];
          updated[existingIndex] = {
            ...updated[existingIndex],
            ...data,
            updated_at: new Date().toISOString()
          };
          set({ dailyNotes: updated });
        } else {
          // Create
          const newNote: DailyNote = {
            id: 'note-' + Math.random().toString(36).substr(2, 9),
            user_id: profile.id,
            note_date: date,
            intention: data.intention || null,
            reflection: data.reflection || null,
            free_notes: data.free_notes || null,
            mood: data.mood || null,
            energy_score: data.energy_score || null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          };
          set((state) => ({
            dailyNotes: [...state.dailyNotes, newNote]
          }));
          get().addXP(10, `Escribiste tu intención y estado de ánimo del día`, 'plan_created', newNote.id);
        }
      },

      // 🏆 GOALS ACTIONS
      addGoal: (title, description, goalType, targetDate = null) => {
        const newGoal: Goal = {
          id: 'goal-' + Math.random().toString(36).substr(2, 9),
          user_id: get().profile.id,
          title,
          description,
          goal_type: goalType,
          status: 'in_progress',
          target_date: targetDate,
          progress: 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        set((state) => ({
          goals: [...state.goals, newGoal]
        }));
        get().addXP(20, `Estableciste un nuevo objetivo: "${title}"`, 'plan_created', newGoal.id);
      },

      updateGoal: (id, data) => set((state) => {
        const updatedGoals = state.goals.map(g => {
          if (g.id === id) {
            const updated = { ...g, ...data, updated_at: new Date().toISOString() };
            if (data.progress === 100 && g.progress !== 100) {
              updated.status = 'completed';
            }
            return updated;
          }
          return g;
        });

        // Trigger XP award if completed
        const oldGoal = state.goals.find(g => g.id === id);
        if (data.progress === 100 && oldGoal && oldGoal.progress !== 100) {
          setTimeout(() => {
            get().addXP(100, `¡Cumpliste tu objetivo! "${oldGoal.title}"`, 'achievement');
            get().triggerNotification('¡OBJETIVO ALCANZADO!', `Lograste completar: ${oldGoal.title}`, 'goal_completed');
          }, 100);
        }

        return { goals: updatedGoals };
      }),

      // 🧠 AI SUGGESTIONS ACTIONS
      addAISuggestion: (type, message, actions) => {
        const newSug: AISuggestion = {
          id: 'sug-' + Math.random().toString(36).substr(2, 9),
          user_id: get().profile.id,
          suggestion_type: type,
          content: { message, actions },
          status: 'pending',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        set((state) => ({
          aiSuggestions: [newSug, ...state.aiSuggestions]
        }));
      },

      respondToSuggestion: (id, status) => {
        const { aiSuggestions, tasks } = get();
        const sug = aiSuggestions.find(s => s.id === id);
        if (!sug) return;

        // Mark suggestion status
        set((state) => ({
          aiSuggestions: state.aiSuggestions.map(s => s.id === id ? { ...s, status, updated_at: new Date().toISOString() } : s)
        }));

        if (status === 'applied') {
          // Execute actions inside the suggestion
          sug.content.actions.forEach(action => {
            if (action.type === 'move_task' && action.task_id && action.new_date) {
              get().updateTask(action.task_id, { due_date: action.new_date });
            }
            if (action.type === 'change_priority' && action.task_id && action.new_priority) {
              get().updateTask(action.task_id, { priority: action.new_priority });
            }
            if (action.type === 'split_task' && action.task_id && action.subtasks) {
              action.subtasks.forEach(subTitle => {
                get().addSubtask(action.task_id!, subTitle);
              });
            }
          });

          // Award planning XP
          get().addXP(25, `Aplicaste recomendaciones del asistente Flow AI`, 'weekly_reviewed', id);
          get().triggerNotification('CONSEJO APLICADO', 'Flow AI organizó tu agenda exitosamente.', 'ai_applied');
        }
      },

      // 🧹 HOY LIMPIO (CLEAN TODAY) RULES
      reschedulePendingTasks: (taskIds, targetDate) => {
        set((state) => ({
          tasks: state.tasks.map(t => taskIds.includes(t.id) ? { ...t, due_date: targetDate, updated_at: new Date().toISOString() } : t)
        }));
        get().addXP(15, `Reprogramaste ${taskIds.length} tareas pendientes para el ${targetDate}`, 'plan_created');
        get().triggerNotification('DÍA DESPEJADO', 'Tareas vencidas reprogramadas con éxito.', 'hoy_limpio');
      },

      archivePendingTasks: (taskIds) => {
        set((state) => ({
          tasks: state.tasks.map(t => taskIds.includes(t.id) ? { ...t, status: 'archived', updated_at: new Date().toISOString() } : t)
        }));
        get().addXP(10, `Archivaste ${taskIds.length} tareas pendientes para reducir saturación`, 'plan_created');
        get().triggerNotification('REDUCCIÓN DE ESTRÉS', 'Tareas archivadas en la sección de revisión.', 'hoy_limpio');
      },

      // 🏆 UNLOCK ACHIEVEMENT/BADGE
      unlockAchievement: (code: string) => {
        const { userAchievements, achievements, profile } = get();
        const ach = achievements.find(a => a.code === code);
        if (!ach) return;

        // Check if already unlocked
        const alreadyUnlocked = userAchievements.some(ua => ua.achievement_id === ach.id);
        if (alreadyUnlocked) return;

        const newUnlock: UserAchievement = {
          id: 'uach-' + Math.random().toString(36).substr(2, 9),
          user_id: profile.id,
          achievement_id: ach.id,
          unlocked_at: new Date().toISOString()
        };

        set((state) => ({
          userAchievements: [...state.userAchievements, newUnlock]
        }));

        // Award reward XP
        get().addXP(ach.xp_reward, `Desbloqueaste el logro: "${ach.title}"`, 'achievement', ach.id);
        get().triggerNotification('¡LOGRO DESBLOQUEADO!', `Ganaste insignia: ${ach.title}`, 'achievement');
      },

      resetAll: () => {
        localStorage.clear();
        set({
          isAuthenticated: true,
          profile: defaultProfile,
          tasks: initialTasks,
          subtasks: [],
          projects: initialProjects,
          habits: initialHabits,
          habitLogs: initialHabitLogs,
          dailyNotes: initialDailyNotes,
          achievements: SYSTEM_ACHIEVEMENTS,
          userAchievements: initialUserAchievements,
          xpEvents: [],
          goals: initialGoals,
          aiSuggestions: [
            {
              id: 'sug-1',
              user_id: 'demo-user-id',
              suggestion_type: 'balance',
              content: {
                message: 'Detecté que tu miércoles está cargado de tareas de alta energía. Te sugiero mover "Definir onboarding avanzado" para el viernes y reservar un bloque de enfoque de 90 minutos.',
                actions: [
                  { type: 'move_task', task_id: 'task-overdue', title: 'Enviar diseño preliminar de marca', new_date: getRelativeDateStr(1) }
                ]
              },
              status: 'pending',
              created_at: getRelativeDateStr(0) + 'T08:00:00Z',
              updated_at: getRelativeDateStr(0) + 'T08:00:00Z'
            }
          ],
          isOnboarded: true,
          lastLevelUp: null,
          activeNotification: null
        });
      }
    }),
    {
      name: 'flowplanner-storage', // local storage key
      version: 2, // Bump to force re-seed after UTC→local date fix
      // Deep merge persisted state to prevent hydration from overwriting arrays
      merge: (persistedState, currentState) => {
        const persisted = persistedState as Partial<FlowState> | undefined;
        if (!persisted) return currentState;
        return {
          ...currentState,
          ...persisted,
          // Ensure arrays are never lost — prefer persisted data if present
          tasks: persisted.tasks ?? currentState.tasks,
          subtasks: persisted.subtasks ?? currentState.subtasks,
          projects: persisted.projects ?? currentState.projects,
          habits: persisted.habits ?? currentState.habits,
          habitLogs: persisted.habitLogs ?? currentState.habitLogs,
          dailyNotes: persisted.dailyNotes ?? currentState.dailyNotes,
          xpEvents: persisted.xpEvents ?? currentState.xpEvents,
          goals: persisted.goals ?? currentState.goals,
          aiSuggestions: persisted.aiSuggestions ?? currentState.aiSuggestions,
          achievements: persisted.achievements ?? currentState.achievements,
          userAchievements: persisted.userAchievements ?? currentState.userAchievements,
        };
      },
    }
  )
);
