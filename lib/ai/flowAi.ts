// Flow AI Engine - Natural Language Parsing and Conversational Assistant
// Developed by Arcano Intelligence

import { Task, Priority, TaskCategory, Habit } from '../../types';
import { toLocalDateStr, getRelativeLocalDate } from '../dateUtils';

interface ParsedResult {
  title: string;
  due_date: string;
  due_time: string | null;
  priority: Priority;
  category: TaskCategory;
  is_recurring: boolean;
  recurrence_rule: string | null;
  duration_minutes: number | null;
}

// Simple local date helpers
const getRelativeDate = (days: number): string => {
  return getRelativeLocalDate(days);
};

const getNextDayOfWeek = (dayName: string): string => {
  const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  const targetIndex = days.indexOf(dayName.toLowerCase());
  if (targetIndex === -1) return getRelativeDate(0);
  
  const d = new Date();
  const currentIndex = d.getDay();
  let diff = targetIndex - currentIndex;
  if (diff <= 0) diff += 7; // Next week's day
  
  d.setDate(d.getDate() + diff);
  return toLocalDateStr(d);
};

/**
 * Parses natural Spanish text to extract task details
 */
export const parseNaturalLanguageTask = (text: string): ParsedResult => {
  const normalized = text.toLowerCase();
  
  let title = text;
  let due_date = getRelativeDate(0); // Today default
  let due_time: string | null = null;
  let priority: Priority = 'medium';
  let category: TaskCategory = 'personal';
  let is_recurring = false;
  let recurrence_rule: string | null = null;
  const duration_minutes: number | null = null;

  // 1. Detect recurrence
  if (normalized.includes('todos los') || normalized.includes('cada') || normalized.includes('diario')) {
    is_recurring = true;
    if (normalized.includes('lunes')) recurrence_rule = 'weekly_monday';
    else if (normalized.includes('martes')) recurrence_rule = 'weekly_tuesday';
    else if (normalized.includes('miercoles') || normalized.includes('miércoles')) recurrence_rule = 'weekly_wednesday';
    else if (normalized.includes('jueves')) recurrence_rule = 'weekly_thursday';
    else if (normalized.includes('viernes')) recurrence_rule = 'weekly_friday';
    else if (normalized.includes('sabado') || normalized.includes('sábado')) recurrence_rule = 'weekly_saturday';
    else if (normalized.includes('domingo')) recurrence_rule = 'weekly_sunday';
    else recurrence_rule = 'daily';
  }

  // 2. Detect Date (Mañana, Hoy, Lunes, etc.)
  if (normalized.includes('mañana') && !normalized.includes('mañana a la mañana')) {
    due_date = getRelativeDate(1);
  } else if (normalized.includes('pasado mañana')) {
    due_date = getRelativeDate(2);
  } else if (normalized.includes('el lunes')) {
    due_date = getNextDayOfWeek('monday');
  } else if (normalized.includes('el martes')) {
    due_date = getNextDayOfWeek('tuesday');
  } else if (normalized.includes('el miercoles') || normalized.includes('el miércoles')) {
    due_date = getNextDayOfWeek('wednesday');
  } else if (normalized.includes('el jueves')) {
    due_date = getNextDayOfWeek('thursday');
  } else if (normalized.includes('el viernes')) {
    due_date = getNextDayOfWeek('friday');
  } else if (normalized.includes('el sabado') || normalized.includes('el sábado')) {
    due_date = getNextDayOfWeek('saturday');
  } else if (normalized.includes('el domingo')) {
    due_date = getNextDayOfWeek('sunday');
  } else {
    // Detect numbers like "el 15" or "el dia 15"
    const dayMatch = normalized.match(/(?:el|día)\s+(\d{1,2})/);
    if (dayMatch) {
      const targetDay = parseInt(dayMatch[1], 10);
      const d = new Date();
      if (d.getDate() > targetDay) {
        // Next month
        d.setMonth(d.getMonth() + 1);
      }
      d.setDate(targetDay);
      due_date = toLocalDateStr(d);
    }
  }

  // 3. Detect Time (a las 3, a las 15:30, a las 9 pm, etc.)
  const timeMatch = normalized.match(/a\s+las\s+(\d{1,2})(?::(\d{2}))?\s*(pm|am)?/);
  if (timeMatch) {
    let hours = parseInt(timeMatch[1], 10);
    const minutes = timeMatch[2] ? parseInt(timeMatch[2], 10) : 0;
    const ampm = timeMatch[3];

    if (ampm === 'pm' && hours < 12) hours += 12;
    if (ampm === 'am' && hours === 12) hours = 0;
    
    // Standard format (military time)
    // If no am/pm specified but number is 1 to 7, assume PM for tasks (e.g. 3 = 15:00)
    if (!ampm && hours >= 1 && hours <= 7) hours += 12;

    due_time = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  }

  // 4. Detect Priority
  if (normalized.includes('urgente') || normalized.includes('importante') || normalized.includes('asap') || normalized.includes('alta')) {
    priority = 'high';
  } else if (normalized.includes('baja') || normalized.includes('tranquilo') || normalized.includes('cuando pueda')) {
    priority = 'low';
  }

  // 5. Detect Category
  if (normalized.includes('ejercicio') || normalized.includes('gimnasio') || normalized.includes('entrenar') || normalized.includes('correr') || normalized.includes('meditar') || normalized.includes('salud')) {
    category = 'salud';
  } else if (normalized.includes('estudiar') || normalized.includes('leer') || normalized.includes('curso') || normalized.includes('libro') || normalized.includes('aprender')) {
    category = 'estudio';
  } else if (normalized.includes('pagar') || normalized.includes('factura') || normalized.includes('dinero') || normalized.includes('banco') || normalized.includes('comprar')) {
    category = 'finanzas';
  } else if (normalized.includes('reunión') || normalized.includes('reunion') || normalized.includes('cliente') || normalized.includes('llamar a') || normalized.includes('enviar propuesta') || normalized.includes('trabajo') || normalized.includes('oficina')) {
    category = 'trabajo';
  } else if (normalized.includes('familia') || normalized.includes('mamá') || normalized.includes('hijo') || normalized.includes('cena')) {
    category = 'familia';
  } else if (normalized.includes('proyecto') || normalized.includes('diseñar') || normalized.includes('programar') || normalized.includes('maquetar') || normalized.includes('lanzar')) {
    category = 'proyecto';
  }

  // 6. Clean Title: strip out date/time keywords to keep it elegant
  title = text
    .replace(/(?:\bmañana\b|\bpasado mañana\b|\bhoy\b|\bel lunes\b|\bel martes\b|\bel miércoles\b|\bel miercoles\b|\bel jueves\b|\bel viernes\b|\bel sábado\b|\bel sabado\b|\bel domingo\b)/gi, '')
    .replace(/a\s+las\s+\d{1,2}(?::\d{2})?\s*(?:pm|am)?/gi, '')
    .replace(/(?:\btodos los\b|\bcada\b|\bdiario\b)/gi, '')
    .replace(/(?:\burgente\b|\bimportante\b|\bprioridad alta\b|\bprioridad baja\b)/gi, '')
    .replace(/\s+/g, ' ')
    .trim();

  // Fallback if title became empty
  if (!title) title = text;

  // Capitalize first letter
  title = title.charAt(0).toUpperCase() + title.slice(1);

  return {
    title,
    due_date,
    due_time,
    priority,
    category,
    is_recurring,
    recurrence_rule,
    duration_minutes
  };
};

