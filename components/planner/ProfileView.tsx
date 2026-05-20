// ProfileView - FlowPlanner Gamification & Settings Dashboard
// Developed by Arcano Intelligence

'use client';

import React, { useState } from 'react';
import { useFlowStore } from '../../store/flowStore';
import { 
  Award, Sparkles, CheckCircle, 
  Trash2, Database, Settings, Lock
} from 'lucide-react';
import { PlanningStyle } from '../../types';

export default function ProfileView() {
  const profile = useFlowStore((state) => state.profile);
  const achievements = useFlowStore((state) => state.achievements);
  const userAchievements = useFlowStore((state) => state.userAchievements);
  
  const updateProfile = useFlowStore((state) => state.updateProfile);
  const resetAll = useFlowStore((state) => state.resetAll);
  const triggerNotification = useFlowStore((state) => state.triggerNotification);

  const [newName, setNewName] = useState(profile.full_name);
  const [newPlanningStyle, setNewPlanningStyle] = useState(profile.planning_style);
  const [isUpdating, setIsUpdating] = useState(false);

  const getRankName = (lvl: number) => {
    if (lvl === 1) return 'Inicio del Viaje';
    if (lvl === 2) return 'Organizador Constante';
    if (lvl === 3) return 'Enfoque Profundo';
    if (lvl === 4) return 'Estratega del Flow';
    if (lvl === 5) return 'Arquitecto del Tiempo';
    return 'Maestro del Flow';
  };

  const handleUpdateProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdating(true);
    updateProfile({
      full_name: newName,
      planning_style: newPlanningStyle
    });
    setTimeout(() => {
      setIsUpdating(false);
      triggerNotification('PERFIL ACTUALIZADO', 'Tus datos de guardado se actualizaron.', 'success');
    }, 600);
  };

  const handleResetData = () => {
    if (window.confirm('¿Estás seguro de restablecer todos tus datos locales de FlowPlanner? Esta acción eliminará todo tu historial, XP y hábitos de forma irreversible.')) {
      resetAll();
      triggerNotification('DATOS RESTABLECIDOS', 'FlowPlanner ha vuelto a su estado inicial.', 'success');
      setTimeout(() => window.location.reload(), 500);
    }
  };

  const levelProgressPercent = ((profile.xp % 500) / 500) * 100;

  return (
    <div className="space-y-6 pb-24">
      
      {/* HEADER SECTION */}
      <div>
        <h2 className="text-2xl font-bold text-text-primary">Centro de Recompensas</h2>
        <p className="text-xs text-text-secondary mt-0.5">
          Haz seguimiento de tus logros desbloqueados y tu nivelación en Flow.
        </p>
      </div>

      {/* GAMIFICATION ENGINE SUMMARY CARD */}
      <div className="rounded-2xl border border-primary/20 bg-primary/5 p-6 relative overflow-hidden">
        {/* Glow */}
        <div className="absolute -top-10 -right-10 w-44 h-44 bg-primary/20 rounded-full blur-[80px] pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 rounded-2xl bg-primary/25 border border-primary/30 flex items-center justify-center">
              <Award className="w-10 h-10 text-primary animate-pulse" />
            </div>
            
            <div className="space-y-1">
              <h3 className="text-lg font-extrabold text-text-primary flex items-center gap-2">
                <span>Nivel {profile.level}: {getRankName(profile.level)}</span>
              </h3>
              <p className="text-xs text-text-secondary">
                Has acumulado un total de <span className="text-primary font-bold">{profile.xp} XP</span> en tu viaje.
              </p>
            </div>
          </div>

          {/* Progress meter */}
          <div className="flex-1 max-w-md w-full space-y-1.5">
            <div className="flex justify-between text-xs text-text-secondary/70">
              <span className="font-semibold">Siguiente Nivel</span>
              <span className="font-bold text-text-primary">{profile.xp % 500} / 500 XP</span>
            </div>
            <div className="h-2.5 bg-white/10 rounded-full overflow-hidden">
              <div 
                className="h-full bg-primary transition-all duration-700 ease-out" 
                style={{ width: `${levelProgressPercent}%` }}
              />
            </div>
            <p className="text-[10px] text-text-secondary/50 text-right">
              Faltan {500 - (profile.xp % 500)} XP para Nivel {profile.level + 1}
            </p>
          </div>
        </div>
      </div>

      {/* INSIGNIAS GRID */}
      <div className="rounded-2xl glass-panel p-6">
        <h3 className="text-sm font-bold uppercase tracking-wider text-text-primary border-b border-white/5 pb-4 mb-4 flex items-center gap-1.5">
          <Sparkles className="w-4 h-4 text-accent-violet animate-pulse" />
          <span>Insignias de Logros Desbloqueados</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {achievements.map((ach) => {
            const isUnlocked = userAchievements.some(ua => ua.achievement_id === ach.id);
            return (
              <div 
                key={ach.id}
                className={`rounded-xl border p-4 flex gap-3 transition-all ${
                  isUnlocked 
                    ? 'border-primary/20 bg-primary/5 opacity-100 scale-100' 
                    : 'border-white/5 bg-black/30 opacity-40 hover:opacity-50'
                }`}
              >
                <div className={`flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center ${
                  isUnlocked ? 'bg-primary/20 text-primary' : 'bg-white/5 text-text-secondary/40'
                }`}>
                  {isUnlocked ? <CheckCircle className="w-5 h-5" /> : <Lock className="w-5 h-5" />}
                </div>

                <div className="min-w-0">
                  <h4 className="text-xs font-bold text-text-primary flex items-center gap-1.5">
                    <span>{ach.title}</span>
                    {isUnlocked && <span className="text-[8px] bg-primary/20 text-primary px-1.5 py-0.5 rounded font-bold">+{ach.xp_reward} XP</span>}
                  </h4>
                  <p className="text-[10px] text-text-secondary mt-0.5 leading-relaxed">
                    {ach.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* SETTINGS AND BACKEND LOGIC */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Profile details editor */}
        <div className="rounded-2xl glass-panel p-6">
          <h3 className="text-sm font-bold uppercase tracking-wider text-text-primary border-b border-white/5 pb-3 mb-4 flex items-center gap-1.5">
            <Settings className="w-4 h-4 text-accent-blue" />
            <span>Configuración del Perfil</span>
          </h3>

          <form onSubmit={handleUpdateProfileSubmit} className="space-y-4 text-left">
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider">Nombre de Usuario</label>
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="w-full rounded-xl bg-black/40 border border-white/10 p-3 text-xs text-text-primary focus:border-primary/50 focus:outline-none transition-all"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider">Estilo de Planificación</label>
              <select
                value={newPlanningStyle}
                onChange={(e) => setNewPlanningStyle(e.target.value as PlanningStyle)}
                className="w-full rounded-xl bg-black/40 border border-white/10 p-3 text-xs text-text-primary focus:border-primary/50 focus:outline-none transition-all"
              >
                <option value="simple">Simple (Listas de tareas rápidas)</option>
                <option value="schedule">Horario (Bloques de tiempo por horas)</option>
                <option value="projects">Proyectos (Organización estructurada)</option>
                <option value="habits">Hábitos (Enfoque en constancia)</option>
                <option value="ai">AI Flow (Recomendaciones asistidas)</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={isUpdating || !newName.trim()}
              className="w-full rounded-xl bg-primary hover:bg-primary/95 text-black py-2.5 text-xs font-bold transition-all disabled:opacity-50 cursor-pointer"
            >
              {isUpdating ? 'Guardando...' : 'Guardar Cambios'}
            </button>
          </form>
        </div>

        {/* Database connectivity information */}
        <div className="rounded-2xl glass-panel p-6 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-text-primary border-b border-white/5 pb-3 mb-4 flex items-center gap-1.5">
              <Database className="w-4 h-4 text-warning" />
              <span>Sincronización y Backend</span>
            </h3>

            <div className="space-y-4">
              <div className="flex justify-between items-center bg-black/35 p-3 rounded-xl border border-white/5">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-lg bg-primary/10 border border-primary/20 text-primary">
                    <CheckCircle className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-text-primary">Base de Datos</h4>
                    <p className="text-[9px] text-text-secondary">Conexión con Supabase Local/Nube</p>
                  </div>
                </div>
                <span className="text-[9px] bg-primary/20 text-primary px-2 py-0.5 rounded-full font-bold uppercase">
                  Zustand Offline Activo
                </span>
              </div>

              <div className="space-y-1 leading-relaxed">
                <p className="text-[10px] text-text-secondary">
                  FlowPlanner opera de manera **Offline-First**. Toda tu información se almacena localmente y se sincroniza en segundo plano cuando se detectan credenciales de base de datos seguras.
                </p>
                <p className="text-[9px] text-text-secondary/50">
                  Desarrollado de forma premium por **Arcano Intelligence** como solución corporativa independiente.
                </p>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-white/5">
            <button
              onClick={handleResetData}
              className="w-full flex items-center justify-center gap-1.5 rounded-xl border border-danger/30 hover:bg-danger/10 text-danger py-2.5 text-xs font-bold transition-all cursor-pointer"
            >
              <Trash2 className="w-4 h-4" />
              <span>Restablecer Datos Locales</span>
            </button>
          </div>
        </div>

      </div>

    </div>
  );
}
