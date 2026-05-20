// TodayView - FlowPlanner Main Dashboard
// Developed by Arcano Intelligence

'use client';

import React, { useState } from 'react';
import { useFlowStore } from '../../store/flowStore';
import { Task, Mood } from '../../types';
import { 
  Flame, CheckCircle, Clock, AlertTriangle, CheckSquare, 
  Trash2, Brain, Compass, Smile, 
  Layers, ChevronDown, ChevronUp, Archive, Calendar
} from 'lucide-react';

export default function TodayView() {
  // Store States
  const tasks = useFlowStore((state) => state.tasks);
  const subtasks = useFlowStore((state) => state.subtasks);
  const projects = useFlowStore((state) => state.projects);
  const habits = useFlowStore((state) => state.habits);
  const habitLogs = useFlowStore((state) => state.habitLogs);
  const dailyNotes = useFlowStore((state) => state.dailyNotes);
  const profile = useFlowStore((state) => state.profile);

  // Store Actions
  const completeTask = useFlowStore((state) => state.completeTask);
  const uncompleteTask = useFlowStore((state) => state.uncompleteTask);
  const deleteTask = useFlowStore((state) => state.deleteTask);
  const addSubtask = useFlowStore((state) => state.addSubtask);
  const toggleSubtask = useFlowStore((state) => state.toggleSubtask);
  const deleteSubtask = useFlowStore((state) => state.deleteSubtask);
  const toggleHabit = useFlowStore((state) => state.toggleHabit);
  const saveDailyNote = useFlowStore((state) => state.saveDailyNote);
  const reschedulePendingTasks = useFlowStore((state) => state.reschedulePendingTasks);
  const archivePendingTasks = useFlowStore((state) => state.archivePendingTasks);
  const addTask = useFlowStore((state) => state.addTask);
  const updateTask = useFlowStore((state) => state.updateTask);

  // Local Relative Date constant
  const todayDate = new Date();
  const todayStr = `${todayDate.getFullYear()}-${String(todayDate.getMonth() + 1).padStart(2, '0')}-${String(todayDate.getDate()).padStart(2, '0')}`;
  
  const tomorrowDate = new Date();
  tomorrowDate.setDate(todayDate.getDate() + 1);
  const tomorrowStr = `${tomorrowDate.getFullYear()}-${String(tomorrowDate.getMonth() + 1).padStart(2, '0')}-${String(tomorrowDate.getDate()).padStart(2, '0')}`;

  // Overdue and Today's Tasks
  const overdueTasks = tasks.filter(t => t.status === 'pending' && t.due_date < todayStr);
  const todayTasks = tasks.filter(t => t.due_date === todayStr && t.status !== 'archived');
  const todayCompleted = todayTasks.filter(t => t.status === 'completed');
  const completionPercentage = todayTasks.length > 0 
    ? Math.round((todayCompleted.length / todayTasks.length) * 100) 
    : 0;

  // Active note for today
  const todayNote = dailyNotes.find(n => n.note_date === todayStr);

  // Accordion drawer for active task subtasks
  const [expandedTaskId, setExpandedTaskId] = useState<string | null>(null);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');
  
  // Intention Form States
  const [intention, setIntention] = useState(todayNote?.intention || '');
  const [mood, setMood] = useState<string>(todayNote?.mood || 'excelente');
  const [isSavingNote, setIsSavingNote] = useState(false);

  // Hoy Limpio Modal toggle
  const [showHoyLimpioModal, setShowHoyLimpioModal] = useState(false);

  const handleSaveNote = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingNote(true);
    saveDailyNote(todayStr, {
      intention,
      mood: mood as Mood,
      energy_score: mood === 'excelente' ? 9 : mood === 'bueno' ? 8 : mood === 'neutral' ? 6 : 4
    });

    if (intention.trim()) {
      const existingTask = tasks.find(
        (t) => t.due_date === todayStr && t.title.startsWith('Enfoque del día:')
      );

      if (existingTask) {
        updateTask(existingTask.id, {
          title: `Enfoque del día: ${intention.trim()}`,
          description: `Intención diaria registrada: "${intention.trim()}"`,
        });
      } else {
        addTask({
          title: `Enfoque del día: ${intention.trim()}`,
          description: `Intención diaria registrada: "${intention.trim()}"`,
          status: 'pending',
          priority: 'high',
          category: 'personal',
          project_id: null,
          due_date: todayStr,
          due_time: '08:00',
          duration_minutes: 30,
          energy_level: 'high',
          is_recurring: false,
          recurrence_rule: null,
          reminder_at: null,
          completed_at: null,
        });
      }
    }

    setTimeout(() => setIsSavingNote(false), 800);
  };

  const handleToggleTask = (task: Task) => {
    if (task.status === 'completed') {
      uncompleteTask(task.id);
    } else {
      completeTask(task.id);
    }
  };

  const handleAddSubtaskSubmit = (e: React.FormEvent, taskId: string) => {
    e.preventDefault();
    if (!newSubtaskTitle.trim()) return;
    addSubtask(taskId, newSubtaskTitle.trim());
    setNewSubtaskTitle('');
  };

  return (
    <div className="space-y-6 pb-24">
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-text-primary">
            ¡Hola, {profile.full_name}! 👋
          </h2>
          <p className="text-xs text-text-secondary mt-0.5">
            {(() => {
              const label = todayDate.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
              return label.charAt(0).toUpperCase() + label.slice(1);
            })()} • Enfoque del día: <span className="text-primary font-medium">{profile.planning_style === 'ai' || profile.planning_style === 'projects' ? 'Productividad Premium' : 'Flujo Equilibrado'}</span>
          </p>
        </div>

        {/* Level and XP quick indicators */}
        <div className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-xl p-3 max-w-max">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/20 border border-primary/20 text-primary text-sm font-bold">
            {profile.level}
          </div>
          <div>
            <div className="text-[10px] font-semibold text-text-secondary uppercase tracking-wider">Rango Actual</div>
            <div className="text-xs font-bold text-text-primary">
              {profile.xp} XP • {Math.max(0, 500 - (profile.xp % 500))} XP para Nivel {profile.level + 1}
            </div>
          </div>
        </div>
      </div>

      {/* OVERDUE "HOY LIMPIO" ACTION BANNER */}
      {overdueTasks.length > 0 && (
        <div className="rounded-xl border border-warning/30 bg-warning/5 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-pulse">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-warning/20 text-warning mt-0.5">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-text-primary">Sistema Hoy Limpio Activado</h4>
              <p className="text-xs text-text-secondary leading-relaxed mt-0.5">
                Tienes <span className="text-warning font-semibold">{overdueTasks.length} tareas pendientes</span> de días anteriores. Despéjalas para empezar tu día sin ansiedad.
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowHoyLimpioModal(true)}
            className="flex-shrink-0 flex items-center justify-center gap-1.5 rounded-lg bg-warning hover:bg-warning/90 text-black px-4 py-2 text-xs font-bold transition-all shadow-md"
          >
            <span>Despejar Agenda</span>
            <Compass className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* PROGRESS RING & INTENTION ROW */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Ring Card */}
        <div className="md:col-span-1 rounded-2xl glass-panel p-6 flex flex-col items-center justify-center text-center">
          <div className="relative w-36 h-36 flex items-center justify-center">
            {/* SVG Ring Progress */}
            <svg className="w-full h-full transform -rotate-90">
              <circle
                cx="72"
                cy="72"
                r="64"
                stroke="rgba(255,255,255,0.05)"
                strokeWidth="10"
                fill="transparent"
              />
              <circle
                cx="72"
                cy="72"
                r="64"
                stroke="url(#ringGradient)"
                strokeWidth="10"
                strokeDasharray={402}
                strokeDashoffset={402 - (402 * completionPercentage) / 100}
                strokeLinecap="round"
                fill="transparent"
                className="transition-all duration-700 ease-out"
              />
              <defs>
                <linearGradient id="ringGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#00E6A8" />
                  <stop offset="100%" stopColor="#9B5CFF" />
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute flex flex-col items-center">
              <span className="text-3xl font-extrabold text-text-primary">{completionPercentage}%</span>
              <span className="text-[10px] uppercase font-bold tracking-widest text-text-secondary">Progreso</span>
            </div>
          </div>
          <h4 className="text-sm font-bold text-text-primary mt-4">Productividad Diaria</h4>
          <p className="text-xs text-text-secondary mt-1">
            {todayCompleted.length} de {todayTasks.length} tareas completadas hoy
          </p>
        </div>

        {/* Daily Intention & Mood Card */}
        <div className="md:col-span-2 rounded-2xl glass-panel p-6">
          <div className="flex items-center justify-between border-b border-white/5 pb-3 mb-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-text-primary flex items-center gap-1.5">
              <Brain className="w-4 h-4 text-accent-violet" />
              <span>Intención y Estado de Ánimo</span>
            </h3>
            {todayNote && (
              <span className="text-[10px] bg-primary/20 text-primary border border-primary/20 px-2 py-0.5 rounded-full font-bold">
                REGISTRADO
              </span>
            )}
          </div>

          <form onSubmit={handleSaveNote} className="space-y-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-text-secondary">Mi Intención para Hoy</label>
              <textarea
                value={intention}
                onChange={(e) => setIntention(e.target.value)}
                placeholder="Ej: Mantener el enfoque, descansar sin culpa y terminar el store"
                rows={2}
                className="w-full rounded-xl bg-black/30 border border-white/10 p-3 text-sm text-text-primary placeholder:text-text-secondary/30 focus:border-primary/50 focus:outline-none transition-all resize-none"
              />
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="space-y-1.5">
                <span className="block text-xs font-semibold text-text-secondary">¿Cómo te sientes?</span>
                <div className="flex gap-2">
                  {['excelente', 'bueno', 'neutral', 'bajo'].map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setMood(m)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize border transition-all ${
                        mood === m 
                          ? 'bg-accent-violet/20 border-accent-violet text-accent-violet' 
                          : 'bg-black/30 border-white/5 text-text-secondary hover:text-text-primary hover:border-white/10'
                      }`}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                disabled={isSavingNote || !intention.trim()}
                className="w-full sm:w-auto flex items-center justify-center gap-1.5 rounded-lg bg-primary hover:bg-primary/95 px-4 py-2.5 text-xs font-bold text-black transition-colors disabled:bg-primary/20 disabled:text-text-secondary/40"
              >
                {isSavingNote ? 'Registrando...' : 'Registrar'}
              </button>
            </div>
          </form>
        </div>

      </div>

      {/* TODAY'S HABITS SECTION */}
      <div className="rounded-2xl glass-panel p-6">
        <h3 className="text-sm font-bold uppercase tracking-wider text-text-primary mb-4 flex items-center gap-1.5">
          <Flame className="w-4 h-4 text-accent-blue" />
          <span>Rutina de Hábitos Diarios</span>
        </h3>
        
        {habits.length === 0 ? (
          <p className="text-xs text-text-secondary text-center py-4">No tienes hábitos activos creados. ¡Crea uno en Perfil o en Captura Rápida!</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {habits.map((habit) => {
              const isCompleted = habitLogs.some(l => l.habit_id === habit.id && l.log_date === todayStr);
              return (
                <button
                  key={habit.id}
                  onClick={() => toggleHabit(habit.id, todayStr)}
                  className={`flex items-center justify-between p-3.5 rounded-xl border text-left transition-all ${
                    isCompleted 
                      ? 'border-primary/40 bg-primary/5 text-text-primary' 
                      : 'border-white/5 bg-black/20 text-text-secondary hover:border-white/10 hover:bg-black/30'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-8 h-8 rounded-lg flex items-center justify-center"
                      style={{ backgroundColor: `${habit.color}15`, border: `1px solid ${habit.color}30`, color: habit.color }}
                    >
                      <Flame className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-text-primary line-clamp-1">{habit.title}</div>
                      <div className="text-[10px] opacity-60 capitalize mt-0.5">{habit.frequency_type}</div>
                    </div>
                  </div>
                  <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-all ${
                    isCompleted 
                      ? 'bg-primary border-primary text-black' 
                      : 'border-white/20'
                  }`}>
                    {isCompleted && <CheckCircle className="w-3.5 h-3.5 stroke-[3]" />}
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* TODAY'S TASKS LIST */}
      <div className="rounded-2xl glass-panel p-6">
        <div className="flex items-center justify-between border-b border-white/5 pb-4 mb-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-text-primary flex items-center gap-1.5">
            <CheckSquare className="w-4 h-4 text-primary" />
            <span>Lista de Tareas para Hoy</span>
          </h3>
          <span className="text-xs text-text-secondary font-medium">
            {todayTasks.filter(t => t.status === 'completed').length}/{todayTasks.length} Listas
          </span>
        </div>

        {todayTasks.length === 0 ? (
          <div className="text-center py-10">
            <Smile className="w-10 h-10 text-text-secondary/30 mx-auto mb-2" />
            <p className="text-sm font-semibold text-text-secondary">¡Agenda despejada para hoy!</p>
            <p className="text-xs text-text-secondary/60 mt-1">Disfruta el día o captura una nueva tarea con el botón (+)</p>
          </div>
        ) : (
          <div className="space-y-3">
            {todayTasks.map((task) => {
              const project = projects.find(p => p.id === task.project_id);
              const taskSubtasks = subtasks.filter(s => s.task_id === task.id);
              const completedSubtasks = taskSubtasks.filter(s => s.completed);
              const hasSubtasks = taskSubtasks.length > 0;
              const isExpanded = expandedTaskId === task.id;

              return (
                <div 
                  key={task.id} 
                  className={`rounded-xl border transition-all overflow-hidden ${
                    task.status === 'completed'
                      ? 'bg-black/10 border-white/5 opacity-60'
                      : 'bg-black/30 border-white/5 hover:border-white/10'
                  }`}
                >
                  {/* Task Card Body */}
                  <div className="flex items-start justify-between p-4 gap-3">
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <button
                        onClick={() => handleToggleTask(task)}
                        className={`mt-0.5 w-5 h-5 rounded-md border flex items-center justify-center transition-all ${
                          task.status === 'completed'
                            ? 'bg-primary border-primary text-black'
                            : 'border-white/20 hover:border-primary/50'
                        }`}
                      >
                        {task.status === 'completed' && <CheckCircle className="w-4 h-4 stroke-[3]" />}
                      </button>

                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className={`text-sm font-bold text-text-primary ${task.status === 'completed' ? 'line-through opacity-50' : ''}`}>
                            {task.title}
                          </span>
                          
                          {/* Priority and Category Tags */}
                          {task.priority === 'high' && (
                            <span className="flex items-center gap-0.5 text-[9px] font-extrabold uppercase bg-danger/15 text-danger border border-danger/20 px-1.5 py-0.5 rounded-md">
                              Alta
                            </span>
                          )}
                          {project && (
                            <span 
                              className="text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded-md border"
                              style={{ backgroundColor: `${project.color}15`, border: `1px solid ${project.color}30`, color: project.color }}
                            >
                              {project.name.split(' ')[1] || project.name}
                            </span>
                          )}
                        </div>

                        {task.description && (
                          <p className="text-xs text-text-secondary mt-1 line-clamp-2">
                            {task.description}
                          </p>
                        )}

                        <div className="flex items-center gap-3 mt-2 text-[10px] text-text-secondary/60">
                          {task.due_time && (
                            <span className="flex items-center gap-1">
                              <Clock className="w-3.5 h-3.5 text-warning" />
                              <span>{task.due_time}</span>
                            </span>
                          )}
                          {task.duration_minutes && (
                            <span className="flex items-center gap-1">
                              <Clock className="w-3.5 h-3.5 text-accent-blue" />
                              <span>{task.duration_minutes} min</span>
                            </span>
                          )}
                          {hasSubtasks && (
                            <span className="flex items-center gap-1">
                              <Layers className="w-3.5 h-3.5 text-accent-violet" />
                              <span>Subtareas: {completedSubtasks.length}/{taskSubtasks.length}</span>
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => setExpandedTaskId(isExpanded ? null : task.id)}
                        className="p-1 rounded bg-white/5 text-text-secondary hover:text-text-primary transition-all"
                      >
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </button>
                      <button
                        onClick={() => deleteTask(task.id)}
                        className="p-1 rounded bg-white/5 text-text-secondary hover:text-danger transition-all"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Subtask accordion drawer */}
                  {isExpanded && (
                    <div className="border-t border-white/5 bg-black/40 p-4 space-y-3">
                      <div className="text-[10px] font-bold uppercase tracking-wider text-text-secondary">Pasos Requeridos</div>
                      
                      {taskSubtasks.length === 0 ? (
                        <p className="text-xs text-text-secondary/50">No hay subtareas definidas para este paso.</p>
                      ) : (
                        <div className="space-y-2">
                          {taskSubtasks.map((sub) => (
                            <div key={sub.id} className="flex items-center justify-between gap-2 p-1.5 hover:bg-white/5 rounded-md transition-colors">
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => toggleSubtask(sub.id)}
                                  className={`w-4 h-4 rounded border flex items-center justify-center transition-all ${
                                    sub.completed 
                                      ? 'bg-primary border-primary text-black' 
                                      : 'border-white/30'
                                  }`}
                                >
                                  {sub.completed && <CheckCircle className="w-3 h-3 stroke-[3]" />}
                                </button>
                                <span className={`text-xs text-text-primary ${sub.completed ? 'line-through opacity-50' : ''}`}>
                                  {sub.title}
                                </span>
                              </div>
                              <button 
                                onClick={() => deleteSubtask(sub.id)}
                                className="text-text-secondary/40 hover:text-danger transition-colors"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Add Subtask Inline Form */}
                      <form onSubmit={(e) => handleAddSubtaskSubmit(e, task.id)} className="flex gap-2 pt-2 border-t border-white/5">
                        <input
                          type="text"
                          value={newSubtaskTitle}
                          onChange={(e) => setNewSubtaskTitle(e.target.value)}
                          placeholder="Añadir paso..."
                          className="flex-1 rounded-lg bg-black/40 border border-white/10 px-3 py-1.5 text-xs text-text-primary focus:border-primary/50 focus:outline-none"
                        />
                        <button
                          type="submit"
                          className="rounded-lg bg-white/10 hover:bg-white/25 px-3 py-1.5 text-xs font-bold text-text-primary transition-all"
                        >
                          Agregar
                        </button>
                      </form>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* HOY LIMPIO FULL REVIEW OVERLAY MODAL */}
      {showHoyLimpioModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/85 backdrop-blur-sm" onClick={() => setShowHoyLimpioModal(false)} />
          
          <div className="relative w-full max-w-lg overflow-hidden rounded-2xl glass-panel-elevated p-6 text-left shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/5 pb-4 mb-4">
              <div className="flex items-center gap-2">
                <Compass className="w-5 h-5 text-warning animate-spin" />
                <h3 className="text-lg font-bold text-text-primary">Limpiar Agenda Pendiente</h3>
              </div>
              <button 
                onClick={() => setShowHoyLimpioModal(false)}
                className="text-text-secondary hover:text-text-primary transition-colors"
              >
                Cerrar
              </button>
            </div>

            <div className="space-y-4">
              <p className="text-xs text-text-secondary leading-relaxed">
                El sistema <span className="text-primary font-semibold">Hoy Limpio</span> evita la sobrecarga y la frustración. Elige qué hacer con estas tareas pendientes de días anteriores:
              </p>

              {/* Overdue list scrollable preview */}
              <div className="max-h-40 overflow-y-auto space-y-2 pr-1 border border-white/5 rounded-lg p-2 bg-black/25">
                {overdueTasks.map((t) => (
                  <div key={t.id} className="flex justify-between items-center bg-black/30 p-2 rounded-lg border border-white/5">
                    <div className="text-xs font-bold text-text-primary line-clamp-1">{t.title}</div>
                    <div className="text-[10px] text-text-secondary">{t.due_date}</div>
                  </div>
                ))}
              </div>

              {/* Action grid options */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 border-t border-white/5">
                <button
                  onClick={() => {
                    reschedulePendingTasks(overdueTasks.map(t => t.id), todayStr);
                    setShowHoyLimpioModal(false);
                  }}
                  className="flex items-center justify-center gap-2 p-3 rounded-xl border border-primary/20 bg-primary/5 text-primary hover:bg-primary/10 text-xs font-bold transition-all text-left"
                >
                  <Calendar className="w-4 h-4" />
                  <div>
                    <div>Reprogramar a Hoy</div>
                    <div className="text-[9px] opacity-60 font-normal">Mover a la agenda activa</div>
                  </div>
                </button>

                <button
                  onClick={() => {
                    reschedulePendingTasks(overdueTasks.map(t => t.id), tomorrowStr);
                    setShowHoyLimpioModal(false);
                  }}
                  className="flex items-center justify-center gap-2 p-3 rounded-xl border border-accent-blue/20 bg-accent-blue/5 text-accent-blue hover:bg-accent-blue/10 text-xs font-bold transition-all text-left"
                >
                  <Clock className="w-4 h-4" />
                  <div>
                    <div>Mover a Mañana</div>
                    <div className="text-[9px] opacity-60 font-normal">Planificar para el siguiente día</div>
                  </div>
                </button>

                <button
                  onClick={() => {
                    archivePendingTasks(overdueTasks.map(t => t.id));
                    setShowHoyLimpioModal(false);
                  }}
                  className="flex items-center justify-center gap-2 p-3 rounded-xl border border-white/10 bg-black/40 text-text-secondary hover:text-text-primary text-xs font-bold transition-all text-left sm:col-span-2"
                >
                  <Archive className="w-4 h-4" />
                  <div>
                    <div>Archivar a Revisión Posterior</div>
                    <div className="text-[9px] opacity-60 font-normal">Quitar de la agenda para decidir más tarde</div>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

// X inline icon fallback helper
function X(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </svg>
  );
}
