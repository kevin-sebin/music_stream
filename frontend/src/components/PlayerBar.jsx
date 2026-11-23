import React from 'react';
import { 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward, 
  Shuffle, 
  Repeat, 
  Volume2, 
  Heart, 
  Monitor, 
  Maximize2, 
  ListMusic 
} from 'lucide-react';
import VinylDisc from './VinylDisc';

export default function PlayerBar({
  currentSong,
  isPlaying,
  currentTime,
  onTogglePlay,
  onSeek,
  onPrev,
  onNext,
  isLiked,
  onToggleLike,
  isShuffle,
  onToggleShuffle,
  isRepeat,
  onToggleRepeat,
  volume,
  onVolumeChange,
  isRightPanelOpen,
  onToggleRightPanel,
  onOpenFullscreen
}) {
  if (!currentSong) return null;

  const totalDuration = currentSong.durationSecs || 222;
  const progressPercent = Math.min(100, Math.max(0, (currentTime / totalDuration) * 100));

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const handleSeekClick = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const pos = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    onSeek && onSeek(Math.floor(pos * totalDuration));
  };

  return (
    <footer className="hidden lg:flex items-center justify-between h-22 bg-[#0e0f14]/95 backdrop-blur-xl border-t border-neutral-800/80 px-6 z-40 select-none">
      {/* LEFT: Current Track Info */}
      <div className="flex items-center space-x-3.5 w-1/4 min-w-[200px]">
        <div 
          onClick={onOpenFullscreen}
          className="relative group cursor-pointer flex-shrink-0"
          title="Click to expand player"
        >
          <VinylDisc 
            size="sm" 
            thumbnail={currentSong.thumbnail || currentSong.img}
            bgColor={currentSong.color || '#356e3f'} 
            isSpinning={isPlaying}
            className="w-12 h-12 rounded-xl shadow-md group-hover:scale-105 transition-transform"
            alt={currentSong.name}
          />
        </div>

        <div className="truncate">
          <div className="flex items-center space-x-2">
            <h4 
              onClick={onOpenFullscreen}
              className="text-sm font-bold text-white hover:underline cursor-pointer truncate"
            >
              {currentSong.name}
            </h4>
          </div>
          <p className="text-xs text-neutral-400 truncate mt-0.5">{currentSong.artist}</p>
        </div>

        <button
          onClick={onToggleLike}
          className={`p-1.5 rounded-full transition-transform active:scale-125 ${
            isLiked ? 'text-rose-500' : 'text-neutral-400 hover:text-white'
          }`}
          aria-label="Like track"
        >
          <Heart size={18} fill={isLiked ? "currentColor" : "none"} />
        </button>
      </div>

      {/* CENTER: Playback Controls & Progress Scrubber */}
      <div className="flex flex-col items-center max-w-xl w-2/4 px-4">
        {/* Buttons */}
        <div className="flex items-center space-x-5 mb-1.5">
          <button 
            onClick={onToggleShuffle}
            className={`p-1 transition-colors ${isShuffle ? 'text-green-400' : 'text-neutral-400 hover:text-white'}`}
            title="Shuffle"
          >
            <Shuffle size={17} />
          </button>

          <button 
            onClick={onPrev}
            className="p-1 text-neutral-300 hover:text-white transition-colors active:scale-90"
            title="Previous song"
          >
            <SkipBack size={21} fill="currentColor" />
          </button>

          <button
            onClick={onTogglePlay}
            className="w-10 h-10 rounded-full bg-white text-black flex items-center justify-center hover:scale-105 active:scale-95 transition-transform shadow-lg"
            title={isPlaying ? "Pause" : "Play"}
          >
            {isPlaying ? (
              <Pause size={19} fill="currentColor" />
            ) : (
              <Play size={19} fill="currentColor" className="ml-0.5" />
            )}
          </button>

          <button 
            onClick={onNext}
            className="p-1 text-neutral-300 hover:text-white transition-colors active:scale-90"
            title="Next song"
          >
            <SkipForward size={21} fill="currentColor" />
          </button>

          <button 
            onClick={onToggleRepeat}
            className={`p-1 transition-colors ${isRepeat ? 'text-green-400' : 'text-neutral-400 hover:text-white'}`}
            title="Repeat"
          >
            <Repeat size={17} />
          </button>
        </div>

        {/* Scrubber bar */}
        <div className="w-full flex items-center space-x-2.5 text-xs text-neutral-400">
          <span className="w-9 text-right font-medium tabular-nums">{formatTime(currentTime)}</span>
          
          <div 
            onClick={handleSeekClick}
            className="flex-1 h-3 flex items-center cursor-pointer group"
          >
            <div className="w-full h-1 bg-neutral-800 rounded-full overflow-hidden relative group-hover:h-1.5 transition-all">
              <div 
                className="h-full bg-white group-hover:bg-green-400 rounded-full relative" 
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          <span className="w-9 font-medium tabular-nums">{formatTime(totalDuration)}</span>
        </div>
      </div>

      {/* RIGHT: Extra Actions & Volume */}
      <div className="flex items-center justify-end space-x-4 w-1/4 min-w-[200px] text-neutral-400">
        <div className="flex items-center space-x-1.5 text-xs hover:text-white cursor-pointer transition-colors">
          <Monitor size={15} />
          <span className="hidden xl:inline text-[11px]">This device</span>
        </div>

        <button 
          onClick={onToggleRightPanel}
          className={`p-1.5 rounded-lg transition-colors ${
            isRightPanelOpen ? 'text-white bg-neutral-800' : 'hover:text-white'
          }`}
          title="Toggle Now Playing Panel"
        >
          <ListMusic size={19} />
        </button>

        {/* Volume */}
        <div className="flex items-center space-x-2 w-28">
          <Volume2 size={17} className="flex-shrink-0" />
          <div 
            onClick={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              const val = Math.round(((e.clientX - rect.left) / rect.width) * 100);
              onVolumeChange(Math.max(0, Math.min(100, val)));
            }}
            className="w-full h-3 flex items-center cursor-pointer group"
          >
            <div className="w-full h-1 bg-neutral-800 rounded-full overflow-hidden group-hover:h-1.5 transition-all">
              <div 
                className="h-full bg-neutral-300 group-hover:bg-white rounded-full" 
                style={{ width: `${volume}%` }}
              />
            </div>
          </div>
        </div>

        <button 
          onClick={onOpenFullscreen}
          className="p-1 hover:text-white transition-colors"
          title="Full screen view"
        >
          <Maximize2 size={16} />
        </button>
      </div>
    </footer>
  );
}
