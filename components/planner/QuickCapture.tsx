// QuickCapture - FlowPlanner Smart NLP Capturing Modal
// Developed by Arcano Intelligence

'use client';

import React, { useState, useEffect } from 'react';
import { useFlowStore } from '../../store/flowStore';
import { TaskCategory } from '../../types';
import { toLocalDateStr } from '../../lib/dateUtils';
import { 
  X, Sparkles, Send, Calendar, Clock, Tag, 
  Lightbulb, Zap, Award
} from 'lucide-react';

interface QuickCaptureProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function QuickCapture({ isOpen, onClose }: QuickCaptureProps) {
  const [input, setInput] = useState('');

  // Editable parsed states
  const [parsedTitle, setParsedTitle] = useState('');
  const [parsedDate, setParsedDate] = useState(toLocalDateStr(new Date()));
  const [parsedTime, setParsedTime] = useState('09:00');
  const [parsedDuration, setParsedDuration] = useState(60);
  const [parsedTag, setParsedTag] = useState('trabajo');

  // Track manual overrides
  const [userOverrides, setUserOverrides] = useState<{
    title?: boolean;
    date?: boolean;
    time?: boolean;
    duration?: boolean;
    tag?: boolean;
  }>({});

  const addTask = useFlowStore((state) => state.addTask);
  const addXP = useFlowStore((state) => state.addXP);
  const triggerNotification = useFlowStore((state) => state.triggerNotification);

