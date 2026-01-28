
import React from 'react';
import { AppView } from '../types';

interface SidebarProps {
  activeView: AppView;
  onViewChange: (view: AppView) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeView, onViewChange }) => {
  const navItems = [
    { id: AppView.CHAT, icon: 'fa-comments', label: 'Chat Assistant', color: 'text-blue-400' },
    { id: AppView.IMAGE_GEN, icon: 'fa-wand-magic-sparkles', label: 'Image Forge', color: 'text-purple-400' },
    { id: AppView.VOICE_LIVE, icon: 'fa-microphone-lines', label: 'Live Voice', color: 'text-emerald-400' },
    { id: AppView.SEARCH, icon: 'fa-globe', label: 'Smart Search', color: 'text-rose-400' },
  ];

  return (
    <aside className="w-72 glass h-full border-r border-white/5 flex flex-col p-6 hidden lg:flex">
      <div className="flex items-center gap-3 mb-10 px-2">
        <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-2xl">
          <span className="font-bold text-xl">A</span>
        </div>
        <div>
          <h2 className="text-xl font-black tracking-tighter gradient-text">AURA AI</h2>
          <p className="text-[10px] text-gray-500 font-semibold tracking-widest uppercase">Pro Studio v2.0</p>
        </div>
      </div>

      <nav className="flex-1 space-y-2">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onViewChange(item.id)}
            className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all duration-300 group ${
              activeView === item.id 
              ? 'bg-white/10 text-white shadow-inner' 
              : 'text-gray-400 hover:bg-white/5 hover:text-gray-200'
            }`}
          >
            <i className={`fas ${item.icon} text-lg ${activeView === item.id ? item.color : 'group-hover:' + item.color}`}></i>
            <span className="font-medium">{item.label}</span>
            {activeView === item.id && (
              <div className={`ml-auto w-1.5 h-1.5 rounded-full ${item.color.replace('text', 'bg')}`}></div>
            )}
          </button>
        ))}
      </nav>

      <div className="mt-auto p-4 bg-indigo-500/10 rounded-2xl border border-indigo-500/20">
        <div className="flex items-center gap-3 mb-2">
          <i className="fas fa-crown text-amber-400 text-xs"></i>
          <span className="text-xs font-bold text-indigo-300">PREMIUM ACCOUNT</span>
        </div>
        <div className="w-full bg-gray-800 h-1 rounded-full overflow-hidden">
          <div className="bg-indigo-500 h-full w-3/4"></div>
        </div>
        <p className="text-[10px] text-gray-500 mt-2">75% of compute used</p>
      </div>
    </aside>
  );
};

export default Sidebar;
