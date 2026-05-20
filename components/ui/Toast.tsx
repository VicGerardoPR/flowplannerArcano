// Premium Animated Toast & Level Up Notification System
// Developed by Arcano Intelligence

'use client';

import React from 'react';
import { useFlowStore } from '../../store/flowStore';
import { Award, Sparkles, Flame, CheckCircle, Zap, Shield } from 'lucide-react';

export default function Toast() {
  const activeNotification = useFlowStore((state) => state.activeNotification);

  if (!activeNotification) return null;

  const getIcon = () => {
    switch (activeNotification.type) {
      case 'level_up':
        return <Award className="w-6 h-6 text-primary animate-bounce" />;
      case 'achievement':
        return <Sparkles className="w-5 h-5 text-accent-violet animate-pulse" />;
      case 'habit_logged':
        return <Flame className="w-5 h-5 text-accent-blue animate-pulse" />;
      case 'success':
        return <CheckCircle className="w-5 h-5 text-primary" />;
      case 'goal_completed':
        return <Shield className="w-5 h-5 text-warning animate-spin" />;
      default:
        return <Zap className="w-5 h-5 text-primary" />;
    }
  };

  const isLevelUp = activeNotification.type === 'level_up';

  return (
    <div className="fixed top-4 right-4 z-50 max-w-sm w-full animate-slide-in">
      {isLevelUp ? (
        // Level Up Special Premium Card
        <div className="relative overflow-hidden rounded-2xl border border-primary/30 bg-black/90 p-5 shadow-2xl shadow-primary/20 backdrop-blur-md">
          {/* Neon background particles reflection */}
          <div className="absolute top-0 right-0 w-24 h-24 bg-primary/20 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-16 h-16 bg-accent-violet/20 rounded-full blur-xl pointer-events-none" />

          <div className="flex gap-4">
            <div className="flex-shrink-0 flex items-center justify-center w-12 h-12 rounded-xl bg-primary/15 border border-primary/30">
              <Award className="w-7 h-7 text-primary animate-pulse" />
            </div>
            
            <div className="space-y-1">
              <h4 className="text-sm font-extrabold uppercase tracking-widest text-primary">
                {activeNotification.message}
              </h4>
              <p className="text-xs font-semibold text-text-primary">
                {activeNotification.sub}
              </p>
              <p className="text-[10px] text-text-secondary/60">
                ¡Tu estado de Flow ha alcanzado un nuevo nivel!
              </p>
            </div>
          </div>
          
          {/* Animated bottom progress bar */}
          <div className="mt-4 h-1 bg-white/10 rounded-full overflow-hidden">
            <div className="h-full bg-primary animate-[shrink_4s_linear]" style={{ width: '100%' }} />
          </div>
        </div>
      ) : (
        // Standard Premium Glass Notification
        <div className="relative overflow-hidden rounded-xl border border-white/10 bg-[#0d1117]/85 p-4 shadow-xl backdrop-blur-md">
          <div className="flex gap-3">
            <div className="flex-shrink-0 mt-0.5">
              {getIcon()}
            </div>
            <div className="flex-1 space-y-0.5">
              <h5 className="text-xs font-extrabold tracking-wider text-text-primary uppercase">
                {activeNotification.message}
              </h5>
              <p className="text-xs text-text-secondary">
                {activeNotification.sub}
              </p>
            </div>
          </div>
          
          {/* Animated bottom timer progress bar */}
          <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-white/5">
            <div className="h-full bg-primary/80 animate-[shrink_4s_linear]" style={{ width: '100%' }} />
          </div>
        </div>
      )}
    </div>
  );
}
