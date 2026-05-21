// MonthView - FlowPlanner Monthly Grid & Heatmap
// Developed by Arcano Intelligence

'use client';
import React, { useState } from 'react';
import { useFlowStore } from '../../store/flowStore';
import { 
  ChevronLeft, ChevronRight, Target, 
  Award, Plus, TrendingUp, X, Trash2, Calendar, Clock, Zap, Check
} from 'lucide-react';
import { Task, Priority, TaskCategory } from '../../types';
import { toLocalDateStr } from '../../lib/dateUtils';

export default function MonthView() {
  const tasks = useFlowStore((state) => state.tasks);
  const habitLogs = useFlowStore((state) => state.habitLogs);
  const goals = useFlowStore((state) => state.goals);
  const updateGoal = useFlowStore((state) => state.updateGoal);
  const addGoal = useFlowStore((state) => state.addGoal);
  const triggerNotification = useFlowStore((state) => state.triggerNotification);
  const addTask = useFlowStore((state) => state.addTask);
  const deleteTask = useFlowStore((state) => state.deleteTask);
  const completeTask = useFlowStore((state) => state.completeTask);
  const uncompleteTask = useFlowStore((state) => state.uncompleteTask);

  // Month navigation (0 = May 2026)
  const [monthOffset, setMonthOffset] = useState(0);

  // New Goal Input
  const [newGoalTitle, setNewGoalTitle] = useState('');
  const [showGoalForm, setShowGoalForm] = useState(false);

  // Day Planner Modal states
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskPriority, setNewTaskPriority] = useState<Priority>('medium');
  const [newTaskCategory, setNewTaskCategory] = useState<TaskCategory>('trabajo');
  const [newTaskDuration, setNewTaskDuration] = useState<number>(60);
  const [newTaskTime, setNewTaskTime] = useState<string>('');

  // Base month anchor relative to today's local system date
  const todayDate = new Date();
  const baseYear = todayDate.getFullYear();
  const baseMonth = todayDate.getMonth(); // 0-indexed local month

  const getTargetMonthYear = () => {
    const d = new Date(baseYear, baseMonth + monthOffset, 1);
    return {
      year: d.getFullYear(),
      month: d.getMonth(),
      name: d.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })
    };
  };

  const { year, month, name: monthYearLabel } = getTargetMonthYear();

  // Create Days for Grid (May 2026 starts on Friday)
  // Let's generate a full calendar matrix
  const firstDayIndex = new Date(year, month, 1).getDay(); // Sun = 0, Mon = 1, etc.
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  type CalendarDay = 
    | { padding: true }
    | {
        padding: false;
        dayNumber: number;
        dateStr: string;
        tasks: Task[];
        completedTasks: Task[];
        habitsCount: number;
      };

  const calendarDays: CalendarDay[] = [];
  
  // Empty spaces for previous month's padding
  const paddingDays = firstDayIndex === 0 ? 6 : firstDayIndex - 1; // Align Mon as first day
  for (let i = 0; i < paddingDays; i++) {
    calendarDays.push({ padding: true });
  }

  // Populate actual month days
  for (let i = 1; i <= daysInMonth; i++) {
    const dayDate = new Date(year, month, i);
    const dateStr = toLocalDateStr(dayDate);
    
    const dayTasks = tasks.filter(t => t.due_date === dateStr && t.status !== 'archived');
    const dayCompleted = dayTasks.filter(t => t.status === 'completed');
    const dayHabitsCompleted = habitLogs.filter(l => l.log_date === dateStr && l.completed);

    calendarDays.push({
      padding: false,
      dayNumber: i,
      dateStr,
      tasks: dayTasks,
      completedTasks: dayCompleted,
      habitsCount: dayHabitsCompleted.length
    });
  }

  const handleProgressGoal = (id: string, currentProgress: number) => {
    const nextProgress = Math.min(100, currentProgress + 10);
    updateGoal(id, { progress: nextProgress });
    triggerNotification(
      'META ACTUALIZADA',
      `Progreso aumentado al ${nextProgress}%`,
      'success'
    );
  };

  const handleCreateGoalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGoalTitle.trim()) return;

    const endOfMonth = new Date(year, month + 1, 0);
    const endOfMonthStr = `${endOfMonth.getFullYear()}-${String(endOfMonth.getMonth() + 1).padStart(2, '0')}-${String(endOfMonth.getDate()).padStart(2, '0')}`;
    addGoal(newGoalTitle.trim(), 'Meta mensual creada.', 'monthly', endOfMonthStr);
    setNewGoalTitle('');
    setShowGoalForm(false);

    triggerNotification(
      'META FIJADA',
      `Has fijado un nuevo objetivo mensual`,
      'success'
    );
  };

  // Consistency Heatmap calculation relative to today's local system date
  const getRelativeDateStr = (offsetDays: number): string => {
    const d = new Date();
    d.setDate(d.getDate() + offsetDays);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const heatmapDays = Array.from({ length: 28 }, (_, i) => {
    const offset = i - 21; // Past 21 days up to 6 days in future
    const dateStr = getRelativeDateStr(offset);
    const completedTasks = tasks.filter(t => t.due_date === dateStr && t.status === 'completed').length;
    const completedHabits = habitLogs.filter(l => l.log_date === dateStr).length;
    const totalActivity = completedTasks + completedHabits;

    let intensityClass = 'bg-white/5';
    if (totalActivity > 0 && totalActivity <= 2) intensityClass = 'bg-primary/20';
    else if (totalActivity > 2 && totalActivity <= 4) intensityClass = 'bg-primary/55';
    else if (totalActivity > 4) intensityClass = 'bg-primary';

    return {
      dateStr,
      totalActivity,
      intensityClass
    };
  });

  return (
    <div className="space-y-6 pb-24">
      {/* HEADER SECTION */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-text-primary">Visión Elevada</h2>
          <p className="text-xs text-text-secondary mt-0.5">
            Planifica a largo plazo y mide tu constancia mensual.
          </p>
          <p className="text-[10px] text-primary/80 font-medium mt-1 flex items-center gap-1">
            <span>💡 Consejo Flow: Haz clic en cualquier día de la cuadrícula para ver o añadir tareas.</span>
          </p>
        </div>

        {/* Month Navigation */}
        <div className="flex items-center gap-1.5 bg-white/5 border border-white/10 rounded-xl p-1">
          <button
            onClick={() => setMonthOffset(monthOffset - 1)}
            disabled={monthOffset <= -12}
            className="p-2 rounded-lg text-text-secondary hover:text-text-primary hover:bg-white/5 transition-all disabled:opacity-30 disabled:hover:bg-transparent"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-xs font-bold text-text-primary px-3 capitalize">
            {monthYearLabel}
          </span>
          <button
            onClick={() => setMonthOffset(monthOffset + 1)}
            disabled={monthOffset >= 12}
            className="p-2 rounded-lg text-text-secondary hover:text-text-primary hover:bg-white/5 transition-all disabled:opacity-30 disabled:hover:bg-transparent"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* HEATMAP / CONSISTENCY MAP */}
      <div className="rounded-2xl glass-panel p-6">
        <h3 className="text-sm font-bold uppercase tracking-wider text-text-primary mb-4 flex items-center gap-1.5">
          <TrendingUp className="w-4 h-4 text-primary animate-pulse" />
          <span>Mapa de Consistencia y Estado de Flow</span>
        </h3>

        <div className="flex flex-col items-center justify-center gap-4">
          {/* Consistency Heatmap Grid */}
          <div className="flex flex-wrap gap-1.5 max-w-full justify-center">
            {heatmapDays.map((day, idx) => (
              <div
                key={idx}
                title={`${day.dateStr}: ${day.totalActivity} actividades completadas`}
                className={`w-6 h-6 rounded-md ${day.intensityClass} transition-all hover:scale-110 cursor-pointer`}
              />
            ))}
          </div>

          <div className="flex items-center gap-4 text-[10px] text-text-secondary">
            <span>Menos</span>
            <div className="flex gap-1.5">
              <div className="w-3.5 h-3.5 rounded bg-white/5" />
              <div className="w-3.5 h-3.5 rounded bg-primary/20" />
              <div className="w-3.5 h-3.5 rounded bg-primary/55" />
              <div className="w-3.5 h-3.5 rounded bg-primary" />
            </div>
            <span>Más Flow</span>
          </div>
        </div>
      </div>

      {/* MONTHLY CALENDAR GRID & GOALS SPLIT */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Calendar Grid (2 Cols) */}
        <div className="lg:col-span-2 rounded-2xl glass-panel p-6">
          <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-extrabold uppercase text-text-secondary/70 mb-2">
            <span>Lun</span>
            <span>Mar</span>
            <span>Mié</span>
            <span>Jue</span>
            <span>Vie</span>
            <span>Sáb</span>
            <span>Dom</span>
          </div>

          <div className="grid grid-cols-7 gap-2">
            {calendarDays.map((day, idx) => {
              if (day.padding) {
                return (
                  <div key={idx} className="aspect-square rounded-xl bg-white/[0.01] border border-transparent" />
                );
              }

              const todayObj = new Date();
              const todayStr = `${todayObj.getFullYear()}-${String(todayObj.getMonth() + 1).padStart(2, '0')}-${String(todayObj.getDate()).padStart(2, '0')}`;
              const isToday = day.dateStr === todayStr;
              const hasTasks = day.tasks.length > 0;
              const isCompleted = hasTasks && day.tasks.length === day.completedTasks.length;

              return (
                <div
                  key={idx}
                  onClick={() => setSelectedDate(day.dateStr)}
                  className={`aspect-square rounded-xl border p-2 flex flex-col justify-between transition-all cursor-pointer hover:border-primary/50 hover:bg-white/5 ${
                    isToday 
                      ? 'border-primary bg-primary/5 shadow-md shadow-primary/5' 
                      : isCompleted
                        ? 'border-primary/20 bg-primary/5 shadow-md shadow-primary/5'
                        : 'border-white/5 bg-black/20 hover:border-white/10'
                  }`}
                >
                  <span className={`text-xs font-bold ${isToday ? 'text-primary' : 'text-text-primary'}`}>
                    {day.dayNumber}
                  </span>

                  <div className="flex gap-1 flex-wrap justify-end">
                    {day.tasks.map((task) => (
                      <div 
                        key={task.id} 
                        title={task.title}
                        className={`w-2 h-2 rounded-full ${
                          task.status === 'completed' ? 'bg-primary' : 'bg-accent-violet'
                        }`} 
                      />
                    ))}
                    {day.habitsCount > 0 && (
                      <div 
                        title={`${day.habitsCount} Hábitos logs`}
                        className="w-2 h-2 rounded bg-accent-blue" 
                      />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Goals Checklist (1 Col) */}
        <div className="lg:col-span-1 rounded-2xl glass-panel p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-white/5 pb-3 mb-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-text-primary flex items-center gap-1.5">
                <Target className="w-4 h-4 text-warning" />
                <span>Objetivos del Mes</span>
              </h3>
              <button
                onClick={() => setShowGoalForm(!showGoalForm)}
                className="p-1 rounded bg-white/5 text-text-secondary hover:text-text-primary transition-all"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            {/* Inline Goal Form */}
            {showGoalForm && (
              <form onSubmit={handleCreateGoalSubmit} className="mb-4 bg-black/40 p-3 rounded-xl border border-white/5 space-y-2">
                <input
                  type="text"
                  required
                  value={newGoalTitle}
                  onChange={(e) => setNewGoalTitle(e.target.value)}
                  placeholder="Ej: Terminar curso Next.js"
                  className="w-full rounded-lg bg-black/40 border border-white/10 px-3 py-2 text-xs text-text-primary focus:border-primary/50 focus:outline-none"
                />
                <button
                  type="submit"
                  className="w-full rounded-lg bg-primary hover:bg-primary/95 text-black py-1.5 text-xs font-bold transition-all"
                >
                  Fijar Objetivo
                </button>
              </form>
            )}

            <div className="space-y-4">
              {goals.filter(g => g.status === 'in_progress').map((goal) => (
                <div key={goal.id} className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="text-xs font-bold text-text-primary">{goal.title}</h4>
                      <p className="text-[10px] text-text-secondary mt-0.5">{goal.description}</p>
                    </div>
                    <button
                      onClick={() => handleProgressGoal(goal.id, goal.progress)}
                      className="flex-shrink-0 text-[10px] bg-white/5 hover:bg-white/15 px-2 py-1 rounded border border-white/5 transition-all text-text-primary"
                    >
                      +10%
                    </button>
                  </div>

                  {/* Progress Meter */}
                  <div className="space-y-1">
                    <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-warning transition-all duration-500" 
                        style={{ width: `${goal.progress}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-[9px] text-text-secondary/50 font-bold">
                      <span>Progreso</span>
                      <span>{goal.progress}%</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

      {/* Day Planner Modal */}
      {selectedDate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
          <div className="w-full max-w-lg rounded-2xl border border-white/10 bg-[#0d1117]/95 shadow-2xl p-6 relative overflow-hidden flex flex-col max-h-[90vh] text-left">
            
            {/* Ambient Glow */}
            <div className="absolute -top-10 -left-10 w-32 h-32 bg-primary/10 rounded-full blur-[60px]" />
            <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-accent-violet/10 rounded-full blur-[60px]" />

            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-white/5 flex-shrink-0">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center text-primary">
                  <Calendar className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold uppercase tracking-wider text-text-primary">
                    Plan de Día: {(() => {
                      const [y, m, d] = selectedDate.split('-').map(Number);
                      const dateObj = new Date(y, m - 1, d);
                      return dateObj.toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric', month: 'short' });
                    })()}
                  </h3>
                  <p className="text-[10px] text-text-secondary">Gestiona o añade tareas para este día.</p>
                </div>
              </div>
              <button 
                onClick={() => {
                  setSelectedDate(null);
                  setNewTaskTitle('');
                }}
                className="w-8 h-8 rounded-lg hover:bg-white/5 flex items-center justify-center text-text-secondary hover:text-text-primary transition-all cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto py-4 space-y-5 pr-1">
              
              {/* Task list for selected date */}
              <div className="space-y-2">
                <h4 className="text-[10px] font-bold text-text-secondary uppercase tracking-wider">Tareas Programadas</h4>
                {(() => {
                  const dayTasks = tasks.filter(t => t.due_date === selectedDate && t.status !== 'archived');
                  if (dayTasks.length === 0) {
                    return (
                      <div className="text-center py-6 bg-black/20 rounded-xl border border-white/5">
                        <p className="text-xs text-text-secondary italic">No hay tareas programadas para este día.</p>
                      </div>
                    );
                  }
                  return (
                    <div className="space-y-2">
                      {dayTasks.map((task) => (
                        <div 
                          key={task.id} 
                          className="flex items-center justify-between p-3 bg-black/30 rounded-xl border border-white/5 hover:border-white/10 transition-all"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <button
                              onClick={() => {
                                if (task.status === 'completed') {
                                  uncompleteTask(task.id);
                                } else {
                                  completeTask(task.id);
                                }
                              }}
                              className={`w-5 h-5 rounded-full border flex items-center justify-center transition-all ${
                                task.status === 'completed' 
                                  ? 'bg-primary border-primary text-black' 
                                  : 'border-white/20 hover:border-primary/50'
                              }`}
                            >
                              {task.status === 'completed' && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                            </button>
                            <span className={`text-xs font-medium text-text-primary truncate ${task.status === 'completed' ? 'line-through opacity-50' : ''}`}>
                              {task.title}
                            </span>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <span className={`text-[8px] font-extrabold uppercase px-1.5 py-0.5 rounded ${
                              task.priority === 'high' ? 'bg-danger/10 text-danger border border-danger/20' :
                              task.priority === 'medium' ? 'bg-warning/10 text-warning border border-warning/20' :
                              'bg-accent-blue/10 text-accent-blue border border-accent-blue/20'
                            }`}>
                              {task.priority === 'high' ? 'Alta' : task.priority === 'medium' ? 'Media' : 'Baja'}
                            </span>
                            <button
                              onClick={() => deleteTask(task.id)}
                              className="p-1.5 rounded hover:bg-danger/20 text-text-secondary hover:text-danger transition-all cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  );
                })()}
              </div>

              {/* Add task form for selected date */}
              <div className="border-t border-white/5 pt-4 space-y-4">
                <h4 className="text-[10px] font-bold text-primary uppercase tracking-wider flex items-center gap-1.5">
                  <Plus className="w-3.5 h-3.5 text-primary" />
                  <span>Añadir Tarea para este Día</span>
                </h4>

                <form 
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (!newTaskTitle.trim()) return;
                    
                    addTask({
                      title: newTaskTitle.trim(),
                      description: 'Tarea programada desde calendario mensual',
                      status: 'pending',
                      priority: newTaskPriority,
                      category: newTaskCategory,
                      project_id: null,
                      due_date: selectedDate,
                      due_time: newTaskTime || null,
                      duration_minutes: newTaskDuration,
                      energy_level: newTaskPriority,
                      is_recurring: false,
                      recurrence_rule: null,
                      reminder_at: null,
                      completed_at: null
                    });

                    triggerNotification(
                      'TAREA PROGRAMADA',
                      `"${newTaskTitle.trim()}" agregada con éxito`,
                      'success'
                    );

                    setNewTaskTitle('');
                  }}
                  className="space-y-3"
                >
                  <div className="space-y-1">
                    <input
                      type="text"
                      required
                      value={newTaskTitle}
                      onChange={(e) => setNewTaskTitle(e.target.value)}
                      placeholder="¿Qué planificas para este día?"
                      className="w-full rounded-xl bg-black/40 border border-white/10 px-3 py-2.5 text-xs text-text-primary focus:border-primary/50 focus:outline-none transition-all placeholder:text-text-secondary/30"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="block text-[9px] font-bold text-text-secondary uppercase">Prioridad</label>
                      <select
                        value={newTaskPriority}
                        onChange={(e) => setNewTaskPriority(e.target.value as Priority)}
                        className="w-full rounded-xl bg-black/40 border border-white/10 px-3 py-2 text-xs text-text-primary focus:border-primary/50 focus:outline-none"
                      >
                        <option value="low">Baja (Mínima Energía)</option>
                        <option value="medium">Media (Energía Normal)</option>
                        <option value="high">Alta (Enfoque Total)</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="block text-[9px] font-bold text-text-secondary uppercase">Categoría</label>
                      <select
                        value={newTaskCategory}
                        onChange={(e) => setNewTaskCategory(e.target.value as TaskCategory)}
                        className="w-full rounded-xl bg-black/40 border border-white/10 px-3 py-2 text-xs text-text-primary focus:border-primary/50 focus:outline-none"
                      >
                        <option value="trabajo">Trabajo</option>
                        <option value="personal">Personal</option>
                        <option value="salud">Salud</option>
                        <option value="estudio">Estudios</option>
                        <option value="proyecto">Proyecto</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="block text-[9px] font-bold text-text-secondary uppercase">Duración</label>
                      <select
                        value={newTaskDuration}
                        onChange={(e) => setNewTaskDuration(Number(e.target.value))}
                        className="w-full rounded-xl bg-black/40 border border-white/10 px-3 py-2 text-xs text-text-primary focus:border-primary/50 focus:outline-none"
                      >
                        <option value={15}>15 minutos</option>
                        <option value={30}>30 minutos</option>
                        <option value={60}>1 hora</option>
                        <option value={90}>1.5 horas</option>
                        <option value={120}>2 horas</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="block text-[9px] font-bold text-text-secondary uppercase">Hora (Opcional)</label>
                      <input
                        type="time"
                        value={newTaskTime}
                        onChange={(e) => setNewTaskTime(e.target.value)}
                        className="w-full rounded-xl bg-black/40 border border-white/10 px-3 py-2 text-xs text-text-primary focus:border-primary/50 focus:outline-none"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full rounded-xl bg-primary hover:bg-primary/95 text-black py-2.5 text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-md shadow-primary/10 cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Añadir Tarea</span>
                  </button>
                </form>
              </div>

            </div>

          </div>
        </div>
      )}

    </div>
  );
}
