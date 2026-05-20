// WeekView - FlowPlanner Weekly Balance Dashboard
// Developed by Arcano Intelligence

'use client';

import React, { useState } from 'react';
import { useFlowStore } from '../../store/flowStore';
import { 
  Calendar, Clock, Zap, ArrowLeft, ArrowRight, Sparkles, 
  Check, Archive, AlertTriangle, Layers, ListTodo
} from 'lucide-react';

export default function WeekView() {
  const tasks = useFlowStore((state) => state.tasks);
  const projects = useFlowStore((state) => state.projects);
  const aiSuggestions = useFlowStore((state) => state.aiSuggestions);
  const respondToSuggestion = useFlowStore((state) => state.respondToSuggestion);
  const updateTask = useFlowStore((state) => state.updateTask);
  const triggerNotification = useFlowStore((state) => state.triggerNotification);

  // Focus week offset (0 = current week, 1 = next week, etc.)
  const [weekOffset, setWeekOffset] = useState(0);

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
    const newDateStr = currentDate.toISOString().split('T')[0];

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
              className={`rounded-2xl border p-4 flex flex-col justify-between transition-all ${
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

    </div>
  );
}
