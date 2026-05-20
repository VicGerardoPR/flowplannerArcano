// Premium Onboarding Flow
// Developed by Arcano Intelligence

'use client';

import React, { useState } from 'react';
import { useFlowStore } from '../../store/flowStore';
import { 
  Sparkles, Check, ArrowRight, User, Target, 
  Clock, Compass, Calendar, ArrowLeft 
} from 'lucide-react';

export default function Onboarding() {
  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [focus, setFocus] = useState('productivity');
  const [style, setStyle] = useState('flexible');

  const completeOnboarding = useFlowStore((state) => state.completeOnboarding);
  const triggerNotification = useFlowStore((state) => state.triggerNotification);

  const handleNext = () => {
    if (step < 4) {
      setStep(step + 1);
    } else {
      // Finalize Onboarding
      completeOnboarding(name || 'Planificador Flow', focus, style);
      triggerNotification(
        '¡BIENVENIDO A FLOWPLANNER!',
        'Has completado tu configuración y ganado tus primeros +100 XP',
        'success'
      );
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#050607] px-4 py-8 overflow-y-auto">
      {/* Background radial glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,230,168,0.08)_0%,transparent_70%)] pointer-events-none" />
      <div className="absolute top-10 right-10 w-96 h-96 bg-accent-violet/5 blur-[120px] rounded-full pointer-events-none" />

      {/* Onboarding Container */}
      <div className="relative w-full max-w-lg overflow-hidden rounded-2xl glass-panel-elevated p-8 text-center shadow-2xl transition-all duration-300">
        
        {/* Step Indicator */}
        <div className="flex items-center justify-center gap-1.5 mb-8">
          {[1, 2, 3, 4].map((i) => (
            <div 
              key={i} 
              className={`h-1.5 rounded-full transition-all duration-300 ${
                step === i 
                  ? 'w-8 bg-primary' 
                  : step > i 
                    ? 'w-4 bg-primary/40' 
                    : 'w-2 bg-white/10'
              }`}
            />
          ))}
        </div>

        {/* STEP 1: WELCOME */}
        {step === 1 && (
          <div className="space-y-6 animate-fade-in">
            <div className="flex justify-center">
              <div className="relative p-4 rounded-3xl bg-primary/10 border border-primary/20">
                <Sparkles className="w-10 h-10 text-primary animate-pulse" />
                <div className="absolute -inset-1 bg-primary/20 blur-md rounded-3xl -z-10" />
              </div>
            </div>
            
            <div className="space-y-2">
              <h1 className="text-3xl font-extrabold tracking-tight text-text-primary">
                FLOW<span className="text-primary font-light">PLANNER</span>
              </h1>
              <p className="text-xs text-text-secondary/50 uppercase tracking-widest font-semibold">
                Desarrollado por Arcano Intelligence
              </p>
            </div>

            <p className="text-sm text-text-secondary max-w-md mx-auto leading-relaxed">
              Diseñado para entrar en el estado de &quot;Flow&quot;. Planifica tu día sin ansiedad con el sistema <span className="text-primary font-semibold">Hoy Limpio</span>, automatiza tus tareas con inteligencia artificial y progresa a través de nuestra gamificación premium.
            </p>

            <div className="pt-4">
              <button
                onClick={handleNext}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-primary hover:bg-primary/90 text-black font-semibold py-3 px-6 shadow-lg shadow-primary/10 transition-all hover:scale-[1.02]"
              >
                <span>Comenzar Experiencia</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: PROFILE DETAILS */}
        {step === 2 && (
          <div className="space-y-6 animate-fade-in">
            <div className="space-y-2">
              <div className="flex justify-center">
                <div className="p-3.5 rounded-full bg-accent-blue/10 border border-accent-blue/20">
                  <User className="w-8 h-8 text-accent-blue" />
                </div>
              </div>
              <h2 className="text-2xl font-bold text-text-primary">¿Cómo deberíamos llamarte?</h2>
              <p className="text-xs text-text-secondary/60">
                Tu perfil registrará tu progreso, desbloqueos y nivel.
              </p>
            </div>

            <div className="space-y-4 text-left">
              <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider">Nombre de Usuario o Alias</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ej: Mathieu"
                className="w-full rounded-xl bg-black/40 border border-white/10 p-4 text-text-primary placeholder:text-text-secondary/35 focus:border-primary/50 focus:ring-1 focus:ring-primary/50 focus:outline-none transition-all text-sm"
              />
            </div>

            <div className="flex gap-3 pt-4">
              <button
                onClick={handleBack}
                className="w-1/3 flex items-center justify-center gap-1.5 rounded-xl border border-white/10 text-text-secondary hover:text-text-primary font-semibold py-3 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Atrás</span>
              </button>
              <button
                onClick={handleNext}
                disabled={!name.trim()}
                className="w-2/3 flex items-center justify-center gap-2 rounded-xl bg-primary hover:bg-primary/90 text-black font-semibold py-3 disabled:bg-primary/20 disabled:text-text-secondary/40 disabled:cursor-not-allowed transition-all"
              >
                <span>Siguiente</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: FOCUS GOALS */}
        {step === 3 && (
          <div className="space-y-6 animate-fade-in">
            <div className="space-y-2">
              <div className="flex justify-center">
                <div className="p-3.5 rounded-full bg-accent-violet/10 border border-accent-violet/20">
                  <Target className="w-8 h-8 text-accent-violet" />
                </div>
              </div>
              <h2 className="text-2xl font-bold text-text-primary">¿Cuál es tu enfoque principal?</h2>
              <p className="text-xs text-text-secondary/60">
                Personalizaremos las sugerencias de la IA según tus prioridades.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-3 text-left">
              {[
                { id: 'productivity', label: 'Maximizar Productividad', desc: 'Completar tareas importantes rápido sin procrastinar.', icon: Sparkles },
                { id: 'stress', label: 'Reducir el Estrés Diario', desc: 'Gestionar tareas mediante bloques serenos y flexibles.', icon: Clock },
                { id: 'habits', label: 'Construir Hábitos Fuertes', desc: 'Rutinas semanales y seguimiento consistente de constancia.', icon: Target },
                { id: 'vision', label: 'Visión de Largo Plazo', desc: 'Alinear planificación diaria con grandes metas anuales.', icon: Compass }
              ].map((opt) => {
                const Icon = opt.icon;
                const active = focus === opt.id;
                return (
                  <button
                    key={opt.id}
                    onClick={() => setFocus(opt.id)}
                    className={`flex items-center gap-4 p-4 rounded-xl border transition-all text-left ${
                      active 
                        ? 'border-primary bg-primary/5 text-text-primary' 
                        : 'border-white/5 bg-black/20 text-text-secondary hover:border-white/10 hover:bg-black/30'
                    }`}
                  >
                    <div className={`p-2 rounded-lg ${active ? 'bg-primary/20 text-primary' : 'bg-white/5 text-text-secondary'}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-sm font-semibold">{opt.label}</div>
                      <div className="text-xs opacity-60 mt-0.5">{opt.desc}</div>
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="flex gap-3 pt-4">
              <button
                onClick={handleBack}
                className="w-1/3 flex items-center justify-center gap-1.5 rounded-xl border border-white/10 text-text-secondary hover:text-text-primary font-semibold py-3 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Atrás</span>
              </button>
              <button
                onClick={handleNext}
                className="w-2/3 flex items-center justify-center gap-2 rounded-xl bg-primary hover:bg-primary/90 text-black font-semibold py-3 transition-all"
              >
                <span>Siguiente</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 4: PLANNING STYLE */}
        {step === 4 && (
          <div className="space-y-6 animate-fade-in">
            <div className="space-y-2">
              <div className="flex justify-center">
                <div className="p-3.5 rounded-full bg-primary/10 border border-primary/20">
                  <Calendar className="w-8 h-8 text-primary" />
                </div>
              </div>
              <h2 className="text-2xl font-bold text-text-primary">Tu Estilo de Planificación</h2>
              <p className="text-xs text-text-secondary/60">
                ¿Cómo prefieres estructurar tu agenda y tus vistas de tiempo?
              </p>
            </div>

            <div className="grid grid-cols-1 gap-3 text-left">
              {[
                { id: 'rigid', label: 'Cronológico / Hora a Hora', desc: 'Cada tarea tiene una hora exacta asignada en el calendario.', icon: Clock },
                { id: 'flexible', label: 'Flexible por Bloques (Flow)', desc: 'Planifica por mañana/tarde/noche. Resuelve a tu propio ritmo.', icon: Compass },
                { id: 'goals', label: 'Basado en Objetivos Claros', desc: 'Te enfocas en 3 grandes prioridades diarias antes que en horarios.', icon: Target }
              ].map((opt) => {
                const Icon = opt.icon;
                const active = style === opt.id;
                return (
                  <button
                    key={opt.id}
                    onClick={() => setStyle(opt.id)}
                    className={`flex items-center gap-4 p-4 rounded-xl border transition-all text-left ${
                      active 
                        ? 'border-primary bg-primary/5 text-text-primary' 
                        : 'border-white/5 bg-black/20 text-text-secondary hover:border-white/10 hover:bg-black/30'
                    }`}
                  >
                    <div className={`p-2 rounded-lg ${active ? 'bg-primary/20 text-primary' : 'bg-white/5 text-text-secondary'}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-sm font-semibold">{opt.label}</div>
                      <div className="text-xs opacity-60 mt-0.5">{opt.desc}</div>
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="flex gap-3 pt-4">
              <button
                onClick={handleBack}
                className="w-1/3 flex items-center justify-center gap-1.5 rounded-xl border border-white/10 text-text-secondary hover:text-text-primary font-semibold py-3 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Atrás</span>
              </button>
              <button
                onClick={handleNext}
                className="w-2/3 flex items-center justify-center gap-2 rounded-xl bg-primary hover:bg-primary/90 text-black font-semibold py-3 transition-all hover:scale-[1.01]"
              >
                <span>Finalizar Configuración</span>
                <Check className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
