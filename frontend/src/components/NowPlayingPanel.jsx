import React from 'react';
import { X, Heart, MoreHorizontal, Radio, ListMusic } from 'lucide-react';
import VinylDisc from './VinylDisc';

export default function NowPlayingPanel({
  song,
  isPlaying,
  isLiked,
  onToggleLike,
  onClose,
  playlistSongs = []
}) {
  if (!song) return null;

  return (
    <aside className="hidden xl:flex flex-col w-80 bg-[#0c0d12] border-l border-neutral-800/80 h-full flex-shrink-0 p-5 overflow-y-auto select-none">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-neutral-800/60">
        <div>
          <p className="text-[10px] font-bold tracking-widest text-neutral-400 uppercase">
            NOW PLAYING
          </p>
          <h3 className="text-sm font-bold text-white">Your library</h3>
        </div>
        <div className="flex items-center space-x-1">
          <button 
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-white rounded-lg transition-colors"
            title="Hide panel"
          >
            <X size={18} />
          </button>
        </div>
      </div>

      {/* Large Hero Vinyl Record / Artwork */}
      <div className="py-6 flex flex-col items-center">
        <VinylDisc 
          size="hero" 
          thumbnail={song.thumbnail || song.img}
          bgColor={song.color || '#356e3f'} 
          isSpinning={isPlaying}
          className="w-56 h-56 rounded-3xl shadow-2xl"
          alt={song.name}
        />

        {/* Title, Artist & Like */}
        <div className="w-full mt-5 flex items-center justify-between">
          <div className="truncate pr-3">
            <h2 className="text-lg font-extrabold text-white truncate tracking-tight">
              {song.name}
            </h2>
            <p className="text-xs font-medium text-neutral-400 truncate mt-0.5">
              {song.artist}
            </p>
          </div>
          <button
            onClick={onToggleLike}
            className={`p-2 transition-transform active:scale-125 ${
              isLiked ? 'text-rose-500' : 'text-neutral-400 hover:text-white'
            }`}
            aria-label="Like track"
          >
            <Heart size={20} fill={isLiked ? "currentColor" : "none"} />
          </button>
        </div>

        {/* Animated Sound Wave Indicator */}
        <div className="w-full flex items-center justify-between mt-4 px-3 py-2 bg-neutral-900/60 rounded-xl border border-neutral-800/60">
          <div className="flex items-center space-x-2 text-xs text-neutral-400 font-medium">
            <Radio size={14} className={isPlaying ? "text-green-400 animate-pulse" : "text-neutral-500"} />
            <span>{isPlaying ? "Live Audio Active" : "Paused"}</span>
          </div>
          <div className="flex items-end space-x-1 h-3.5">
            <div className={`w-1 bg-green-500 rounded-full ${isPlaying ? 'h-3 animate-bounce' : 'h-1'}`} />
            <div className={`w-1 bg-green-500 rounded-full ${isPlaying ? 'h-3.5 animate-pulse' : 'h-1'}`} />
            <div className={`w-1 bg-green-500 rounded-full ${isPlaying ? 'h-2 animate-bounce' : 'h-1'}`} />
            <div className={`w-1 bg-green-500 rounded-full ${isPlaying ? 'h-3.5 animate-pulse' : 'h-1'}`} />
          </div>
        </div>
      </div>

      {/* Up Next Queue Preview */}
      <div className="mt-2 pt-4 border-t border-neutral-800/60 flex-1">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-1.5 text-xs font-bold text-neutral-300">
            <ListMusic size={15} />
            <span>Up Next</span>
          </div>
          <span className="text-[11px] text-neutral-500 font-medium">Queue</span>
        </div>

        <div className="space-y-1.5">
          {playlistSongs.slice(0, 4).map((item) => (
            <div
              key={item._sid}
              className={`flex items-center space-x-2.5 p-2 rounded-xl text-xs transition-colors ${
                item._sid === song._sid ? 'bg-neutral-800/80 text-white' : 'text-neutral-400 hover:bg-neutral-900'
              }`}
            >
              <VinylDisc 
                size="sm" 
                thumbnail={item.thumbnail || item.img}
                bgColor={item.discColor || item.color} 
                className="w-7 h-7 flex-shrink-0" 
                alt={item.name}
              />
              <div className="truncate flex-1">
                <p className="font-semibold truncate text-white">{item.name}</p>
                <p className="text-[11px] text-neutral-500 truncate">{item.artist}</p>
              </div>
              <span className="text-[11px] text-neutral-500">{item.duration}</span>
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
}