/**
 * Simulates chat responses from Flow AI based on user messages
 */
export const askFlowAI = (
  message: string, 
  context: { tasks: Task[]; habits: Habit[] }
): {
  reply: string;
  suggestedActions?: Array<{
    label: string;
    action: string; // Action identifier
    payload?: Record<string, unknown>;
  }>;
} => {
  const normalized = message.toLowerCase();
  
  if (normalized.includes('pendiente') || normalized.includes('hoy') || normalized.includes('que tengo')) {
    const todayStr = toLocalDateStr();
    const todayTasks = context.tasks.filter(t => t.due_date === todayStr && t.status === 'pending');
    
    if (todayTasks.length === 0) {
      return {
        reply: "🌸 ¡Tu día está completamente despejado! No tienes tareas pendientes planificadas para hoy. ¿Quieres que reservemos un **bloque de enfoque** para avanzar en tus proyectos o que busquemos nuevos hábitos?",
        suggestedActions: [
          { label: "Crear Bloque de Enfoque", action: "create_focus_block" },
          { label: "Sugerir Hábitos", action: "suggest_habits" }
        ]
      };
    }

    const taskList = todayTasks.map(t => `- **${t.title}** (${t.priority === 'high' ? '🔴 Alta' : '🟡 Media'})`).join('\n');
    return {
      reply: `📅 Esto es lo que tienes agendado para **hoy**:\n\n${taskList}\n\nTienes **${todayTasks.length} tareas pendientes**. Te recomiendo iniciar con tus prioridades de alta energía. ¿Quieres que dividamos la tarea más compleja en subtareas sencillas?`,
      suggestedActions: [
        { label: "Dividir tarea importante", action: "split_important_task", payload: { taskId: todayTasks[0].id } },
        { label: "Organizar mi mañana", action: "plan_tomorrow" }
      ]
    };
  }

  if (normalized.includes('organiza mañana') || normalized.includes('mañana') || normalized.includes('lunes')) {
    const tomorrowStr = getRelativeDate(1);
    return {
      reply: "🎯 **Planificación Flow AI para Mañana:**\n\nHe creado un plan optimizado para equilibrar tus niveles de energía:\n\n1. **Mañana (Alta energía)**: Abordar tareas complejas de desarrollo (90 min).\n2. **Tarde (Media/Baja energía)**: Tareas administrativas, correos y seguimiento de hábitos.\n\n¿Quieres que configure un bloque de enfoque matutino a las **09:00 AM** para garantizar avance sin interrupciones?",
      suggestedActions: [
        { label: "Aplicar Plan Mañana", action: "apply_tomorrow_plan", payload: { date: tomorrowStr } },
        { label: "Añadir Bloque Enfoque", action: "add_focus_block", payload: { date: tomorrowStr, time: "09:00" } }
      ]
    };
  }

  if (normalized.includes('hábito') || normalized.includes('habito')) {
    const activeHabits = context.habits.filter(h => h.is_active);
    if (activeHabits.length === 0) {
      return {
        reply: "💡 Aún no tienes hábitos activos. Los hábitos son la base de la consistencia. Te sugiero iniciar con pequeños hitos diarios:\n\n- **Meditación matutina** (10 min)\n- **Leer 10 páginas** antes de dormir\n- **Estiramientos** (15 min)\n\n¿Quieres crear uno ahora mismo?",
        suggestedActions: [
          { label: "Crear Hábito de Meditación", action: "create_habit_demo", payload: { title: "Meditación matutina", category: "salud" } },
          { label: "Crear Hábito de Lectura", action: "create_habit_demo", payload: { title: "Lectura diaria", category: "estudio" } }
        ]
      };
    }

    return {
      reply: `⚡ Tienes **${activeHabits.length} hábitos activos** en tu rutina. Medir tu consistencia diaria te ayuda a visualizar tu progreso sin castigarte. Tu hábito más estable es **${activeHabits[0].title}**.\n\n¿Te gustaría añadir un recordatorio inteligente a alguno de ellos?`,
      suggestedActions: [
        { label: "Ver todos los hábitos", action: "view_habits" },
        { label: "Crear hábito de agua", action: "create_habit_demo", payload: { title: "Tomar 2L de agua", category: "salud" } }
      ]
    };
  }

  if (normalized.includes('sobrecarga') || normalized.includes('cansado') || normalized.includes('estres') || normalized.includes('mover')) {
    return {
      reply: "🧠 **Análisis de Carga Flow AI:**\n\nNo te abrumes, el progreso no se trata de completarlo todo, sino de avanzar mejor. Veo que tienes algunas tareas vencidas del fin de semana. \n\nTe sugiero activar la lógica **'Hoy Limpio'**:\n- Moveremos las tareas no prioritarias a la bandeja de **Revisión**.\n- Reprogramaremos la tarea de alta prioridad para este jueves en la mañana.\n\n¿Te gustaría aplicar esta optimización para reducir el ruido?",
      suggestedActions: [
        { label: "Despejar Hoy (Hoy Limpio)", action: "run_hoy_limpio" },
        { label: "Mover tareas al viernes", action: "move_all_friday" }
      ]
    };
  }

  // General conversational response
  return {
    reply: "👋 ¡Hola! Soy **Flow AI**, tu asistente estratégico de productividad. Estoy aquí para ayudarte a planificar con claridad, evitar la sobrecarga y celebrar tus éxitos de forma orgánica.\n\nPuedes pedirme cosas como:\n- *'¿Qué tengo pendiente hoy?'*\n- *'Organízame mañana'*\n- *'Sugerencias para no sobrecargarme'*\n- *'¿Qué hábitos tengo?'*\n\n¿En qué área nos enfocamos hoy?",
    suggestedActions: [
      { label: "Ver agenda de hoy", action: "view_today" },
      { label: "Optimizar mi semana", action: "optimize_week" }
    ]
  };
};

