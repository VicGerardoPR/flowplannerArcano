// ManageHabitsModal - Highly Premium Custom Habits CRUD Dashboard
// Developed by Arcano Intelligence

'use client';

import React, { useState, useEffect } from 'react';
import { useFlowStore } from '../../store/flowStore';
import { 
  X, Plus, Trash2, Edit2, Save, 
  Flame, Brain, BookOpen, Compass, 
  Heart, Activity, Coffee, Code, 
  Sparkles, Smile, Dumbbell, Target, 
  Check, AlertCircle, Clock, Calendar, Power
} from 'lucide-react';
import { Habit, FrequencyType, PeriodType } from '../../types';

interface ManageHabitsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const PRESET_COLORS = [
  '#00E6A8', // Neon Turquoise
  '#4D8DFF', // Sleek Blue
  '#9B5CFF', // Violet Spark
  '#FFCC66', // Amber Gold
  '#FF5C7A', // Neon Pink
  '#FF9F43', // Warm Orange
  '#00D2D3', // Teal Cyan
  '#10AC84'  // Emerald Green
];

const PRESET_ICONS = [
  { name: 'Flame', component: Flame },
  { name: 'Brain', component: Brain },
  { name: 'BookOpen', component: BookOpen },
  { name: 'Compass', component: Compass },
  { name: 'Heart', component: Heart },
  { name: 'Activity', component: Activity },
  { name: 'Coffee', component: Coffee },
  { name: 'Code', component: Code },
  { name: 'Sparkles', component: Sparkles },
  { name: 'Smile', component: Smile },
  { name: 'Dumbbell', component: Dumbbell },
  { name: 'Target', component: Target }
];

const WEEKDAYS = [
  { id: 'monday', label: 'L', name: 'Lunes' },
  { id: 'tuesday', label: 'M', name: 'Martes' },
  { id: 'wednesday', label: 'M', name: 'Miércoles' },
  { id: 'thursday', label: 'J', name: 'Jueves' },
  { id: 'friday', label: 'V', name: 'Viernes' },
  { id: 'saturday', label: 'S', name: 'Sábado' },
  { id: 'sunday', label: 'D', name: 'Domingo' }
];

