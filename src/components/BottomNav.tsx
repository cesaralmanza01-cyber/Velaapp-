import React from 'react';
import { Calendar, Activity, MessageSquareHeart, User, Dumbbell } from 'lucide-react';

export type TabType = 'plan' | 'rutinas' | 'diagnostico' | 'chat' | 'perfil';

interface BottomNavProps {
  activeTab: TabType;
  onSelectTab: (tab: TabType) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ activeTab, onSelectTab }) => {
  const tabs = [
    { id: 'plan' as TabType, label: 'Comidas', icon: Calendar },
    { id: 'rutinas' as TabType, label: 'Rutinas', icon: Dumbbell },
    { id: 'diagnostico' as TabType, label: 'Diagnóstico', icon: Activity },
    { id: 'chat' as TabType, label: 'Lorena IA', icon: MessageSquareHeart },
    { id: 'perfil' as TabType, label: 'Perfil', icon: User },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-[#FAF6F0] border-t border-[#AEC9C0]/60 shadow-lg">
      <div className="max-w-md mx-auto px-2 flex justify-around items-center h-16">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onSelectTab(tab.id)}
              className={`flex-1 flex flex-col items-center justify-center py-1.5 px-1 rounded-xl transition-all duration-200 ${
                isActive
                  ? 'text-[#6E9E93] font-semibold scale-105'
                  : 'text-[#2E3A36]/60 hover:text-[#2E3A36]'
              }`}
            >
              <div
                className={`p-1.5 rounded-full ${
                  isActive ? 'bg-[#AEC9C0]/35 text-[#6E9E93]' : ''
                }`}
              >
                <Icon className="w-5 h-5" />
              </div>
              <span className="text-[11px] mt-0.5 tracking-tight">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
