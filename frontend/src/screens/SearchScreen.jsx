import React, { useState } from 'react';
import { Search, X, ChevronRight, Play, Loader2 } from 'lucide-react';
import VinylDisc from '../components/VinylDisc';

export default function SearchScreen({
  initialQuery = '',
  onSearchSubmit,
  songs = [],
  isSearching = false,
  onSelectSong,
  currentSongId,
  isPlaying
}) {
  const [inputValue, setInputValue] = useState(initialQuery);
  const [activeQuery, setActiveQuery] = useState(initialQuery);
  const [activeFilter, setActiveFilter] = useState('Songs');
  const filters = ['Songs', 'Playlists', 'Artists'];

  const handleSubmit = (e) => {
    if (e) e.preventDefault();
    setActiveQuery(inputValue);
    onSearchSubmit && onSearchSubmit(inputValue);
  };

  const handleClear = () => {
    setInputValue('');
    setActiveQuery('');
    onSearchSubmit && onSearchSubmit('');
  };

  return (
    <div className="w-full min-h-full px-4 sm:px-6 lg:px-8 py-5 sm:py-7 flex flex-col font-sans select-none">
      {/* Top Search Input Bar (Form triggered only on Enter or submit button) */}
      <form
        onSubmit={handleSubmit}
        className="relative max-w-xl w-full flex items-center bg-[#18191f] rounded-full px-4 py-2.5 sm:py-3 border border-neutral-800 focus-within:border-neutral-500 transition-colors shadow-sm"
      >
        <button
          type="submit"
          className="text-neutral-400 hover:text-white mr-3 flex-shrink-0 transition-colors"
          title="Click or press Enter to search"
        >
          {isSearching ? (
            <Loader2 size={18} className="animate-spin text-green-400" />
          ) : (
            <Search size={18} />
          )}
        </button>

        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Search songs, artists, playlists (Press Enter)..."
          className="w-full bg-transparent text-sm sm:text-base text-white placeholder-neutral-500 focus:outline-none"
        />

        {inputValue && (
          <button
            type="button"
            onClick={handleClear}
            className="text-neutral-400 hover:text-white p-1 ml-1 flex-shrink-0 transition-colors"
            aria-label="Clear search"
          >
            <X size={16} />
          </button>
        )}
      </form>

      {/* Header Info */}
      <div className="mt-6 sm:mt-8 mb-4">
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
          Find your next favorite
        </h1>
        <p className="text-sm text-neutral-400 mt-1">
          {isSearching ? (
            <span className="text-neutral-300 animate-pulse">Searching for "{inputValue}"...</span>
          ) : (
            `Results for "${activeQuery || 'all'}"`
          )}
        </p>
      </div>

      {/* Filter Category Pills */}
      <div className="flex items-center space-x-2 mb-5">
        {filters.map((filter) => (
          <button
            key={filter}
            onClick={() => setActiveFilter(filter)}
            className={`px-4 sm:px-5 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-semibold transition-all ${activeFilter === filter
              ? 'bg-white text-black shadow-sm'
              : 'bg-neutral-800 text-neutral-300 hover:text-white hover:bg-neutral-700'
              }`}
          >
            {filter}
          </button>
        ))}
      </div>

      {/* Results Count */}
      <div className="mb-3">
        <span className="text-xs sm:text-sm font-medium text-neutral-500">
          {isSearching ? 'Searching...' : `${songs.length} songs`}
        </span>
      </div>

      {/* Songs List */}
      <div className="space-y-1 sm:space-y-1.5 max-w-4xl">
        {songs.length === 0 && !isSearching ? (
          <div className="py-16 text-center text-neutral-500 text-sm">
            No songs found matching "{activeQuery}". Try pressing Enter after typing your search.
          </div>
        ) : (
          songs.map((song, idx) => {
            const isCurrent = currentSongId === song._sid;
            return (
              <div
                key={song._sid}
                onClick={() => onSelectSong(song)}
                className={`group flex items-center justify-between p-2.5 sm:p-3 rounded-2xl cursor-pointer transition-colors ${isCurrent
                  ? 'bg-neutral-800/80 text-white border border-neutral-700/60'
                  : 'hover:bg-neutral-800/40 active:bg-neutral-800/80 border border-transparent'
                  }`}
              >
                <div className="flex items-center space-x-3.5 truncate">
                  {/* Track number on desktop */}
                  <span className="hidden sm:inline-block w-5 text-center text-xs font-semibold text-neutral-500 group-hover:text-white">
                    {idx + 1}
                  </span>

                  <VinylDisc
                    size="sm"
                    thumbnail={song.thumbnail || song.img}
                    bgColor={song.discColor || song.color}
                    isSpinning={isCurrent && isPlaying}
                    className="flex-shrink-0"
                    alt={song.name}
                  />
                  <div className="truncate">
                    <p className={`text-sm sm:text-base font-semibold tracking-tight truncate ${isCurrent ? 'text-green-400' : 'text-white group-hover:text-white'
                      }`}>
                      {song.name}
                    </p>
                    <p className="text-xs sm:text-sm text-neutral-400 truncate mt-0.5">
                      {song.artist}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-3 sm:space-x-4 flex-shrink-0 text-neutral-400 group-hover:text-neutral-200">
                  <span className="text-xs sm:text-sm font-medium">{song.duration}</span>
                  <div className="p-1 rounded-full group-hover:bg-white group-hover:text-black transition-colors">
                    <Play size={14} fill="currentColor" className="hidden sm:block ml-0.5" />
                    <ChevronRight size={18} className="sm:hidden" />
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Helper text on mobile */}
      <div className="mt-8 pb-4 text-center lg:hidden">
        <p className="text-xs text-neutral-500">
          Tap a song to open the player
        </p>
      </div>
    </div>
  );
}
