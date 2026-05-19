// QuickCapture - FlowPlanner Smart NLP Capturing Modal
// Developed by Arcano Intelligence

'use client';

import React, { useState, useEffect } from 'react';
import { useFlowStore } from '../../store/flowStore';
import { TaskCategory } from '../../types';
import { 
  X, Sparkles, Send, Calendar, Clock, Tag, 
  HelpCircle, Lightbulb, Zap, Award
} from 'lucide-react';

interface QuickCaptureProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function QuickCapture({ isOpen, onClose }: QuickCaptureProps) {
  const [input, setInput] = useState('');
  const [parsedPreview, setParsedPreview] = useState<{
    title: string;
    date: string;
    startTime: string;
    duration: number;
    tag: string;
  } | null>(null);

  const addTask = useFlowStore((state) => state.addTask);
  const addXP = useFlowStore((state) => state.addXP);
  const triggerNotification = useFlowStore((state) => state.triggerNotification);

  // Helper to parse dates
  const formatDateString = (date: Date) => {
    return date.toISOString().split('T')[0];
  };

  // Perform light NLP regex parsing
  useEffect(() => {
    if (!input.trim()) {
      setParsedPreview(null);
      return;
    }

    const text = input.toLowerCase();
    
    // 1. Title (everything except date, time, duration, and tags)
    let title = input;

    // 2. Date parsing
    let targetDate = formatDateString(new Date()); // default is today
    if (text.includes('mañana')) {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      targetDate = formatDateString(tomorrow);
      title = title.replace(/mañana/gi, '');
    } else if (text.includes('hoy')) {
      targetDate = formatDateString(new Date());
      title = title.replace(/hoy/gi, '');
    }

    // 3. Time parsing (e.g. "a las 3:00pm", "a las 15:30", "a las 3pm")
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

    // 4. Duration parsing (e.g. "de 2 horas", "de 45 minutos", "de 1 hora")
    let duration = 60; // default to 60 mins
    const durationMinMatch = text.match(/de\s*(\d+)\s*minutos/i);
    const durationHourMatch = text.match(/de\s*(\d+)\s*hora/i);
    
    if (durationMinMatch) {
      duration = parseInt(durationMinMatch[1], 10);
      title = title.replace(durationMinMatch[0], '');
    } else if (durationHourMatch) {
      duration = parseInt(durationHourMatch[1], 10) * 60;
      title = title.replace(durationHourMatch[0], '');
    }

    // 5. Tag parsing (e.g. #trabajo, #personal, #salud, #estudios)
    let tag = 'trabajo';
    const tagMatch = text.match(/#(\w+)/);
    if (tagMatch) {
      const parsedTag = tagMatch[1];
      if (['trabajo', 'personal', 'salud', 'estudios'].includes(parsedTag)) {
        tag = parsedTag;
      }
      title = title.replace(tagMatch[0], '');
    }

    // Clean up extra whitespaces
    title = title.replace(/\s+/g, ' ').trim();
    if (!title) title = 'Nueva Tarea Flow';

    setParsedPreview({
      title,
      date: targetDate,
      startTime,
      duration,
      tag
    });

  }, [input]);

  if (!isOpen) return null;

  const handleQuickSave = () => {
    if (!input.trim() || !parsedPreview) return;

    // Map tag to TaskCategory
    let category: TaskCategory = 'trabajo';
    if (parsedPreview.tag === 'personal') category = 'personal';
    else if (parsedPreview.tag === 'salud') category = 'salud';
    else if (parsedPreview.tag === 'estudios') category = 'estudio';

    // 1. Create matching task
    const newTaskId = addTask({
      title: parsedPreview.title,
      description: 'Capturado de forma rápida vía FlowNLP',
      status: 'pending',
      priority: parsedPreview.duration >= 90 ? 'high' : parsedPreview.duration >= 45 ? 'medium' : 'low',
      category,
      project_id: null,
      due_date: parsedPreview.date,
      due_time: parsedPreview.startTime,
      duration_minutes: parsedPreview.duration,
      energy_level: parsedPreview.duration >= 90 ? 'high' : parsedPreview.duration >= 45 ? 'medium' : 'low',
      is_recurring: false,
      recurrence_rule: null,
      reminder_at: null,
      completed_at: null
    });

    // 2. Award NLP Smart XP
    addXP(50, 'Smart NLP Quick Capture used', 'plan_created', newTaskId);

    // 3. Trigger celebration
    triggerNotification('PROCESADO POR IA', `"${parsedPreview.title}" agregado a tu agenda. (+50 XP)`, 'success');

    setInput('');
    onClose();
  };

  const handleSuggestionClick = (text: string) => {
    setInput(text);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
      <div className="w-full max-w-lg rounded-2xl border border-white/10 bg-[#0d1117] shadow-2xl p-6 relative overflow-hidden">
        
        {/* Glow */}
        <div className="absolute -top-10 -left-10 w-32 h-32 bg-primary/10 rounded-full blur-[60px]" />

        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/5">
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
            onClick={onClose}
            className="w-8 h-8 rounded-lg hover:bg-white/5 flex items-center justify-center text-text-secondary hover:text-text-primary transition-all cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* NLP Text Area */}
        <div className="mt-4 space-y-4">
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
                className="text-[9px] bg-white/5 hover:bg-white/10 border border-white/5 text-text-secondary px-2.5 py-1.5 rounded-lg transition-all cursor-pointer"
              >
                Gimnasio hoy
              </button>
              <button
                onClick={() => handleSuggestionClick('Reunión quincenal mañana a las 10:00 am de 1 hora #trabajo')}
                className="text-[9px] bg-white/5 hover:bg-white/10 border border-white/5 text-text-secondary px-2.5 py-1.5 rounded-lg transition-all cursor-pointer"
              >
                Reunión mañana
              </button>
              <button
                onClick={() => handleSuggestionClick('Meditar de 15 minutos #personal')}
                className="text-[9px] bg-white/5 hover:bg-white/10 border border-white/5 text-text-secondary px-2.5 py-1.5 rounded-lg transition-all cursor-pointer"
              >
                Bloque meditar
              </button>
            </div>
          </div>

          {/* Real-time NLP parsing engine preview panel */}
          {parsedPreview && (
            <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 space-y-3 text-left">
              <h4 className="text-[10px] font-bold text-primary uppercase tracking-wider flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 animate-pulse" />
                <span>Vista Previa del Motor FlowNLP</span>
              </h4>

              <div className="grid grid-cols-2 gap-3 text-[10px] leading-relaxed">
                <div>
                  <span className="text-text-secondary block">Título del Bloque:</span>
                  <span className="font-semibold text-text-primary truncate block">{parsedPreview.title}</span>
                </div>
                <div>
                  <span className="text-text-secondary block">Fecha Prevista:</span>
                  <span className="font-semibold text-text-primary flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-accent-blue" />
                    <span>{parsedPreview.date}</span>
                  </span>
                </div>
                <div>
                  <span className="text-text-secondary block">Hora de Inicio:</span>
                  <span className="font-semibold text-text-primary flex items-center gap-1">
                    <Clock className="w-3 h-3 text-accent-green" />
                    <span>{parsedPreview.startTime}</span>
                  </span>
                </div>
                <div>
                  <span className="text-text-secondary block">Duración & Tag:</span>
                  <span className="font-semibold text-text-primary flex items-center gap-1.5">
                    <Tag className="w-3 h-3 text-accent-violet" />
                    <span>{parsedPreview.duration} min ({parsedPreview.tag})</span>
                  </span>
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
