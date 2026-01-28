
import React, { useState } from 'react';
import { AppView } from './types';
import Sidebar from './components/Sidebar';
import AIChat from './components/AIChat';
import ImageGenerator from './components/ImageGenerator';
import VoiceAssistant from './components/VoiceAssistant';
import SearchGrounding from './components/SearchGrounding';

const App: React.FC = () => {
  const [activeView, setActiveView] = useState<AppView>(AppView.CHAT);

  const renderContent = () => {
    switch (activeView) {
      case AppView.CHAT:
        return <AIChat />;
      case AppView.IMAGE_GEN:
        return <ImageGenerator />;
      case AppView.VOICE_LIVE:
        return <VoiceAssistant />;
      case AppView.SEARCH:
        return <SearchGrounding />;
      default:
        return <AIChat />;
    }
  };

  return (
    <div className="flex h-screen bg-[#030712] text-gray-100 overflow-hidden">
      <Sidebar activeView={activeView} onViewChange={setActiveView} />
      
      <main className="flex-1 relative flex flex-col min-w-0 overflow-hidden">
        {/* Top Header Decor */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 z-50"></div>
        
        <header className="h-16 glass flex items-center justify-between px-8 z-40">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <i className="fas fa-sparkles text-sm"></i>
            </div>
            <h1 className="text-xl font-bold tracking-tight">
              {activeView === AppView.CHAT && "Creative Chat"}
              {activeView === AppView.IMAGE_GEN && "Imagine Studio"}
              {activeView === AppView.VOICE_LIVE && "Voice Realtime"}
              {activeView === AppView.SEARCH && "Knowledge Hub"}
            </h1>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="hidden md:flex bg-gray-900/50 rounded-full px-4 py-1.5 border border-white/5 items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
              <span className="text-xs font-medium text-gray-400">Gemini 3.0 Connected</span>
            </div>
            <button className="p-2 hover:bg-white/10 rounded-full transition-colors">
              <i className="fas fa-cog text-gray-400"></i>
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-hidden relative">
          {renderContent()}
        </div>
      </main>
    </div>
  );
};

export default App;
