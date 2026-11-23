import React from 'react';
import { Play, Pause, ChevronUp, Heart } from 'lucide-react';
import VinylDisc from './VinylDisc';

export default function MiniPlayer({ currentSong, isPlaying, onTogglePlay, onOpenFullPlayer }) {
  if (!currentSong) return null;

  return (
    <div 
      onClick={onOpenFullPlayer}
      className="w-full bg-[#16171b]/95 backdrop-blur-md border border-neutral-800/80 rounded-2xl p-2.5 flex items-center justify-between shadow-2xl cursor-pointer hover:bg-[#1a1c22] transition-colors mb-2 z-20 select-none"
    >
      <div className="flex items-center space-x-3 overflow-hidden">
        <VinylDisc 
          size="sm" 
          thumbnail={currentSong.thumbnail || currentSong.img}
          bgColor={currentSong.color || '#356e3f'} 
          isSpinning={isPlaying} 
          className="w-10 h-10 rounded-lg flex-shrink-0"
          alt={currentSong.name}
        />
        <div className="truncate">
          <p className="text-sm font-semibold text-white truncate leading-tight">{currentSong.name}</p>
          <p className="text-xs text-neutral-400 truncate leading-tight mt-0.5">{currentSong.artist}</p>
        </div>
      </div>

      <div className="flex items-center space-x-2 flex-shrink-0" onClick={e => e.stopPropagation()}>
        <button
          onClick={onTogglePlay}
          className="w-9 h-9 rounded-full bg-white text-black flex items-center justify-center hover:scale-105 active:scale-95 transition-transform"
          aria-label={isPlaying ? "Pause" : "Play"}
        >
          {isPlaying ? <Pause size={18} fill="currentColor" /> : <Play size={18} fill="currentColor" className="ml-0.5" />}
        </button>
        <button
          onClick={onOpenFullPlayer}
          className="p-1.5 text-neutral-400 hover:text-white"
          aria-label="Expand player"
        >
          <ChevronUp size={20} />
        </button>
      </div>
    </div>
  );
}
