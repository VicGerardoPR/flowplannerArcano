// Master Dashboard Orchestrator - FlowPlanner
// Developed by Arcano Intelligence

'use client';

import React, { useState, useEffect } from 'react';
import { useFlowStore } from '../store/flowStore';
import TodayView from '../components/planner/TodayView';
import WeeklyView from '../components/planner/WeekView';
import MonthlyView from '../components/planner/MonthView';
import BrainView from '../components/ai/AiChat';
import ProfileView from '../components/planner/ProfileView';
import BottomNav from '../components/planner/BottomNav';
import QuickCapture from '../components/planner/QuickCapture';
import { Sparkles, Bell, Calendar, User, CheckCircle, Zap } from 'lucide-react';

export default function Home() {
  const [activeTab, setActiveTab] = useState('today');
  const [isQuickCaptureOpen, setIsQuickCaptureOpen] = useState(false);
  const [domHydrated, setDomHydrated] = useState(false);

  const profile = useFlowStore((state) => state.profile);
  const activeNotification = useFlowStore((state) => state.activeNotification);
  const clearActiveNotification = useFlowStore((state) => state.clearActiveNotification);

  // Avoid Next.js hydration issues with local storage
  useEffect(() => {
    const handle = requestAnimationFrame(() => setDomHydrated(true));
    return () => cancelAnimationFrame(handle);
  }, []);

  // Auto dismiss notifications after 3.5s
  useEffect(() => {
    if (activeNotification) {
      const timer = setTimeout(() => {
        clearActiveNotification();
      }, 3500);
      return () => clearTimeout(timer);
    }
  }, [activeNotification, clearActiveNotification]);

  if (!domHydrated) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#050607] text-text-primary">
        <div className="relative w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center">
          <div className="absolute inset-0 rounded-2xl border-2 border-primary border-t-transparent animate-spin" />
          <Sparkles className="w-6 h-6 text-primary animate-pulse" />
        </div>
        <span className="text-xs font-bold uppercase tracking-widest text-text-secondary mt-4 animate-pulse">
          Sincronizando Flow...
        </span>
      </div>
    );
  }

  const renderActiveView = () => {
    switch (activeTab) {
      case 'today':
        return <TodayView />;
      case 'week':
        return <WeeklyView />;
      case 'month':
        return <MonthlyView />;
      case 'ai':
        return <BrainView />;
      case 'profile':
        return <ProfileView />;
      default:
        return <TodayView />;
    }
  };

  return (
    <div className="min-h-screen bg-[#050607] text-text-primary flex flex-col selection:bg-primary selection:text-black">
      
      {/* GLOW DECORATIONS */}
      <div className="fixed top-0 left-1/4 -translate-x-1/2 w-[400px] h-[400px] bg-primary/5 rounded-full blur-[120px] pointer-events-none flow-glow z-0" />
      <div className="fixed top-1/3 right-10 w-[300px] h-[300px] bg-accent-violet/5 rounded-full blur-[100px] pointer-events-none flow-glow z-0" />

      {/* TOP HEADER */}
      <header className="sticky top-0 z-30 bg-[#050607]/80 backdrop-blur-md border-b border-white/5 px-4 py-3">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          
          {/* Brand Identity */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-primary to-accent-blue p-0.5 flex items-center justify-center shadow-lg">
              <div className="w-full h-full bg-[#050607] rounded-[7px] flex items-center justify-center">
                <span className="text-sm font-extrabold text-primary tracking-tighter">F</span>
              </div>
            </div>
            <div>
              <h1 className="text-sm font-black uppercase tracking-widest text-text-primary flex items-center gap-1.5">
                <span>FlowPlanner</span>
                <span className="text-[8px] bg-primary/20 text-primary px-1.5 py-0.5 rounded font-bold uppercase">PRO</span>
              </h1>
              <p className="text-[8px] text-text-secondary tracking-wider uppercase font-semibold">Organizador de Alto Rendimiento</p>
            </div>
          </div>

          {/* Sparkle rewards tracker */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 bg-primary/10 border border-primary/20 rounded-full px-3 py-1">
              <Zap className="w-3.5 h-3.5 text-primary fill-primary animate-pulse" />
              <span className="text-xs font-black text-primary">{profile.xp} <span className="text-[9px] font-bold text-primary/70">XP</span></span>
            </div>
          </div>

        </div>
      </header>

      {/* MAIN VIEWPORT */}
      <main className="flex-1 w-full max-w-4xl mx-auto px-4 pt-6 z-10 relative">
        {renderActiveView()}
      </main>

      {/* FOOTER METADATA (SUBTLE COMPLYING WITH IDENTITY RULES) */}
      <footer className="w-full text-center pb-28 pt-8 border-t border-white/5 text-[9px] text-text-secondary/40 select-none z-10">
        <p>© 2026 FlowPlanner Premium. Todos los derechos reservados.</p>
        <p className="mt-0.5 font-medium tracking-wider">TECNOLOGÍA DE ENFOQUE PROPORCIONADA POR ARCANO INTELLIGENCE</p>
      </footer>

      {/* DYNAMIC TOAST NOTIFICATION CARD */}
      {activeNotification && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 w-full max-w-xs px-4 animate-bounce">
          <div className="rounded-xl border border-primary/30 bg-[#0d1117]/95 shadow-2xl p-3 flex items-center gap-3 backdrop-blur-md">
            <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center text-primary flex-shrink-0">
              <CheckCircle className="w-5 h-5 animate-pulse" />
            </div>
            <div className="min-w-0 flex-1 text-left">
              <h4 className="text-[10px] font-bold text-primary uppercase tracking-wider">{activeNotification.message}</h4>
              <p className="text-[9px] text-text-secondary truncate">{activeNotification.sub}</p>
            </div>
          </div>
        </div>
      )}

      {/* BOTTOM BAR NAVIGATION */}
      <BottomNav 
        activeTab={activeTab} 
        setActiveTab={setActiveTab}
        onOpenQuickCapture={() => setIsQuickCaptureOpen(true)}
      />

      {/* NLP MODAL POPUP */}
      <QuickCapture 
        isOpen={isQuickCaptureOpen} 
        onClose={() => setIsQuickCaptureOpen(false)}
      />

    </div>
  );
}