export default function ManageHabitsModal({ isOpen, onClose }: ManageHabitsModalProps) {
  const habits = useFlowStore((state) => state.habits);
  const addHabit = useFlowStore((state) => state.addHabit);
  const updateHabit = useFlowStore((state) => state.updateHabit);
  const deleteHabit = useFlowStore((state) => state.deleteHabit);
  const triggerNotification = useFlowStore((state) => state.triggerNotification);

  // Mode: 'list' | 'add' | 'edit'
  const [mode, setMode] = useState<'list' | 'add' | 'edit'>('list');
  const [editingHabitId, setEditingHabitId] = useState<string | null>(null);

  // Form states
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [frequency, setFrequency] = useState<FrequencyType>('daily');
  const [period, setPeriod] = useState<PeriodType>('day');
  const [targetCount, setTargetCount] = useState(1);
  const [activeDays, setActiveDays] = useState<string[]>( WEEKDAYS.map(w => w.id) );
  const [reminderTime, setReminderTime] = useState('');
  const [selectedColor, setSelectedColor] = useState('#9B5CFF');
  const [selectedIcon, setSelectedIcon] = useState('Brain');

  // Reset form when entering 'add' mode
  const enterAddMode = () => {
    setTitle('');
    setDescription('');
    setFrequency('daily');
    setPeriod('day');
    setTargetCount(1);
    setActiveDays(WEEKDAYS.map(w => w.id));
    setReminderTime('');
    setSelectedColor('#9B5CFF');
    setSelectedIcon('Brain');
    setMode('add');
  };

  // Populate form when entering 'edit' mode
  const enterEditMode = (habit: Habit) => {
    setEditingHabitId(habit.id);
    setTitle(habit.title);
    setDescription(habit.description || '');
    setFrequency(habit.frequency_type);
    setPeriod(habit.period);
    setTargetCount(habit.target_count);
    setActiveDays(habit.active_days || []);
    setReminderTime(habit.reminder_time || '');
    setSelectedColor(habit.color);
    setSelectedIcon(habit.icon);
    setMode('edit');
  };

  // Day toggle utility
  const toggleDay = (dayId: string) => {
    if (activeDays.includes(dayId)) {
      setActiveDays(activeDays.filter(d => d !== dayId));
    } else {
      setActiveDays([...activeDays, dayId]);
    }
  };

  // Save Habit Submit
  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const habitData = {
      title: title.trim(),
      description: description.trim() || null,
      frequency_type: frequency,
      target_count: targetCount,
      period: period,
      active_days: activeDays,
      reminder_time: reminderTime || null,
      color: selectedColor,
      icon: selectedIcon
    };

    if (mode === 'add') {
      addHabit(habitData);
      triggerNotification('HÁBITO CREADO', `Iniciaste el hábito: "${title}"`, 'success');
    } else if (mode === 'edit' && editingHabitId) {
      updateHabit(editingHabitId, habitData);
      triggerNotification('HÁBITO ACTUALIZADO', `Se guardaron los cambios del hábito: "${title}"`, 'success');
    }

    setMode('list');
  };

  const handleDelete = (id: string, title: string) => {
    if (window.confirm(`¿Estás seguro de eliminar el hábito "${title}"? Se borrará todo su historial de consistencia.`)) {
      deleteHabit(id);
      triggerNotification('HÁBITO ELIMINADO', `Se eliminó el hábito "${title}" correctamente.`, 'info');
    }
  };

  const toggleActiveStatus = (habit: Habit) => {
    updateHabit(habit.id, { is_active: !habit.is_active });
    triggerNotification(
      habit.is_active ? 'HÁBITO PAUSADO' : 'HÁBITO ACTIVADO',
      `El hábito "${habit.title}" ahora está ${habit.is_active ? 'inactivo' : 'activo'}.`,
      'info'
    );
  };

  // Helper to render preset icons dynamically
  const renderIconComponent = (iconName: string, color: string, className = "w-4 h-4") => {
    const iconObj = PRESET_ICONS.find(i => i.name === iconName) || PRESET_ICONS[1]; // default Brain
    const IconComponent = iconObj.component;
    return <IconComponent className={className} style={{ color }} />;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#050607]/80 backdrop-blur-md">
      
      {/* Modal Wrapper */}
      <div className="relative w-full max-w-lg rounded-2xl glass-panel-elevated flex flex-col max-h-[90vh] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/5 p-5">
          <div>
            <h3 className="text-sm font-extrabold uppercase tracking-wider text-text-primary">
              {mode === 'list' && 'Administrar Rutina de Hábitos'}
              {mode === 'add' && 'Nuevo Hábito Personalizado'}
              {mode === 'edit' && 'Editar Hábito'}
            </h3>
            <p className="text-[10px] text-text-secondary mt-0.5">
              {mode === 'list' && 'Crea, edita o pausa tus hábitos diarios de alto rendimiento.'}
              {(mode === 'add' || mode === 'edit') && 'Configura los detalles de consistencia del hábito.'}
            </p>
          </div>
          <button 
            onClick={onClose}
            className="rounded-lg p-1.5 bg-white/5 border border-white/10 text-text-secondary hover:text-text-primary hover:bg-white/10 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          
          {/* 1. LIST VIEW */}
          {mode === 'list' && (
            <div className="space-y-4">
              
              <button
                onClick={enterAddMode}
                className="w-full flex items-center justify-center gap-2 border border-dashed border-primary/40 hover:border-primary bg-primary/5 hover:bg-primary/10 rounded-xl py-3 text-xs font-bold text-primary transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Crear Hábito Propio</span>
              </button>

              {habits.length === 0 ? (
                <div className="text-center py-10 border border-white/5 bg-black/10 rounded-xl">
                  <Flame className="w-8 h-8 text-text-secondary/20 mx-auto mb-2 animate-pulse" />
                  <p className="text-xs text-text-secondary">No tienes hábitos. Crea tu primer hábito personalizado arriba.</p>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {habits.map((habit) => (
                    <div 
                      key={habit.id}
                      className={`flex items-center justify-between p-3.5 rounded-xl border transition-all ${
                        habit.is_active 
                          ? 'bg-black/30 border-white/5' 
                          : 'bg-black/10 border-white/5 opacity-50'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <div 
                          className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                          style={{ backgroundColor: `${habit.color}15`, border: `1px solid ${habit.color}30` }}
                        >
                          {renderIconComponent(habit.icon, habit.color)}
                        </div>
                        <div className="min-w-0 flex-1">
                          <h4 className="text-xs font-bold text-text-primary truncate">{habit.title}</h4>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-[9px] uppercase font-semibold opacity-60" style={{ color: habit.color }}>
                              {habit.frequency_type}
                            </span>
                            {habit.reminder_time && (
                              <span className="text-[9px] text-text-secondary flex items-center gap-0.5">
                                <Clock className="w-2.5 h-2.5" />
                                {habit.reminder_time}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div className="flex items-center gap-1.5 ml-3">
                        <button
                          onClick={() => toggleActiveStatus(habit)}
                          title={habit.is_active ? "Pausar hábito" : "Activar hábito"}
                          className={`p-2 rounded-lg border transition-all hover:bg-white/5 ${
                            habit.is_active 
                              ? 'border-success/30 text-success' 
                              : 'border-white/10 text-text-secondary'
                          }`}
                        >
                          <Power className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => enterEditMode(habit)}
                          className="p-2 rounded-lg border border-white/5 text-text-secondary hover:text-text-primary hover:border-white/10 transition-colors"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(habit.id, habit.title)}
                          className="p-2 rounded-lg border border-white/5 text-danger hover:bg-danger/10 hover:border-danger/20 transition-all"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* 2. FORM VIEW (ADD / EDIT) */}
          {(mode === 'add' || mode === 'edit') && (
            <form onSubmit={handleSave} className="space-y-4 text-left">
              
              {/* Title */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider">Nombre del Hábito</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="E.g. Tomar 2L de Agua, Estirar Espalda..."
                  className="w-full rounded-xl bg-black/40 border border-white/10 p-3 text-xs text-text-primary placeholder:text-text-secondary/30 focus:border-primary/50 focus:outline-none transition-all"
                />
              </div>

              {/* Description */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider">Descripción / Propósito (Opcional)</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="¿Por qué es importante este hábito para ti?"
                  rows={2}
                  className="w-full rounded-xl bg-black/40 border border-white/10 p-3 text-xs text-text-primary placeholder:text-text-secondary/30 focus:border-primary/50 focus:outline-none transition-all resize-none"
                />
              </div>

              {/* Grid Options */}
              <div className="grid grid-cols-2 gap-4">
                
                {/* Frequency */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider">Frecuencia</label>
                  <select
                    value={frequency}
                    onChange={(e) => {
                      const f = e.target.value as FrequencyType;
                      setFrequency(f);
                      if (f === 'flexible') setPeriod('week');
                      else setPeriod('day');
                    }}
                    className="w-full rounded-xl bg-black/40 border border-white/10 p-3 text-xs text-text-primary focus:border-primary/50 focus:outline-none transition-all"
                  >
                    <option value="daily">Diario</option>
                    <option value="weekly">Semanal</option>
                    <option value="flexible">Flexible</option>
                  </select>
                </div>

                {/* Reminder Time */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider">Hora de Recordatorio</label>
                  <input
                    type="time"
                    value={reminderTime}
                    onChange={(e) => setReminderTime(e.target.value)}
                    className="w-full rounded-xl bg-black/40 border border-white/10 p-3 text-xs text-text-primary focus:border-primary/50 focus:outline-none transition-all cursor-pointer font-bold scheme-dark"
                  />
                </div>
              </div>

              {/* Active Days Selector (only for Daily & Weekly) */}
              {frequency !== 'flexible' && (
                <div className="space-y-2">
                  <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider">Días Activos de la Semana</label>
                  <div className="flex gap-1.5 justify-between">
                    {WEEKDAYS.map((day) => {
                      const isActive = activeDays.includes(day.id);
                      return (
                        <button
                          key={day.id}
                          type="button"
                          onClick={() => toggleDay(day.id)}
                          className={`w-9 h-9 rounded-xl border text-xs font-bold transition-all flex items-center justify-center ${
                            isActive
                              ? 'bg-primary/20 text-primary border-primary'
                              : 'bg-black/30 border-white/5 text-text-secondary/60 hover:text-text-primary hover:border-white/10'
                          }`}
                          title={day.name}
                        >
                          {day.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Color Selector */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider">Color Temático</label>
                <div className="flex flex-wrap gap-2">
                  {PRESET_COLORS.map((color) => {
                    const isSelected = selectedColor === color;
                    return (
                      <button
                        key={color}
                        type="button"
                        onClick={() => setSelectedColor(color)}
                        className="w-7 h-7 rounded-full border transition-all flex items-center justify-center flex-shrink-0 cursor-pointer"
                        style={{ 
                          backgroundColor: color, 
                          borderColor: isSelected ? '#F5F7FA' : 'transparent',
                          boxShadow: isSelected ? `0 0 10px ${color}` : 'none' 
                        }}
                      >
                        {isSelected && <Check className="w-3.5 h-3.5 text-black stroke-[3]" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Icon Selector */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider">Icono del Hábito</label>
                <div className="grid grid-cols-6 gap-2">
                  {PRESET_ICONS.map((iconItem) => {
                    const isSelected = selectedIcon === iconItem.name;
                    const IconComp = iconItem.component;
                    return (
                      <button
                        key={iconItem.name}
                        type="button"
                        onClick={() => setSelectedIcon(iconItem.name)}
                        className={`p-2.5 rounded-xl border transition-all flex items-center justify-center ${
                          isSelected
                            ? 'bg-white/10 border-white/20'
                            : 'bg-black/35 border-white/5 text-text-secondary hover:border-white/10 hover:text-text-primary'
                        }`}
                      >
                        <IconComp 
                          className="w-4 h-4" 
                          style={{ color: isSelected ? selectedColor : undefined }} 
                        />
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Form Actions */}
              <div className="flex gap-3 pt-3 border-t border-white/5">
                <button
                  type="button"
                  onClick={() => setMode('list')}
                  className="flex-1 rounded-xl border border-white/10 hover:bg-white/5 text-text-secondary hover:text-text-primary py-2.5 text-xs font-bold transition-all cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 rounded-xl bg-primary hover:bg-primary/95 text-black py-2.5 text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{mode === 'add' ? 'Crear Hábito' : 'Guardar Cambios'}</span>
                </button>
              </div>
            </form>
          )}

        </div>

      </div>
    </div>
  );
}
