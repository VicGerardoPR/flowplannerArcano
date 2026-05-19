// BottomNav - FlowPlanner Responsive Navigation Bar
// Developed by Arcano Intelligence

'use client';

import React from 'react';
import { 
  CheckSquare, Calendar, Compass, Sparkles, User, Plus 
} from 'lucide-react';

interface BottomNavProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenQuickCapture: () => void;
}

export default function BottomNav({ activeTab, setActiveTab, onOpenQuickCapture }: BottomNavProps) {
  const leftTabs = [
    { id: 'today', label: 'Hoy', icon: CheckSquare },
    { id: 'week', label: 'Semana', icon: Calendar }
  ];

  const rightTabs = [
    { id: 'month', label: 'Mes', icon: Compass },
    { id: 'ai', label: 'IA', icon: Sparkles },
    { id: 'profile', label: 'Perfil', icon: User }
  ];

  const renderTabButton = (tab: { id: string; label: string; icon: any }) => {
    const Icon = tab.icon;
    const isActive = activeTab === tab.id;

    return (
      <button
        key={tab.id}
        onClick={() => setActiveTab(tab.id)}
        className={`flex flex-col items-center justify-center flex-1 h-full py-1 text-center transition-all cursor-pointer ${
          isActive 
            ? 'text-primary' 
            : 'text-text-secondary hover:text-text-primary'
        }`}
      >
        <Icon className={`w-5 h-5 transition-all ${isActive ? 'scale-110' : 'scale-100'}`} />
        <span className="text-[9px] font-bold tracking-wider mt-1 uppercase">
          {tab.label}
        </span>
      </button>
    );
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-[#0d1117]/85 border-t border-white/5 shadow-2xl backdrop-blur-md px-4 py-2">
      <div className="relative max-w-lg mx-auto flex items-center justify-between h-14">
        
        {/* Left Side Tabs */}
        <div className="flex flex-1 items-center justify-around h-full">
          {leftTabs.map(renderTabButton)}
        </div>

        {/* Center Floating Action Button (FAB) Structural Spacer */}
        <div className="relative w-16 h-full flex items-center justify-center flex-shrink-0">
          <button
            onClick={onOpenQuickCapture}
            className="absolute -top-5 flex items-center justify-center w-12 h-12 rounded-full bg-primary hover:bg-primary/95 text-black border-4 border-[#050607] shadow-xl hover:scale-105 transition-all cursor-pointer z-50"
            aria-label="Captura Rápida"
          >
            <Plus className="w-6 h-6 stroke-[3]" />
          </button>
        </div>

        {/* Right Side Tabs */}
        <div className="flex flex-1 items-center justify-around h-full">
          {rightTabs.map(renderTabButton)}
        </div>

      </div>
    </div>
  );
}