/**
 * High-fidelity NLP messaging router used by the interactive chat panel
 */
export const processFlowAiMessage = (text: string): { 
  feedback: string; 
  actionPayload: {
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
  };
} => {
  const parsed = parseNaturalLanguageTask(text);
  
  if (parsed.is_recurring) {
    const feedback = `🧠 **Flow AI Brain** ha detectado una intención de rutina recurrente.\n\n¿Quieres registrar el hábito **"${parsed.title}"** con recordatorio diario a las **${parsed.due_time || '08:00'}**?`;
    return {
      feedback,
      actionPayload: {
        type: 'habit',
        title: parsed.title,
        reminder_time: parsed.due_time || '08:00',
      }
    };
  }

  const dateLabel = parsed.due_date === getRelativeDate(0) ? 'hoy' : parsed.due_date === getRelativeDate(1) ? 'mañana' : parsed.due_date;
  const timeLabel = parsed.due_time ? ` a las ${parsed.due_time}` : '';
  const feedback = `🎯 **Flow AI Brain** ha estructurado tu bloque de planificación:\n\n- **Título**: ${parsed.title}\n- **Fecha**: ${dateLabel}${timeLabel}\n- **Prioridad**: ${parsed.priority === 'high' ? 'Alta (🔴)' : 'Media (🟡)'}\n- **Categoría**: ${parsed.category.toUpperCase()}\n\n¿Deseas confirmar la adición a tu agenda de alto rendimiento?`;

  return {
    feedback,
    actionPayload: {
      type: 'task',
      title: parsed.title,
      due_date: parsed.due_date,
      due_time: parsed.due_time,
      priority: parsed.priority,
      category: parsed.category,
      is_recurring: parsed.is_recurring,
      recurrence_rule: parsed.recurrence_rule,
      duration_minutes: parsed.duration_minutes || 30
    }
  };
};
