import React, { useState } from 'react';
import { 
  ChevronDown, 
  MoreHorizontal, 
  Heart, 
  ListPlus,
  Shuffle, 
  SkipBack, 
  Play, 
  Pause, 
  SkipForward, 
  Repeat, 
  Volume2, 
  Monitor, 
  ListMusic 
} from 'lucide-react';
import VinylDisc from '../components/VinylDisc';
import AddToPlaylistModal from '../components/AddToPlaylistModal';

export default function NowPlayingScreen({
  song,
  isPlaying = false,
  currentTime = 72,
  onTogglePlay,
  onSeek,
  onPrev,
  onNext,
  onClose,
  isLiked,
  onToggleLike,
  playlists = [],
  onAddToPlaylist,
  onOpenCreatePlaylist
}) {
  const [isShuffle, setIsShuffle] = useState(false);
  const [isRepeat, setIsRepeat] = useState(false);
  const [volume, setVolume] = useState(70);
  const [isAddToPlaylistOpen, setIsAddToPlaylistOpen] = useState(false);

  if (!song) return null;

  const totalDuration = song.durationSecs || 222;
  const progressPercent = Math.min(100, Math.max(0, (currentTime / totalDuration) * 100));

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const handleScrubberClick = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const pos = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const newTime = Math.floor(pos * totalDuration);
    onSeek && onSeek(newTime);
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#0d0e11] text-white flex flex-col justify-between p-6 sm:p-8 font-sans overflow-y-auto select-none backdrop-blur-2xl">
      {/* Top Bar */}
      <div className="flex items-center justify-between max-w-md w-full mx-auto select-none pt-2">
        <button 
          onClick={onClose}
          className="p-2 -ml-2 text-neutral-400 hover:text-white transition-colors"
          aria-label="Collapse player"
        >
          <ChevronDown size={28} />
        </button>

        <div className="text-center">
          <p className="text-[10px] sm:text-xs font-bold tracking-widest text-neutral-400 uppercase">
            NOW PLAYING
          </p>
          <p className="text-xs sm:text-sm text-neutral-300 font-medium">
            Your library
          </p>
        </div>

        <button 
          className="p-2 -mr-2 text-neutral-400 hover:text-white transition-colors"
          aria-label="More options"
        >
          <MoreHorizontal size={24} />
        </button>
      </div>

      {/* Main Center Container */}
      <div className="flex-1 flex flex-col justify-around max-w-md w-full mx-auto py-6">
        {/* Giant Vinyl Record / Album Artwork */}
        <div className="w-full flex items-center justify-center my-4">
          <VinylDisc 
            size="hero" 
            thumbnail={song.thumbnail || song.img}
            bgColor={song.color || '#356e3f'} 
            isSpinning={isPlaying}
            className="w-72 h-72 sm:w-80 sm:h-80 rounded-3xl shadow-2xl"
            alt={song.name}
          />
        </div>

        {/* Title, Artist, Add to Playlist & Like */}
        <div className="flex items-center justify-between mt-4">
          <div className="truncate pr-4">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white truncate">
              {song.name}
            </h1>
            <p className="text-sm sm:text-base font-medium text-neutral-400 truncate mt-1">
              {song.artist}
            </p>
          </div>

          <div className="flex items-center space-x-1.5 flex-shrink-0">
            {/* Add to Playlist button */}
            <button
              onClick={() => setIsAddToPlaylistOpen(true)}
              className="p-2 text-neutral-400 hover:text-white transition-colors active:scale-125"
              title="Add to playlist"
              aria-label="Add to playlist"
            >
              <ListPlus size={24} />
            </button>

            {/* Like button */}
            <button
              onClick={onToggleLike}
              className={`p-2 transition-transform active:scale-125 ${
                isLiked ? 'text-rose-500' : 'text-neutral-400 hover:text-white'
              }`}
              aria-label="Like song"
            >
              <Heart 
                size={24} 
                fill={isLiked ? "currentColor" : "none"} 
                className="stroke-[2]" 
              />
            </button>
          </div>
        </div>

        {/* Scrubber / Progress Bar */}
        <div className="mt-6">
          <div 
            onClick={handleScrubberClick}
            className="w-full h-4 flex items-center cursor-pointer group"
          >
            <div className="w-full h-1.5 bg-neutral-800 rounded-full overflow-hidden relative group-hover:h-2 transition-all">
              <div 
                className="h-full bg-white rounded-full relative" 
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
          <div className="flex items-center justify-between text-xs font-medium text-neutral-400 mt-1 select-none">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(totalDuration)}</span>
          </div>
        </div>

        {/* Main Playback Controls */}
        <div className="flex items-center justify-between mt-6 px-3 select-none">
          {/* Shuffle */}
          <button 
            onClick={() => setIsShuffle(!isShuffle)}
            className={`p-2 transition-colors ${isShuffle ? 'text-green-400' : 'text-neutral-400 hover:text-white'}`}
            aria-label="Shuffle"
          >
            <Shuffle size={22} />
          </button>

          {/* Previous */}
          <button 
            onClick={onPrev}
            className="p-2 text-white hover:text-neutral-300 transition-colors active:scale-90"
            aria-label="Previous track"
          >
            <SkipBack size={28} fill="currentColor" />
          </button>

          {/* Big Play/Pause Button */}
          <button
            onClick={onTogglePlay}
            className="w-16 h-16 sm:w-18 sm:h-18 rounded-full bg-white text-black flex items-center justify-center shadow-2xl hover:scale-105 active:scale-95 transition-transform"
            aria-label={isPlaying ? "Pause" : "Play"}
          >
            {isPlaying ? (
              <Pause size={30} fill="currentColor" />
            ) : (
              <Play size={30} fill="currentColor" className="ml-1" />
            )}
          </button>

          {/* Next */}
          <button 
            onClick={onNext}
            className="p-2 text-white hover:text-neutral-300 transition-colors active:scale-90"
            aria-label="Next track"
          >
            <SkipForward size={28} fill="currentColor" />
          </button>

          {/* Repeat */}
          <button 
            onClick={() => setIsRepeat(!isRepeat)}
            className={`p-2 transition-colors ${isRepeat ? 'text-green-400' : 'text-neutral-400 hover:text-white'}`}
            aria-label="Repeat"
          >
            <Repeat size={22} />
          </button>
        </div>

        {/* Volume Slider */}
        <div className="flex items-center space-x-3 mt-8 px-2">
          <Volume2 size={20} className="text-neutral-400 flex-shrink-0" />
          <div 
            onClick={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              const val = Math.round(((e.clientX - rect.left) / rect.width) * 100);
              setVolume(Math.max(0, Math.min(100, val)));
            }}
            className="w-full h-3 flex items-center cursor-pointer"
          >
            <div className="w-full h-1 bg-neutral-800 rounded-full overflow-hidden">
              <div 
                className="h-full bg-neutral-300 rounded-full" 
                style={{ width: `${volume}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar: Device + Queue */}
      <div className="flex items-center justify-between max-w-md w-full mx-auto pt-4 pb-2 border-t border-neutral-900/80 text-xs font-medium text-neutral-400 select-none">
        <div className="flex items-center space-x-2 cursor-pointer hover:text-white transition-colors">
          <Monitor size={17} />
          <span>This device</span>
        </div>

        <button className="text-neutral-400 hover:text-white transition-colors" aria-label="Queue">
          <ListMusic size={22} />
        </button>
      </div>

      {/* Add To Playlist Modal */}
      <AddToPlaylistModal
        isOpen={isAddToPlaylistOpen}
        onClose={() => setIsAddToPlaylistOpen(false)}
        song={song}
        playlists={playlists}
        onAddToPlaylist={onAddToPlaylist}
        onOpenCreatePlaylist={onOpenCreatePlaylist}
      />
    </div>
  );
}
