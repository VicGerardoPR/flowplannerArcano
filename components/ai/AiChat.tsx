// AiChat - FlowPlanner Conversational Assistant
// Developed by Arcano Intelligence

'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useFlowStore } from '../../store/flowStore';
import { processFlowAiMessage } from '../../lib/ai/flowAi';
import { toLocalDateStr } from '../../lib/dateUtils';
import { 
  Sparkles, Send, Bot, User, 
  Clock, Tag, Check, Calendar 
} from 'lucide-react';

interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  parsedPayload?: {
    type: 'habit' | 'task';
    title: string;
    reminder_time?: string;
    due_date?: string;
    due_time?: string | null;
    priority?: 'low' | 'medium' | 'high';
    category?: 'personal' | 'trabajo' | 'estudio' | 'salud' | 'finanzas' | 'familia' | 'proyecto' | 'otro';
    is_recurring?: boolean;
    recurrence_rule?: string | null;
    duration_minutes?: number;
  } | null;
}

export default function AiChat() {
  const addTask = useFlowStore((state) => state.addTask);
  const addHabit = useFlowStore((state) => state.addHabit);
  const triggerNotification = useFlowStore((state) => state.triggerNotification);

  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>(() => [
    {
      id: 'init',
      sender: 'assistant',
      text: '¡Hola! Soy tu asistente de flujo cognitivo **Flow AI** 🧠. Puedo ayudarte a planificar tu agenda sin fricción. \n\nEscribe algo como: *"Mañana a las 8 entrenar en el gimnasio"* o *"Todos los lunes meditar a las 7"* para agendar al instante.',
      timestamp: new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })
    }
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSend = (textToSend: string) => {
    if (!textToSend.trim()) return;

    // 1. Add user message
    const userMsg: ChatMessage = {
      // eslint-disable-next-line react-hooks/purity
      id: 'user-' + Date.now(),
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })
    };
    
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    // 2. Process through local NLP Brain
    setTimeout(() => {
      const response = processFlowAiMessage(textToSend);
      
      const assistantMsg: ChatMessage = {
        id: 'assistant-' + Date.now(),
        sender: 'assistant',
        text: response.feedback,
        parsedPayload: response.actionPayload,
        timestamp: new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })
      };

      setIsTyping(false);
      setMessages((prev) => [...prev, assistantMsg]);
    }, 1000);
  };

  const handleApplyPayload = (
    msgId: string, 
    payload: {
      type: 'habit' | 'task';
      title: string;
      reminder_time?: string;
      due_date?: string;
      due_time?: string | null;
      priority?: 'low' | 'medium' | 'high';
      category?: 'personal' | 'trabajo' | 'estudio' | 'salud' | 'finanzas' | 'familia' | 'proyecto' | 'otro';
      is_recurring?: boolean;
      recurrence_rule?: string | null;
      duration_minutes?: number;
    }
  ) => {
    if (payload.type === 'habit') {
      addHabit({
        title: payload.title,
        description: 'Creado a través de conversación con Flow AI',
        frequency_type: 'daily',
        target_count: 1,
        period: 'day',
        active_days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
        reminder_time: payload.reminder_time || '08:00',
        color: '#9B5CFF',
        icon: 'Flame'
      });
      triggerNotification('HÁBITO REGISTRADO', `"${payload.title}" agregado con éxito`, 'success');
    } else {
      const taskDueDate = payload.due_date || toLocalDateStr();
      addTask({
        title: payload.title,
        description: 'Creado a través de conversación con Flow AI',
        status: 'pending',
        priority: payload.priority || 'medium',
        category: payload.category || 'personal',
        project_id: null,
        due_date: taskDueDate,
        due_time: payload.due_time || null,
        duration_minutes: payload.duration_minutes || 30,
        energy_level: payload.priority === 'high' ? 'high' : 'medium',
        is_recurring: !!payload.is_recurring,
        recurrence_rule: payload.recurrence_rule || null,
        reminder_at: null,
        completed_at: null
      });
      triggerNotification('TAREA AGENDADA', `"${payload.title}" programada para el ${taskDueDate}`, 'success');
    }

    // Dismiss the suggestion payload card from the message view
    setMessages((prev) => 
      prev.map(m => m.id === msgId ? { ...m, parsedPayload: null } : m)
    );
  };

  const handleIgnorePayload = (msgId: string) => {
    setMessages((prev) => 
      prev.map(m => m.id === msgId ? { ...m, parsedPayload: null } : m)
    );
    triggerNotification('SUGERENCIA IGNORADA', 'La recomendación fue descartada.', 'success');
  };

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] max-h-[800px] rounded-2xl glass-panel overflow-hidden">
      
      {/* Top Banner Header */}
      <div className="flex items-center justify-between border-b border-white/5 bg-white/5 px-6 py-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-primary/20 border border-primary/20 text-primary">
            <Sparkles className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-text-primary">Flow AI Brain</h3>
            <p className="text-[10px] text-text-secondary">Procesamiento de lenguaje natural sin latencia y 100% privado</p>
          </div>
        </div>
      </div>

      {/* Message Feed Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.map((msg) => {
          const isAssistant = msg.sender === 'assistant';
          return (
            <div 
              key={msg.id}
              className={`flex gap-3 max-w-2xl ${isAssistant ? 'mr-auto text-left' : 'ml-auto flex-row-reverse text-right'}`}
            >
              {/* Avatar indicator */}
              <div className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center border ${
                isAssistant 
                  ? 'bg-primary/10 border-primary/20 text-primary' 
                  : 'bg-accent-violet/10 border-accent-violet/20 text-accent-violet'
              }`}>
                {isAssistant ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
              </div>

              {/* Chat Bubble */}
              <div className="space-y-3">
                <div className={`rounded-2xl px-4 py-3 text-xs leading-relaxed border ${
                  isAssistant 
                    ? 'bg-[#0d1117]/60 border-white/5 text-text-primary' 
                    : 'bg-accent-violet/20 border-accent-violet/25 text-text-primary text-left'
                }`}>
                  <p className="whitespace-pre-line">{msg.text}</p>
                  
                  {/* Timestamp */}
                  <span className="block text-[8px] text-text-secondary/40 mt-1">
                    {msg.timestamp}
                  </span>
                </div>

                {/* Inline Action Payload Card */}
                {isAssistant && msg.parsedPayload && (
                  <div className="rounded-xl border border-primary/30 bg-primary/5 p-4 space-y-3 max-w-sm animate-slide-in">
                    <div className="flex items-center gap-1.5 text-[9px] text-primary uppercase font-bold tracking-wider">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Acción Sugerida Lista</span>
                    </div>
                    
                    <div className="text-xs font-bold text-text-primary">
                      &quot;{msg.parsedPayload.title}&quot;
                    </div>

                    <div className="grid grid-cols-1 gap-2 text-[10px] text-text-secondary border-t border-white/5 pt-2.5">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-secondary" />
                        <span>Fecha: {msg.parsedPayload.due_date}</span>
                      </div>
                      {msg.parsedPayload.due_time && (
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-warning" />
                          <span>Hora: {msg.parsedPayload.due_time}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-1.5">
                        <Tag className="w-3.5 h-3.5 text-accent-blue" />
                        <span className="capitalize">Categoría: {msg.parsedPayload.category || 'personal'}</span>
                      </div>
                    </div>

                    <div className="flex gap-2 pt-1.5">
                      <button
                        onClick={() => handleIgnorePayload(msg.id)}
                        className="w-1/2 rounded-lg border border-white/10 hover:bg-white/5 text-[10px] font-bold py-1.5 text-text-secondary transition-all"
                      >
                        Descartar
                      </button>
                      <button
                        onClick={() => handleApplyPayload(msg.id, msg.parsedPayload!)}
                        className="w-1/2 flex items-center justify-center gap-1 rounded-lg bg-primary hover:bg-primary/95 text-black text-[10px] font-extrabold py-1.5 transition-all"
                      >
                        <Check className="w-3 h-3" />
                        <span>Aceptar</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {/* AI Typing Simulator Indicator */}
        {isTyping && (
          <div className="flex gap-3 mr-auto text-left">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-primary/10 border border-primary/20 text-primary">
              <Bot className="w-4 h-4 animate-pulse" />
            </div>
            <div className="rounded-2xl px-4 py-3 bg-[#0d1117]/60 border border-white/5 flex items-center gap-1">
              <div className="w-1.5 h-1.5 rounded-full bg-primary animate-[bounce_1s_infinite_100ms]" />
              <div className="w-1.5 h-1.5 rounded-full bg-primary animate-[bounce_1s_infinite_200ms]" />
              <div className="w-1.5 h-1.5 rounded-full bg-primary animate-[bounce_1s_infinite_300ms]" />
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Command Quick Chips Row */}
      <div className="flex gap-2 overflow-x-auto px-6 py-2 border-t border-white/5 bg-black/20 scrollbar-none">
        {[
          '¿Qué tengo para hoy?',
          'Mañana a las 3 llamar al cliente',
          'Todos los lunes a las 8 meditar',
          'Organízame el viernes'
        ].map((chip, cIdx) => (
          <button
            key={cIdx}
            onClick={() => handleSend(chip)}
            className="flex-shrink-0 rounded-full border border-white/10 hover:border-primary/45 hover:bg-primary/5 px-3.5 py-1.5 text-[10px] font-bold text-text-secondary hover:text-primary transition-all cursor-pointer"
          >
            {chip}
          </button>
        ))}
      </div>

      {/* Bottom Textarea Input Wrapper */}
      <div className="p-4 border-t border-white/5 bg-black/40 flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend(input)}
          placeholder="Escribe un comando en español (ej: Mañana entrenar a las 9)..."
          className="flex-1 rounded-xl bg-black/40 border border-white/10 px-4 py-3 text-xs text-text-primary placeholder:text-text-secondary/40 focus:border-primary/50 focus:outline-none transition-all"
        />
        <button
          onClick={() => handleSend(input)}
          disabled={!input.trim()}
          className="rounded-xl bg-primary hover:bg-primary/95 disabled:bg-primary/20 text-black px-4 py-3 transition-all flex items-center justify-center cursor-pointer"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>

    </div>
  );
}
