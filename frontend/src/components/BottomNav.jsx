import React from 'react';
import { Home, Search } from 'lucide-react';

export default function BottomNav({ activeTab = 'home', onTabChange }) {
  return (
    <nav className="w-full bg-[#0d0e11]/95 backdrop-blur-md border-t border-neutral-900/80 px-6 pt-2 pb-5 flex flex-col items-center select-none z-30">
      <div className="w-full max-w-sm flex items-center justify-around">
        {/* Home Tab */}
        <button
          onClick={() => onTabChange && onTabChange('home')}
          className={`flex flex-col items-center justify-center space-y-1 transition-colors ${
            activeTab === 'home' ? 'text-white' : 'text-neutral-500 hover:text-neutral-400'
          }`}
        >
          <Home size={22} className={activeTab === 'home' ? 'stroke-[2.2]' : 'stroke-[1.8]'} />
          <span className="text-[11px] font-medium tracking-tight">Home</span>
        </button>

        {/* Search Tab */}
        <button
          onClick={() => onTabChange && onTabChange('search')}
          className={`flex flex-col items-center justify-center space-y-1 transition-colors ${
            activeTab === 'search' ? 'text-white' : 'text-neutral-500 hover:text-neutral-400'
          }`}
        >
          <Search size={22} className={activeTab === 'search' ? 'stroke-[2.2]' : 'stroke-[1.8]'} />
          <span className="text-[11px] font-medium tracking-tight">Search</span>
        </button>
      </div>

      {/* iOS Home Indicator Bar */}
      <div className="w-32 h-1 bg-neutral-600/70 rounded-full mt-3"></div>
    </nav>
  );
}
