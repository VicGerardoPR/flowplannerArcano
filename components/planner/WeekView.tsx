// WeekView - FlowPlanner Weekly Balance Dashboard
// Developed by Arcano Intelligence

'use client';

import React, { useState } from 'react';
import { useFlowStore } from '../../store/flowStore';
import { 
  Calendar, Clock, Zap, ArrowLeft, ArrowRight, Sparkles, 
  Check, Archive, AlertTriangle, Layers, ListTodo, X, Trash2, CheckSquare, Plus
} from 'lucide-react';
import { toLocalDateStr } from '../../lib/dateUtils';
import { Priority, TaskCategory } from '../../types';

export default function WeekView() {
  const tasks = useFlowStore((state) => state.tasks);
  const projects = useFlowStore((state) => state.projects);
  const aiSuggestions = useFlowStore((state) => state.aiSuggestions);
  const respondToSuggestion = useFlowStore((state) => state.respondToSuggestion);
  const updateTask = useFlowStore((state) => state.updateTask);
  const triggerNotification = useFlowStore((state) => state.triggerNotification);
  const addTask = useFlowStore((state) => state.addTask);
  const deleteTask = useFlowStore((state) => state.deleteTask);
  const completeTask = useFlowStore((state) => state.completeTask);
  const uncompleteTask = useFlowStore((state) => state.uncompleteTask);

  // Focus week offset (0 = current week, 1 = next week, etc.)
  const [weekOffset, setWeekOffset] = useState(0);

  // Day Planner Modal states
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskPriority, setNewTaskPriority] = useState<Priority>('medium');
  const [newTaskCategory, setNewTaskCategory] = useState<TaskCategory>('trabajo');
  const [newTaskDuration, setNewTaskDuration] = useState<number>(60);
  const [newTaskTime, setNewTaskTime] = useState<string>('');

  // Base dates representing the Monday of the active week dynamically relative to today
  const getLocalDate = (offsetDays: number) => {
    const d = new Date();
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Adjust Sunday (0) to Monday (1)
    const monday = new Date(d.setDate(diff));
    monday.setDate(monday.getDate() + offsetDays + weekOffset * 7);
    return monday;
  };

  const getLocalDateStr = (offsetDays: number) => {
    const d = getLocalDate(offsetDays);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Generate 7-day array
  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const date = getLocalDate(i);
    const dateStr = getLocalDateStr(i);
    const dayTasks = tasks.filter(t => t.due_date === dateStr && t.status !== 'archived');
    const dayCompleted = dayTasks.filter(t => t.status === 'completed');
    
    // Calculate total planned minutes
    const totalMinutes = dayTasks.reduce((sum, t) => sum + (t.duration_minutes || 30), 0);
    const estimatedHours = Math.round((totalMinutes / 60) * 10) / 10;

    // Calculate energy level sum (High = 3, Medium = 2, Low = 1)
    const energyScore = dayTasks.reduce((sum, t) => {
      if (t.priority === 'high') return sum + 3;
      if (t.priority === 'medium') return sum + 2;
      return sum + 1;
    }, 0);

    return {
      date,
      dateStr,
      dayTasks,
      dayCompleted,
      estimatedHours,
      energyScore,
      labelName: date.toLocaleDateString('es-ES', { weekday: 'short' }),
      labelDate: date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })
    };
  });

  const activeSuggestion = aiSuggestions.find(s => s.status === 'pending');

  const handleReschedule = (taskId: string, offset: number) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;
    
    const currentDate = new Date(task.due_date);
    currentDate.setDate(currentDate.getDate() + offset);
    const newDateStr = toLocalDateStr(currentDate);

    updateTask(taskId, { due_date: newDateStr });
    
    triggerNotification(
      'TAREA REPROGRAMADA',
      `"${task.title}" movida al ${newDateStr}`,
      'success'
    );
  };

  return (
    <div className="space-y-6 pb-24">
      {/* HEADER SECTION */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-text-primary">Estratega Semanal</h2>
          <p className="text-xs text-text-secondary mt-0.5">
            Analiza tu carga de trabajo y mantén un balance óptimo de energía.
          </p>
          <p className="text-[10px] text-primary/80 font-medium mt-1 flex items-center gap-1">
            <span>💡 Consejo Flow: Haz clic en cualquier día de la cuadrícula para ver o añadir tareas.</span>
          </p>
        </div>

        {/* Navigation Buttons */}
        <div className="flex items-center gap-1.5 bg-white/5 border border-white/10 rounded-xl p-1">
          <button
            onClick={() => setWeekOffset(weekOffset - 1)}
            className="p-2 rounded-lg text-text-secondary hover:text-text-primary hover:bg-white/5 transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <span className="text-xs font-bold text-text-primary px-3">
            {weekOffset === 0 ? 'Esta Semana' : weekOffset === 1 ? 'Próxima Semana' : `Semana +${weekOffset}`}
          </span>
          <button
            onClick={() => setWeekOffset(weekOffset + 1)}
            className="p-2 rounded-lg text-text-secondary hover:text-text-primary hover:bg-white/5 transition-all"
          >
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* AI RECOMMENDATION BOX */}
      {activeSuggestion && weekOffset === 0 && (
        <div className="relative overflow-hidden rounded-2xl border border-primary/30 bg-black/60 p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-xl">
          {/* Subtle background glow */}
          <div className="absolute top-0 right-0 w-24 h-24 bg-primary/10 rounded-full blur-xl pointer-events-none" />
          
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-2xl bg-primary/15 border border-primary/20 text-primary mt-0.5">
              <Sparkles className="w-6 h-6 animate-pulse" />
            </div>
            <div className="space-y-1">
              <h4 className="text-sm font-extrabold uppercase tracking-widest text-primary flex items-center gap-1.5">
                <span>Optimización recomendada</span>
                <span className="text-[9px] bg-primary/20 text-primary px-2 py-0.5 rounded-full font-bold">Flow AI</span>
              </h4>
              <p className="text-xs text-text-secondary leading-relaxed max-w-xl">
                {activeSuggestion.content.message}
              </p>
            </div>
          </div>

          <div className="flex-shrink-0 flex gap-2">
            <button
              onClick={() => respondToSuggestion(activeSuggestion.id, 'ignored')}
              className="rounded-lg border border-white/10 hover:border-white/20 text-text-secondary hover:text-text-primary px-4 py-2 text-xs font-bold transition-all"
            >
              Ignorar
            </button>
            <button
              onClick={() => respondToSuggestion(activeSuggestion.id, 'applied')}
              className="flex items-center gap-1.5 rounded-lg bg-primary hover:bg-primary/95 text-black px-4 py-2 text-xs font-extrabold transition-all shadow-md shadow-primary/10"
            >
              <Check className="w-4 h-4" />
              <span>Aplicar Plan</span>
            </button>
          </div>
        </div>
      )}

      {/* WEEK ENERGY & HOURS TRACKER GRID */}
      <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
        {weekDays.map((day, idx) => {
          const todayObj = new Date();
          const todayStr = `${todayObj.getFullYear()}-${String(todayObj.getMonth() + 1).padStart(2, '0')}-${String(todayObj.getDate()).padStart(2, '0')}`;
          const isToday = day.dateStr === todayStr;
          const isOverloaded = day.estimatedHours > 5;
          const isEnergyHeavy = day.energyScore > 8;

          return (
            <div 
              key={idx} 
              onClick={() => setSelectedDate(day.dateStr)}
              className={`rounded-2xl border p-4 flex flex-col justify-between transition-all cursor-pointer hover:border-primary/50 hover:bg-white/5 ${
                isToday 
                  ? 'border-primary bg-primary/5 shadow-lg shadow-primary/5' 
                  : 'border-white/5 bg-black/30 hover:border-white/10'
              }`}
            >
              <div>
                <div className="flex items-center justify-between border-b border-white/5 pb-2 mb-3">
                  <div>
                    <span className={`text-[10px] uppercase font-extrabold block ${isToday ? 'text-primary' : 'text-text-secondary/70'}`}>
                      {day.labelName}
                    </span>
                    <span className="text-sm font-bold text-text-primary">
                      {day.labelDate}
                    </span>
                  </div>
                  {isToday && (
                    <span className="w-2 h-2 rounded-full bg-primary animate-ping" />
                  )}
                </div>

                {/* Day details */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs text-text-secondary">
                    <span className="flex items-center gap-1">
                      <ListTodo className="w-3.5 h-3.5 text-text-secondary/60" />
                      <span>Tareas:</span>
                    </span>
                    <span className="font-bold text-text-primary">
                      {day.dayTasks.length}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs text-text-secondary">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-accent-blue" />
                      <span>Horas est:</span>
                    </span>
                    <span className={`font-bold ${isOverloaded ? 'text-danger' : 'text-text-primary'}`}>
                      {day.estimatedHours}h
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs text-text-secondary">
                    <span className="flex items-center gap-1">
                      <Zap className="w-3.5 h-3.5 text-accent-violet" />
                      <span>Carga Ener:</span>
                    </span>
                    <span className={`font-bold ${isEnergyHeavy ? 'text-warning' : 'text-text-primary'}`}>
                      {day.energyScore}
                    </span>
                  </div>
                </div>
              </div>

              {/* Workload Warning */}
              <div className="mt-4 pt-3 border-t border-white/5">
                {isOverloaded ? (
                  <div className="text-[10px] text-danger font-semibold bg-danger/10 p-1.5 rounded text-center flex items-center justify-center gap-1">
                    <AlertTriangle className="w-3 h-3" />
                    <span>Saturado</span>
                  </div>
                ) : day.dayTasks.length > 0 ? (
                  <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-primary transition-all duration-500" 
                      style={{ width: `${(day.dayCompleted.length / day.dayTasks.length) * 100}%` }}
                    />
                  </div>
                ) : (
                  <div className="text-[10px] text-text-secondary/40 text-center italic">Vacío</div>
                )}
              </div>

            </div>
          );
        })}
      </div>

      {/* WEEKLY TASKS MASTER DETAILS */}
      <div className="rounded-2xl glass-panel p-6">
        <h3 className="text-sm font-bold uppercase tracking-wider text-text-primary border-b border-white/5 pb-4 mb-4 flex items-center gap-1.5">
          <Calendar className="w-4 h-4 text-primary" />
          <span>Distribución y Redistribución de Tareas</span>
        </h3>

        <div className="space-y-4">
          {weekDays.map((day, dIdx) => {
            if (day.dayTasks.length === 0) return null;
            return (
              <div key={dIdx} className="space-y-2 border-b border-white/5 pb-4 last:border-0 last:pb-0">
                <h4 className="text-xs font-bold text-text-primary flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-accent-violet" />
                  <span className="capitalize">{day.date.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'short' })}</span>
                  <span className="text-[10px] text-text-secondary/50 font-normal">({day.dayTasks.length} tareas)</span>
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {day.dayTasks.map((task) => {
                    const project = projects.find(p => p.id === task.project_id);
                    return (
                      <div 
                        key={task.id} 
                        className={`flex items-center justify-between p-3 bg-black/25 rounded-xl border border-white/5 hover:border-white/10 transition-all ${
                          task.status === 'completed' ? 'opacity-50' : ''
                        }`}
                      >
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className={`text-xs font-bold text-text-primary ${task.status === 'completed' ? 'line-through' : ''}`}>
                              {task.title}
                            </span>
                            {project && (
                              <span 
                                className="text-[9px] font-semibold px-1 rounded"
                                style={{ backgroundColor: `${project.color}15`, color: project.color }}
                              >
                                {project.name.split(' ')[1] || project.name}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2 text-[10px] text-text-secondary mt-1">
                            {task.due_time && <span>Hora: {task.due_time}</span>}
                            <span>Prioridad: <span className="capitalize font-medium">{task.priority}</span></span>
                          </div>
                        </div>

                        {/* Quick Rescheduling control triggers */}
                        {task.status !== 'completed' && (
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => handleReschedule(task.id, -1)}
                              title="Posponer -1 día"
                              className="p-1.5 rounded bg-white/5 text-text-secondary hover:text-text-primary transition-all text-[10px] font-bold"
                            >
                              -1d
                            </button>
                            <button
                              onClick={() => handleReschedule(task.id, 1)}
                              title="Posponer +1 día"
                              className="p-1.5 rounded bg-white/5 text-text-secondary hover:text-text-primary transition-all text-[10px] font-bold"
                            >
                              +1d
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
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
                          className="flex items-center justify-between p-3 bg-black/30 rounded-xl border border-white/5 hover:border-white/10 transition-all shadow-sm"
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
                      description: 'Tarea programada desde estratega semanal',
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