  // Sync NLP engine in real-time
  useEffect(() => {
    if (!input.trim()) {
      if (!userOverrides.title) setParsedTitle('');
      if (!userOverrides.date) setParsedDate(toLocalDateStr(new Date()));
      if (!userOverrides.time) setParsedTime('09:00');
      if (!userOverrides.duration) setParsedDuration(60);
      if (!userOverrides.tag) setParsedTag('trabajo');
      return;
    }

    const text = input.toLowerCase();
    let title = input;

    // Date parsing
    let targetDate = toLocalDateStr(new Date());
    if (text.includes('mañana')) {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      targetDate = toLocalDateStr(tomorrow);
      title = title.replace(/mañana/gi, '');
    } else if (text.includes('hoy')) {
      targetDate = toLocalDateStr(new Date());
      title = title.replace(/hoy/gi, '');
    }

    // Time parsing
    let startTime = '09:00';
    const timeMatch = text.match(/a las\s*(\d{1,2})(?::(\d{2}))?\s*(am|pm)?/i);
    if (timeMatch) {
      let hours = parseInt(timeMatch[1], 10);
      const minutes = timeMatch[2] ? parseInt(timeMatch[2], 10) : 0;
      const ampm = timeMatch[3];

      if (ampm && ampm.toLowerCase() === 'pm' && hours < 12) {
        hours += 12;
      } else if (ampm && ampm.toLowerCase() === 'am' && hours === 12) {
        hours = 0;
      }

      const formattedHours = hours.toString().padStart(2, '0');
      const formattedMinutes = minutes.toString().padStart(2, '0');
      startTime = `${formattedHours}:${formattedMinutes}`;
      title = title.replace(timeMatch[0], '');
    }

    // Duration parsing
    let duration = 60;
    const durationMinMatch = text.match(/de\s*(\d+)\s*minutos/i);
    const durationHourMatch = text.match(/de\s*(\d+)\s*hora/i);
    
    if (durationMinMatch) {
      duration = parseInt(durationMinMatch[1], 10);
      title = title.replace(durationMinMatch[0], '');
    } else if (durationHourMatch) {
      duration = parseInt(durationHourMatch[1], 10) * 60;
      title = title.replace(durationHourMatch[0], '');
    }

    // Tag parsing
    let tag = 'trabajo';
    const tagMatch = text.match(/#(\w+)/);
    if (tagMatch) {
      const parsedTagMatch = tagMatch[1];
      if (['trabajo', 'personal', 'salud', 'estudios'].includes(parsedTagMatch)) {
        tag = parsedTagMatch;
      }
      title = title.replace(tagMatch[0], '');
    }

    // Clean up extra whitespaces
    title = title.replace(/\s+/g, ' ').trim();
    if (!title) title = 'Nueva Tarea Flow';

    if (!userOverrides.title) setParsedTitle(title);
    if (!userOverrides.date) setParsedDate(targetDate);
    if (!userOverrides.time) setParsedTime(startTime);
    if (!userOverrides.duration) setParsedDuration(duration);
    if (!userOverrides.tag) setParsedTag(tag);
  }, [input, userOverrides]);

  if (!isOpen) return null;

  const handleClose = () => {
    setInput('');
    setParsedTitle('');
    setParsedDate(toLocalDateStr(new Date()));
    setParsedTime('09:00');
    setParsedDuration(60);
    setParsedTag('trabajo');
    setUserOverrides({});
    onClose();
  };

  const handleFieldChange = (field: string, value: any) => {
    setUserOverrides(prev => ({ ...prev, [field]: true }));
    if (field === 'title') setParsedTitle(value);
    if (field === 'date') setParsedDate(value);
    if (field === 'time') setParsedTime(value);
    if (field === 'duration') setParsedDuration(Number(value));
    if (field === 'tag') setParsedTag(value);
  };

  const handleQuickSave = () => {
    if (!input.trim() || !parsedTitle.trim()) return;

    // Map tag to TaskCategory
    let category: TaskCategory = 'trabajo';
    if (parsedTag === 'personal') category = 'personal';
    else if (parsedTag === 'salud') category = 'salud';
    else if (parsedTag === 'estudios') category = 'estudio';

    // 1. Create matching task
    const newTaskId = addTask({
      title: parsedTitle.trim(),
      description: 'Capturado de forma rápida vía FlowNLP',
      status: 'pending',
      priority: parsedDuration >= 90 ? 'high' : parsedDuration >= 45 ? 'medium' : 'low',
      category,
      project_id: null,
      due_date: parsedDate,
      due_time: parsedTime,
      duration_minutes: parsedDuration,
      energy_level: parsedDuration >= 90 ? 'high' : parsedDuration >= 45 ? 'medium' : 'low',
      is_recurring: false,
      recurrence_rule: null,
      reminder_at: null,
      completed_at: null
    });

    // 2. Award NLP Smart XP
    addXP(50, 'Smart NLP Quick Capture used', 'plan_created', newTaskId);

    // 3. Trigger celebration
    triggerNotification('PROCESADO POR IA', `"${parsedTitle.trim()}" agregado a tu agenda. (+50 XP)`, 'success');

    handleClose();
  };

  const handleSuggestionClick = (text: string) => {
    setUserOverrides({});
    setInput(text);
  };

  const showPreview = input.trim().length > 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
      <div className="flex flex-col max-h-[90vh] w-full max-w-lg rounded-2xl border border-white/10 bg-[#0d1117] shadow-2xl p-6 relative overflow-hidden">
        
        {/* Glow */}
        <div className="absolute -top-10 -left-10 w-32 h-32 bg-primary/10 rounded-full blur-[60px] pointer-events-none" />

        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/5 flex-shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center text-primary">
              <Sparkles className="w-4 h-4 animate-pulse" />
            </div>
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-text-primary">Captura Inteligente Flow</h3>
              <p className="text-[10px] text-text-secondary">Escribe usando lenguaje natural en segundos.</p>
            </div>
          </div>
          <button 
            onClick={handleClose}
            className="w-8 h-8 rounded-lg hover:bg-white/5 flex items-center justify-center text-text-secondary hover:text-text-primary transition-all cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="mt-4 space-y-4 flex-1 overflow-y-auto pr-1">
          <div className="relative">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ej. Reunión de marketing mañana a las 3:30 pm de 2 horas #trabajo..."
              className="w-full h-24 rounded-xl bg-black/40 border border-white/10 p-4 text-xs text-text-primary focus:border-primary/50 focus:outline-none transition-all resize-none leading-relaxed"
            />
            
            <button
              onClick={handleQuickSave}
              disabled={!input.trim()}
              className="absolute bottom-3 right-3 flex items-center justify-center w-8 h-8 rounded-lg bg-primary hover:bg-primary/95 text-black disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>

          {/* Quick NLP Chips/Suggestions */}
          <div className="space-y-1.5 text-left">
            <h4 className="text-[10px] font-bold text-text-secondary uppercase tracking-wider flex items-center gap-1">
              <Lightbulb className="w-3.5 h-3.5 text-accent-yellow" />
              <span>Sugerencias de Entrada NLP:</span>
            </h4>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => handleSuggestionClick('Entrenamiento funcional hoy a las 7:00 am de 45 minutos #salud')}
                className="text-[9px] bg-white/5 hover:bg-white/10 border border-white/5 text-text-secondary px-2.5 py-1.5 rounded-lg transition-all cursor-pointer text-left"
              >
                Gimnasio hoy
              </button>
              <button
                onClick={() => handleSuggestionClick('Reunión quincenal mañana a las 10:00 am de 1 hora #trabajo')}
                className="text-[9px] bg-white/5 hover:bg-white/10 border border-white/5 text-text-secondary px-2.5 py-1.5 rounded-lg transition-all cursor-pointer text-left"
              >
                Reunión mañana
              </button>
              <button
                onClick={() => handleSuggestionClick('Meditar de 15 minutos #personal')}
                className="text-[9px] bg-white/5 hover:bg-white/10 border border-white/5 text-text-secondary px-2.5 py-1.5 rounded-lg transition-all cursor-pointer text-left"
              >
                Bloque meditar
              </button>
            </div>
          </div>

