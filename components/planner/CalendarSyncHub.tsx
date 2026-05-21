// CalendarSyncHub - Premium Calendar Synchronization Center
// Developed by Arcano Intelligence

'use client';

import React, { useState } from 'react';
import { useFlowStore } from '../../store/flowStore';
import { downloadTasksAsICS } from '../../lib/calendarSync';
import { 
  Calendar, Check, Copy, Download, 
  Globe, AlertCircle, RefreshCw, LogIn, ChevronRight
} from 'lucide-react';

export default function CalendarSyncHub() {
  const profile = useFlowStore((state) => state.profile);
  const tasks = useFlowStore((state) => state.tasks);
  const updateProfile = useFlowStore((state) => state.updateProfile);
  const triggerNotification = useFlowStore((state) => state.triggerNotification);

  // Connection flow simulation states
  const [connectingService, setConnectingService] = useState<'google' | 'apple' | null>(null);
  const [step, setStep] = useState(0);
  const [copiedLink, setCopiedLink] = useState(false);
  const [isSyncingNow, setIsSyncingNow] = useState(false);

  // Form selections
  const [calendarEmail, setCalendarEmail] = useState(profile.google_calendar_email || 'mateo.arcano@gmail.com');
  const [targetList, setTargetList] = useState(profile.google_calendar_target_list || 'Principal');
  const [syncTasks, setSyncTasks] = useState(profile.sync_tasks_enabled ?? true);
  const [syncHabits, setSyncHabits] = useState(profile.sync_habits_enabled ?? false);

  const iCalUrl = `webcal://api.flowplanner.pro/feed/ical/u_demo_${profile.id.substring(0, 8)}`;

  // Start virtual OAuth flow
  const handleConnectGoogle = () => {
    setConnectingService('google');
    setStep(1);
    
    // Simulate OAuth Steps
    setTimeout(() => {
      setStep(2); // Requesting permissions...
      setTimeout(() => {
        setStep(3); // Connecting accounts...
        setTimeout(() => {
          // Finish and save to Zustand
          updateProfile({
            google_calendar_connected: true,
            google_calendar_email: calendarEmail,
            google_calendar_target_list: targetList,
            sync_tasks_enabled: syncTasks,
            sync_habits_enabled: syncHabits
          });
          setConnectingService(null);
          setStep(0);
          triggerNotification('VÍNCULO EXITOSO', 'Google Calendar se ha conectado correctamente.', 'success');
        }, 1200);
      }, 1000);
    }, 800);
  };

  const handleDisconnectGoogle = () => {
    if (window.confirm('¿Deseas desconectar tu cuenta de Google Calendar?')) {
      updateProfile({
        google_calendar_connected: false,
        google_calendar_email: null,
        google_calendar_target_list: null
      });
      triggerNotification('CUENTA DESVINCULADA', 'Se detuvo la sincronización con Google Calendar.', 'info');
    }
  };

  const handleSyncManual = () => {
    setIsSyncingNow(true);
    setTimeout(() => {
      setIsSyncingNow(false);
      const pendingCount = tasks.filter(t => t.status === 'pending').length;
      triggerNotification(
        'SINCRONIZACIÓN COMPLETA', 
        `Se sincronizaron ${pendingCount} tareas pendientes con Google Calendar.`, 
        'success'
      );
    }, 1500);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(iCalUrl);
    setCopiedLink(true);
    triggerNotification('ENLACE COPIADO', 'Dirección de suscripción iCal copiada al portapapeles.', 'success');
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleExportICS = () => {
    try {
      downloadTasksAsICS(tasks);
      triggerNotification('EXPORTACIÓN INICIADA', 'Descargando archivo flowplanner_tasks.ics...', 'success');
    } catch (error) {
      triggerNotification('ERROR', 'No se pudo generar el archivo de exportación.', 'danger');
    }
  };

  return (
    <div className="rounded-2xl glass-panel p-6 space-y-6 text-left">
      <div>
        <h3 className="text-sm font-bold uppercase tracking-wider text-text-primary flex items-center gap-1.5">
          <Calendar className="w-4 h-4 text-secondary animate-pulse" />
          <span>Conexión de Calendarios Externos</span>
        </h3>
        <p className="text-[10px] text-text-secondary mt-0.5">
          Sincroniza tus tareas, bloques de tiempo y hábitos en tiempo real con tus herramientas diarias.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* 1. GOOGLE CALENDAR CARD */}
        <div className="rounded-xl border border-white/5 bg-black/20 p-5 flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400 font-black text-sm">
                  G
                </div>
                <div>
                  <h4 className="text-xs font-bold text-text-primary">Google Calendar</h4>
                  <p className="text-[9px] text-text-secondary">Sincronización nativa bidireccional</p>
                </div>
              </div>
              
              <span className={`text-[8px] px-2 py-0.5 rounded-full font-bold uppercase ${
                profile.google_calendar_connected 
                  ? 'bg-success/20 text-success border border-success/30' 
                  : 'bg-white/5 text-text-secondary border border-white/10'
              }`}>
                {profile.google_calendar_connected ? 'Conectado' : 'Desconectado'}
              </span>
            </div>

            <p className="text-[10px] text-text-secondary/70 leading-relaxed">
              Crea bloques de tiempo y tareas en FlowPlanner y visualízalos automáticamente en tu Google Calendar. Sincronización offline-first inteligente.
            </p>

            {profile.google_calendar_connected && (
              <div className="space-y-2 border-t border-white/5 pt-3 text-[10px] text-text-secondary">
                <div className="flex justify-between">
                  <span>Cuenta:</span>
                  <span className="font-semibold text-text-primary">{profile.google_calendar_email}</span>
                </div>
                <div className="flex justify-between">
                  <span>Calendario de Destino:</span>
                  <span className="font-semibold text-text-primary">{profile.google_calendar_target_list}</span>
                </div>
                <div className="flex justify-between items-center mt-1 pt-1">
                  <span>Sincronizar Hábitos:</span>
                  <span className={syncHabits ? 'text-primary font-bold' : 'opacity-50'}>
                    {syncHabits ? 'Activado' : 'Desactivado'}
                  </span>
                </div>
              </div>
            )}
          </div>

          <div className="pt-2">
            {profile.google_calendar_connected ? (
              <div className="flex gap-2">
                <button
                  onClick={handleSyncManual}
                  disabled={isSyncingNow}
                  className="flex-1 flex items-center justify-center gap-1 bg-white/5 border border-white/10 hover:bg-white/10 text-text-primary py-2 text-xs font-bold rounded-lg transition-all cursor-pointer"
                >
                  <RefreshCw className={`w-3 h-3 ${isSyncingNow ? 'animate-spin' : ''}`} />
                  <span>{isSyncingNow ? 'Sincronizando...' : 'Sincronizar'}</span>
                </button>
                <button
                  onClick={handleDisconnectGoogle}
                  className="border border-danger/30 hover:bg-danger/10 text-danger px-3 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer"
                >
                  Desconectar
                </button>
              </div>
            ) : (
              <button
                onClick={handleConnectGoogle}
                className="w-full flex items-center justify-center gap-1.5 bg-primary hover:bg-primary/95 text-black py-2.5 text-xs font-black rounded-lg transition-all cursor-pointer"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Vincular Google Calendar</span>
              </button>
            )}
          </div>
        </div>

        {/* 2. APPLE CALENDAR (iCAL) CARD */}
        <div className="rounded-xl border border-white/5 bg-black/20 p-5 flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 font-black text-sm">
                  A
                </div>
                <div>
                  <h4 className="text-xs font-bold text-text-primary">Apple Calendar</h4>
                  <p className="text-[9px] text-text-secondary">Suscripción mediante Feed iCal / .ics</p>
                </div>
              </div>
              
              <span className="text-[8px] bg-primary/20 text-primary border border-primary/30 px-2 py-0.5 rounded-full font-bold uppercase">
                iCal Activo
              </span>
            </div>

            <p className="text-[10px] text-text-secondary/70 leading-relaxed">
              Suscríbete desde tu dispositivo Apple (iPhone, iPad, Mac) a tu feed de FlowPlanner, o descarga directamente un archivo de sincronización nativo para importar tus tareas.
            </p>

            <div className="space-y-1.5">
              <label className="block text-[9px] uppercase tracking-wider text-text-secondary font-bold">Enlace de Suscripción iCal</label>
              <div className="flex gap-1.5">
                <input
                  type="text"
                  readOnly
                  value={iCalUrl}
                  className="flex-1 rounded-lg bg-black/45 border border-white/5 px-2.5 py-1.5 text-[9px] text-text-primary/75 focus:outline-none truncate font-mono select-all"
                />
                <button
                  onClick={handleCopyLink}
                  className="p-2 bg-white/5 border border-white/10 rounded-lg text-text-secondary hover:text-text-primary transition-colors cursor-pointer"
                  title="Copiar enlace"
                >
                  {copiedLink ? <Check className="w-3.5 h-3.5 text-success" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>
          </div>

          <div className="pt-2">
            <button
              onClick={handleExportICS}
              className="w-full flex items-center justify-center gap-1.5 bg-white/10 hover:bg-white/15 border border-white/20 text-text-primary py-2.5 text-xs font-black rounded-lg transition-all cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-primary" />
              <span>Exportar Tareas (.ics)</span>
            </button>
          </div>
        </div>

      </div>

      {/* 3. SIMULATED CONNECTION OAUTH MODAL */}
      {connectingService === 'google' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#050607]/90 backdrop-blur-md">
          <div className="w-full max-w-sm rounded-2xl glass-panel-elevated p-6 text-center space-y-5 animate-in fade-in zoom-in-95 duration-200">
            
            {/* Google Logo Simulated */}
            <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 mx-auto flex items-center justify-center relative">
              <span className="text-xl font-black text-white">G</span>
              <div className="absolute inset-0 rounded-2xl border-2 border-primary border-t-transparent animate-spin" />
            </div>

            <div className="space-y-1">
              <h4 className="text-sm font-bold text-text-primary uppercase tracking-wider">Conectando Google Account</h4>
              <p className="text-[10px] text-text-secondary">Otorgando permisos de sincronización de agenda...</p>
            </div>

            <div className="bg-black/35 rounded-xl border border-white/5 p-4 text-left space-y-3">
              <div className="flex items-center gap-2.5 text-[10px] text-text-secondary">
                <div className={`w-2 h-2 rounded-full ${step >= 1 ? 'bg-primary' : 'bg-white/10'}`} />
                <span className={step >= 1 ? 'text-text-primary font-bold' : ''}>Iniciar flujo seguro OAuth 2.0</span>
              </div>
              <div className="flex items-center gap-2.5 text-[10px] text-text-secondary">
                <div className={`w-2 h-2 rounded-full ${step >= 2 ? 'bg-primary animate-pulse' : 'bg-white/10'}`} />
                <span className={step >= 2 ? 'text-text-primary font-bold' : ''}>Aprobando acceso a Calendar API</span>
              </div>
              <div className="flex items-center gap-2.5 text-[10px] text-text-secondary">
                <div className={`w-2 h-2 rounded-full ${step >= 3 ? 'bg-primary animate-pulse' : 'bg-white/10'}`} />
                <span className={step >= 3 ? 'text-text-primary font-bold' : ''}>Creando webhook e indexando tareas locales</span>
              </div>
            </div>

            <p className="text-[9px] text-text-secondary/40">
              FlowPlanner Pro utiliza APIs seguras para resguardar la privacidad de tus notas corporativas.
            </p>
          </div>
        </div>
      )}

    </div>
  );
}
