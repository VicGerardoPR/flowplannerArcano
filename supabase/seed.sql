-- FlowPlanner Database Seed File
-- Developed by Arcano Intelligence

-- Initialize Achievements / Badges
insert into public.achievements (code, title, description, icon, xp_reward) values
  ('FIRST_TASK_COMPLETED', 'Primer Paso', 'Completaste tu primera tarea en FlowPlanner. ¡El inicio de algo grande!', 'CheckCircle', 50),
  ('FIVE_TASKS_COMPLETED', 'Impulso Inicial', 'Has completado 5 tareas. Estás construyendo tracción.', 'Sparkles', 100),
  ('FIRST_WEEK_PLANNED', 'Estratega Semanal', 'Planificaste tu primera semana completa. Claridad mental activada.', 'Calendar', 100),
  ('SEVEN_DAY_CONSISTENCY', 'Flujo Imparable', 'Mantuviste una racha de hábitos o tareas por 7 días seguidos.', 'Flame', 200),
  ('MONTHLY_REVIEW_DONE', 'Visión Elevada', 'Realizaste tu primera revisión mensual de objetivos.', 'TrendingUp', 150),
  ('FIRST_HABIT_CREATED', 'Semilla de Cambio', 'Creaste tu primer hábito flexible para mejorar tu rutina.', 'Target', 50),
  ('FOCUS_MASTER', 'Enfoque Profundo', 'Completaste una sesión o tarea de alta energía sin distracciones.', 'Zap', 150),
  ('FLOW_STRATEGIST', 'Arquitecto del Tiempo', 'Asociaste exitosamente 10 tareas a proyectos específicos.', 'Layers', 150),
  ('PERFECT_FLOW_DAY', 'Día Perfecto', 'Completaste todas tus tareas planificadas para hoy. ¡Espectacular!', 'Award', 250)
on conflict (code) do update set
  title = excluded.title,
  description = excluded.description,
  icon = excluded.icon,
  xp_reward = excluded.xp_reward;