          {/* Real-time NLP parsing engine preview panel */}
          {showPreview && (
            <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 space-y-4 text-left">
              <h4 className="text-[10px] font-bold text-primary uppercase tracking-wider flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 animate-pulse" />
                <span>Vista Previa del Motor FlowNLP (Editable)</span>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs leading-relaxed">
                <div className="sm:col-span-2">
                  <label className="text-[10px] text-text-secondary block font-semibold mb-1">Título del Bloque</label>
                  <input
                    type="text"
                    value={parsedTitle}
                    onChange={(e) => handleFieldChange('title', e.target.value)}
                    className="w-full rounded-lg bg-black/40 border border-white/10 px-3 py-2 text-xs text-text-primary focus:border-primary/50 focus:outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="text-[10px] text-text-secondary block font-semibold mb-1">Fecha Prevista</label>
                  <div className="relative flex items-center">
                    <Calendar className="absolute left-2.5 w-3.5 h-3.5 text-accent-blue pointer-events-none" />
                    <input
                      type="date"
                      value={parsedDate}
                      onChange={(e) => handleFieldChange('date', e.target.value)}
                      className="w-full rounded-lg bg-black/40 border border-white/10 pl-8 pr-3 py-2 text-xs text-text-primary focus:border-primary/50 focus:outline-none transition-all cursor-pointer scheme-dark"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] text-text-secondary block font-semibold mb-1">Hora de Inicio</label>
                  <div className="relative flex items-center">
                    <Clock className="absolute left-2.5 w-3.5 h-3.5 text-accent-green pointer-events-none" />
                    <input
                      type="time"
                      value={parsedTime}
                      onChange={(e) => handleFieldChange('time', e.target.value)}
                      className="w-full rounded-lg bg-black/40 border border-white/10 pl-8 pr-3 py-2 text-xs text-text-primary focus:border-primary/50 focus:outline-none transition-all cursor-pointer scheme-dark"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] text-text-secondary block font-semibold mb-1">Duración (minutos)</label>
                  <div className="relative flex items-center">
                    <Clock className="absolute left-2.5 w-3.5 h-3.5 text-accent-blue pointer-events-none" />
                    <input
                      type="number"
                      min="5"
                      max="1440"
                      value={parsedDuration}
                      onChange={(e) => handleFieldChange('duration', e.target.value)}
                      className="w-full rounded-lg bg-black/40 border border-white/10 pl-8 pr-3 py-2 text-xs text-text-primary focus:border-primary/50 focus:outline-none transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] text-text-secondary block font-semibold mb-1">Categoría</label>
                  <div className="relative flex items-center">
                    <Tag className="absolute left-2.5 w-3.5 h-3.5 text-accent-violet pointer-events-none" />
                    <select
                      value={parsedTag}
                      onChange={(e) => handleFieldChange('tag', e.target.value)}
                      className="w-full rounded-lg bg-black/40 border border-white/10 pl-8 pr-3 py-2 text-xs text-text-primary focus:border-primary/50 focus:outline-none transition-all cursor-pointer appearance-none"
                    >
                      <option value="trabajo">Trabajo</option>
                      <option value="personal">Personal</option>
                      <option value="salud">Salud</option>
                      <option value="estudios">Estudios</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-white/5 flex justify-between items-center text-[10px] text-text-secondary/70">
                <span className="flex items-center gap-1">
                  <Award className="w-3.5 h-3.5 text-primary" />
                  <span>Recompensa de Uso:</span>
                </span>
                <span className="font-extrabold text-primary">+50 XP Smart Engine</span>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
