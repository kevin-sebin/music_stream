import React, { useState, useEffect } from 'react';
import { Play, Plus, LogOut } from 'lucide-react';
import VinylDisc from '../components/VinylDisc';

export default function HomeScreen({ 
  playlists = [], 
  onSelectPlaylist,
  onPlayPlaylist,
  onOpenCreateModal,
  user,
  onLogout
}) {
  const [avatarError, setAvatarError] = useState(false);

  useEffect(() => {
    setAvatarError(false);
  }, [user?.picture]);

  const fullName = user?.name || user?.email || 'Listener';
  const firstName = fullName.split(' ')[0];
  const initial = fullName.trim().charAt(0).toUpperCase() || 'U';

  return (
    <div className="w-full min-h-full px-4 sm:px-6 lg:px-8 py-5 sm:py-7 flex flex-col font-sans select-none">
      {/* Top Header greeting */}
      <div className="mb-6 sm:mb-8 flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-[11px] font-bold tracking-widest text-neutral-400 uppercase">
            YOUR MUSIC, YOUR MOMENT
          </p>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-white mt-1 truncate">
            Welcome back, {firstName}
          </h1>
          <p className="text-sm sm:text-base text-neutral-400 mt-1">
            Pick a playlist. Find your rhythm.
          </p>
        </div>

        {/* Mobile/Tablet Account Pill & Logout (Sidebar handles desktop) */}
        <div className="flex lg:hidden items-center space-x-2 flex-shrink-0 bg-neutral-900/80 border border-neutral-800/80 rounded-full pl-1.5 pr-2 py-1">
          {user?.picture && !avatarError ? (
            <img
              src={user.picture}
              alt={fullName}
              referrerPolicy="no-referrer"
              onError={() => setAvatarError(true)}
              className="w-7 h-7 rounded-full object-cover border border-neutral-700/70"
            />
          ) : (
            <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center font-bold text-white text-[11px]">
              {initial}
            </div>
          )}
          <span className="hidden sm:inline text-xs font-semibold text-neutral-200 max-w-[120px] truncate">
            {firstName}
          </span>
          {onLogout && (
            <button
              type="button"
              onClick={() => onLogout()}
              className="p-1.5 rounded-full text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
              title="Log out"
              aria-label="Log out"
            >
              <LogOut size={15} />
            </button>
          )}
        </div>
      </div>

      {/* Section title, count & Plus Button */}
      <div className="flex items-center justify-between mb-4 sm:mb-5">
        <div className="flex items-center space-x-2.5">
          <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">Your playlists</h2>
          
          {/* Plus icon to create new playlist */}
          <button
            onClick={onOpenCreateModal}
            className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white text-black hover:bg-neutral-200 flex items-center justify-center shadow-md hover:scale-105 active:scale-95 transition-transform"
            title="Create new playlist"
            aria-label="Create new playlist"
          >
            <Plus size={16} className="stroke-[2.5]" />
          </button>
        </div>

        <div className="flex items-center space-x-2.5">
          <span className="text-xs sm:text-sm font-medium text-neutral-500">
            {playlists.length} playlists
          </span>
          <button
            onClick={onOpenCreateModal}
            className="hidden sm:flex items-center space-x-1 px-3 py-1 rounded-full bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-semibold border border-neutral-700/60 transition-colors"
          >
            <Plus size={13} className="stroke-[2.5]" />
            <span>New Playlist</span>
          </button>
        </div>
      </div>

      {/* Responsive Playlist Cards Grid (2 cols on mobile, up to 6 on big screens) */}
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-6 gap-3.5 sm:gap-5">
        {playlists.map((playlist) => (
          <div
            key={playlist._pid}
            onClick={() => onSelectPlaylist(playlist)}
            className="group cursor-pointer flex flex-col p-2.5 sm:p-3 rounded-2xl bg-neutral-900/30 hover:bg-neutral-800/60 border border-neutral-800/40 hover:border-neutral-700/60 transition-all duration-300 active:scale-[0.98]"
          >
            {/* Card Artwork */}
            <div className="relative rounded-2xl overflow-hidden shadow-md group-hover:shadow-xl transition-all duration-300">
              <VinylDisc 
                size="md" 
                bgColor={playlist.color} 
                thumbnail={playlist.thumbnail || playlist.img}
                alt={playlist.name}
                className="w-full transition-transform duration-300 group-hover:scale-105"
              />

              {/* Hover Play Button (Desktop feature) */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onPlayPlaylist && onPlayPlaylist(playlist);
                }}
                className="hidden lg:flex absolute bottom-3 right-3 w-10 h-10 rounded-full bg-white text-black items-center justify-center shadow-xl opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 hover:scale-105 active:scale-95"
                title={`Play ${playlist.name}`}
              >
                <Play size={18} fill="currentColor" className="ml-0.5" />
              </button>
            </div>

            {/* Card Meta */}
            <div className="mt-3 px-0.5">
              <h3 className="text-sm sm:text-base font-bold text-white tracking-tight truncate group-hover:text-neutral-100">
                {playlist.name}
              </h3>
              <p className="text-xs sm:text-sm text-neutral-400 truncate mt-0.5">
                {playlist.songsCount || 0} songs · {playlist.displayGenre || playlist.genre}
              </p>
            </div>
          </div>
        ))}

        {/* Create New Playlist Card in Grid */}
        <div
          onClick={onOpenCreateModal}
          className="group cursor-pointer flex flex-col p-2.5 sm:p-3 rounded-2xl bg-neutral-900/20 hover:bg-neutral-900/50 border-2 border-dashed border-neutral-800 hover:border-neutral-600 transition-all duration-300 active:scale-[0.98] items-center justify-center min-h-[180px]"
        >
          <div className="w-full aspect-[4/3] rounded-2xl flex flex-col items-center justify-center bg-neutral-900/40 group-hover:bg-neutral-800/40 transition-colors">
            <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-neutral-800 group-hover:bg-white text-neutral-400 group-hover:text-black flex items-center justify-center shadow-md transition-colors">
              <Plus size={22} className="stroke-[2.5]" />
            </div>
            <span className="text-xs font-bold text-neutral-400 group-hover:text-white mt-2 transition-colors">
              New Playlist
            </span>
          </div>
          <div className="mt-3 px-0.5 text-center">
            <h3 className="text-sm font-bold text-neutral-400 group-hover:text-white transition-colors">
              Create New
            </h3>
            <p className="text-xs text-neutral-500 mt-0.5">
              Add to your library
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
