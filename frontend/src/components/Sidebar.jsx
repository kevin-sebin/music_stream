import React from 'react';
import { Home, Search, Disc3, Plus } from 'lucide-react';

export default function Sidebar({
  activeView,
  onNavigate,
  playlists = [],
  selectedPlaylistId,
  onSelectPlaylist,
  onOpenCreateModal
}) {
  return (
    <aside className="hidden lg:flex flex-col w-64 xl:w-72 bg-[#0a0b0f] border-r border-neutral-800/80 h-full flex-shrink-0 select-none">
      {/* Brand Header */}
      <div className="p-6 pb-4 flex items-center space-x-3">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-rose-500 to-amber-500 flex items-center justify-center shadow-lg shadow-rose-950/40">
          <Disc3 size={20} className="text-white animate-spin-slow" />
        </div>
        <div>
          <h1 className="text-base font-extrabold tracking-tight text-white leading-tight">
            Music Stream
          </h1>
          <p className="text-[11px] text-neutral-400 font-medium">Your rhythm, your vibe</p>
        </div>
      </div>

      {/* Main Navigation Links */}
      <div className="px-3 py-2 space-y-1">
        <button
          onClick={() => onNavigate('home')}
          className={`w-full flex items-center space-x-3.5 px-3.5 py-2.5 rounded-xl font-medium text-sm transition-all ${
            activeView === 'home'
              ? 'bg-neutral-800 text-white font-semibold shadow-sm'
              : 'text-neutral-400 hover:text-white hover:bg-neutral-900/60'
          }`}
        >
          <Home size={19} className={activeView === 'home' ? 'text-white' : 'text-neutral-400'} />
          <span>Home</span>
        </button>

        <button
          onClick={() => onNavigate('search')}
          className={`w-full flex items-center space-x-3.5 px-3.5 py-2.5 rounded-xl font-medium text-sm transition-all ${
            activeView === 'search'
              ? 'bg-neutral-800 text-white font-semibold shadow-sm'
              : 'text-neutral-400 hover:text-white hover:bg-neutral-900/60'
          }`}
        >
          <Search size={19} className={activeView === 'search' ? 'text-white' : 'text-neutral-400'} />
          <span>Search</span>
        </button>
      </div>

      <div className="my-3 mx-4 border-t border-neutral-800/70" />

      {/* Playlists Section */}
      <div className="flex-1 overflow-y-auto px-3 scrollbar-none">
        <div className="px-3.5 py-2 flex items-center justify-between">
          <span className="text-[11px] font-bold text-neutral-400 tracking-wider uppercase">
            Your Playlists
          </span>
          <button
            onClick={onOpenCreateModal}
            className="p-1 text-neutral-400 hover:text-white hover:bg-neutral-800 rounded-lg transition-colors"
            title="Create new playlist"
            aria-label="Create new playlist"
          >
            <Plus size={16} />
          </button>
        </div>

        <div className="space-y-1 mt-1">
          {playlists.map((pl) => {
            const isSelected = activeView === 'playlist' && selectedPlaylistId === pl._pid;
            return (
              <button
                key={pl._pid}
                onClick={() => onSelectPlaylist(pl)}
                className={`w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-left transition-all ${
                  isSelected
                    ? 'bg-neutral-800/90 text-white font-semibold'
                    : 'text-neutral-400 hover:text-white hover:bg-neutral-900/50'
                }`}
              >
                <div 
                  className="w-3.5 h-3.5 rounded-full flex-shrink-0 shadow-sm"
                  style={{ backgroundColor: pl.color }}
                />
                <div className="truncate flex-1">
                  <p className="text-sm truncate leading-tight">{pl.name}</p>
                  <p className="text-[11px] text-neutral-500 truncate leading-tight mt-0.5">
                    {pl.songsCount || 0} songs · {pl.displayGenre || pl.genre}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* User Kevin Profile Footer */}
      <div className="p-4 border-t border-neutral-800/80 bg-[#08090c]">
        <div className="flex items-center space-x-3 px-2 py-1">
          <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center font-bold text-white text-xs shadow-md">
            K
          </div>
          <div className="truncate">
            <p className="text-sm font-bold text-white truncate leading-tight">Kevin</p>
            <p className="text-[11px] text-neutral-400 truncate leading-tight mt-0.5">Premium Listener</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
