import React, { useState } from 'react';
import { 
  ChevronLeft, 
  MoreHorizontal, 
  Play, 
  Shuffle, 
  ArrowDownToLine, 
  ChevronRight,
  Clock,
  Pencil,
  Trash2
} from 'lucide-react';
import VinylDisc from '../components/VinylDisc';
import EditPlaylistModal from '../components/EditPlaylistModal';
import ConfirmModal from '../components/ConfirmModal';
import { formatPlaylistDuration, formatPlaylistDate } from '../services/api';

export default function PlaylistDetailScreen({
  playlist,
  songs = [],
  onBack,
  onPlaySong,
  onPlayAll,
  onUpdatePlaylist,
  onDeletePlaylist,
  onRemoveSong,
  currentSongId,
  isPlaying
}) {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeletePlaylistOpen, setIsDeletePlaylistOpen] = useState(false);
  const [songToDelete, setSongToDelete] = useState(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  if (!playlist) return null;

  return (
    <div className="w-full min-h-full px-4 sm:px-6 lg:px-8 py-4 sm:py-7 flex flex-col font-sans select-none relative">
      {/* Top Mobile Bar */}
      <div className="flex items-center justify-between pb-3 sm:pb-4 lg:hidden relative">
        <button 
          onClick={onBack}
          className="p-1.5 -ml-1 text-neutral-300 hover:text-white transition-colors"
          aria-label="Back to home"
        >
          <ChevronLeft size={24} />
        </button>

        <span className="text-xs font-bold tracking-widest text-neutral-300 uppercase">
          PLAYLIST
        </span>

        <div className="relative">
          <button 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="p-1.5 -mr-1 text-neutral-300 hover:text-white transition-colors"
            aria-label="Options"
          >
            <MoreHorizontal size={22} />
          </button>

          {/* Mobile Options Dropdown */}
          {isMenuOpen && (
            <div className="absolute right-0 top-9 w-44 bg-[#181920] border border-neutral-700/80 rounded-2xl shadow-2xl py-1.5 z-30 animate-in fade-in zoom-in-95 duration-150">
              <button
                onClick={() => {
                  setIsMenuOpen(false);
                  setIsEditModalOpen(true);
                }}
                className="w-full flex items-center space-x-2.5 px-3.5 py-2 text-xs font-semibold text-neutral-300 hover:text-white hover:bg-neutral-800 text-left transition-colors"
              >
                <Pencil size={15} />
                <span>Edit Playlist</span>
              </button>
              <button
                onClick={() => {
                  setIsMenuOpen(false);
                  setIsDeletePlaylistOpen(true);
                }}
                className="w-full flex items-center space-x-2.5 px-3.5 py-2 text-xs font-semibold text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 text-left transition-colors"
              >
                <Trash2 size={15} />
                <span>Delete Playlist</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Playlist Hero Section */}
      <div className="flex flex-col sm:flex-row items-center sm:items-end space-y-4 sm:space-y-0 sm:space-x-6 pb-6 border-b border-neutral-800/60">
        {/* Cover Art */}
        <VinylDisc 
          size="lg" 
          bgColor={playlist.color || '#923c38'} 
          thumbnail={playlist.thumbnail || playlist.img}
          alt={playlist.name}
          className="w-32 h-32 sm:w-44 sm:h-44 md:w-52 md:h-52 rounded-2xl sm:rounded-3xl flex-shrink-0 shadow-2xl"
        />

        {/* Hero Meta */}
        <div className="text-center sm:text-left flex-1 min-w-0">
          <p className="text-[11px] sm:text-xs font-bold tracking-wider text-neutral-400 uppercase">
            YOUR PLAYLIST
          </p>
          <h1 className="text-2xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-white mt-1 leading-tight truncate">
            {playlist.name}
          </h1>
          <p className="text-xs sm:text-sm font-medium text-neutral-400 mt-1.5">
            {playlist.genre || 'Indie · Chill'}
          </p>
          <p className="text-xs sm:text-sm text-neutral-400 mt-0.5">
            {Array.isArray(songs) ? songs.length : (playlist.songsCount || 0)} {((Array.isArray(songs) ? songs.length : playlist.songsCount) === 1) ? 'song' : 'songs'} · {formatPlaylistDuration(songs)}
          </p>
          <p className="text-[11px] sm:text-xs text-neutral-500 mt-2">
            Created {formatPlaylistDate(playlist.created_at) || playlist.createdAtDisplay || 'Recently'}
          </p>
        </div>
      </div>

      {/* Action Buttons Row */}
      <div className="flex items-center space-x-3 sm:space-x-4 my-5 sm:my-6 flex-wrap gap-y-3">
        {/* Play all button (Starts playing from 1st song & opens player) */}
        <button
          onClick={() => onPlayAll && onPlayAll(songs, false)}
          className="flex items-center justify-center space-x-2 py-3 px-7 bg-white hover:bg-neutral-200 text-black font-bold text-sm sm:text-base rounded-full shadow-lg transition-transform active:scale-[0.98]"
          title="Play from first track"
        >
          <Play size={19} fill="currentColor" className="ml-0.5" />
          <span>Play all</span>
        </button>

        {/* Shuffle */}
        <button 
          onClick={() => onPlayAll && onPlayAll(songs, true)}
          className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-neutral-800/80 hover:bg-neutral-700 text-neutral-200 flex items-center justify-center transition-colors active:scale-95 shadow-md"
          aria-label="Shuffle playlist"
          title="Shuffle and play"
        >
          <Shuffle size={19} />
        </button>

        {/* Download */}
        <button 
          className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-neutral-800/80 hover:bg-neutral-700 text-neutral-200 flex items-center justify-center transition-colors active:scale-95 shadow-md"
          aria-label="Download playlist"
          title="Download"
        >
          <ArrowDownToLine size={19} />
        </button>

        {/* Edit Playlist Button */}
        <button 
          onClick={() => setIsEditModalOpen(true)}
          className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-neutral-800/80 hover:bg-neutral-700 text-neutral-300 hover:text-white flex items-center justify-center transition-colors active:scale-95 shadow-md border border-neutral-700/60"
          title="Edit playlist name, genre or cover"
          aria-label="Edit playlist"
        >
          <Pencil size={18} />
        </button>

        {/* Delete Playlist Button */}
        <button 
          onClick={() => setIsDeletePlaylistOpen(true)}
          className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-neutral-800/80 hover:bg-rose-500/20 text-neutral-400 hover:text-rose-400 border border-neutral-700/60 hover:border-rose-500/30 flex items-center justify-center transition-colors active:scale-95 shadow-md"
          title="Delete this playlist"
          aria-label="Delete playlist"
        >
          <Trash2 size={18} />
        </button>
      </div>

      {/* Songs Section Header */}
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">Songs</h2>
        <span className="text-xs sm:text-sm font-medium text-neutral-500">
          {songs.length} tracks
        </span>
      </div>

      {/* Desktop Table Headers */}
      <div className="hidden sm:grid grid-cols-12 gap-4 px-3 py-2 text-xs font-semibold text-neutral-500 border-b border-neutral-800/50 uppercase tracking-wider mb-1">
        <div className="col-span-1">#</div>
        <div className="col-span-6">Title</div>
        <div className="col-span-3">Artist</div>
        <div className="col-span-2 text-right flex items-center justify-end space-x-1">
          <Clock size={13} />
          <span>Duration</span>
        </div>
      </div>

      {/* Song List */}
      <div className="space-y-1 sm:space-y-0.5">
        {songs.length === 0 ? (
          <div className="py-12 text-center text-neutral-500 text-sm">
            This playlist has no songs yet. Search for songs or use "Add to playlist" from the player!
          </div>
        ) : (
          songs.map((song, idx) => {
            const isCurrent = currentSongId === song._sid;
            return (
              <div
                key={song._sid || idx}
                onClick={() => onPlaySong && onPlaySong(song, songs)}
                className={`group flex sm:grid sm:grid-cols-12 items-center sm:gap-4 p-2.5 sm:p-3 rounded-2xl cursor-pointer transition-colors ${
                  isCurrent 
                    ? 'bg-neutral-800/80 text-white' 
                    : 'hover:bg-neutral-800/40 active:bg-neutral-800/70'
                }`}
              >
                {/* # on desktop */}
                <div className="hidden sm:flex col-span-1 items-center">
                  <span className={`text-xs font-semibold ${isCurrent ? 'text-green-400' : 'text-neutral-500 group-hover:hidden'}`}>
                    {idx + 1}
                  </span>
                  <Play size={13} fill="currentColor" className="hidden group-hover:block text-white" />
                </div>

                {/* Title & Mobile layout */}
                <div className="col-span-6 flex items-center space-x-3.5 truncate flex-1 sm:flex-none">
                  <VinylDisc 
                    size="sm" 
                    thumbnail={song.thumbnail || song.img}
                    bgColor={song.discColor || song.color} 
                    isSpinning={isCurrent && isPlaying}
                    className="flex-shrink-0"
                    alt={song.name}
                  />
                  <div className="truncate">
                    <p className={`text-sm sm:text-base font-semibold tracking-tight truncate ${
                      isCurrent ? 'text-green-400' : 'text-white'
                    }`}>
                      {song.name}
                    </p>
                    <p className="text-xs text-neutral-400 truncate sm:hidden mt-0.5">
                      {song.artist}
                    </p>
                  </div>
                </div>

                {/* Artist on desktop */}
                <div className="hidden sm:block col-span-3 text-sm text-neutral-400 truncate">
                  {song.artist}
                </div>

                {/* Duration & Delete button on desktop & mobile */}
                <div className="col-span-2 flex items-center justify-end space-x-2 text-neutral-400 text-xs sm:text-sm font-medium">
                  <span>{song.duration}</span>
                  
                  {/* Delete song from playlist button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSongToDelete(song);
                    }}
                    className="p-1.5 rounded-full text-neutral-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                    title="Remove from playlist"
                    aria-label="Remove song from playlist"
                  >
                    <Trash2 size={16} />
                  </button>

                  <ChevronRight size={16} className="sm:hidden text-neutral-500" />
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Edit Playlist Modal */}
      <EditPlaylistModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        playlist={playlist}
        onSave={onUpdatePlaylist}
      />

      {/* Delete Playlist Confirmation Modal */}
      <ConfirmModal
        isOpen={isDeletePlaylistOpen}
        onClose={() => setIsDeletePlaylistOpen(false)}
        onConfirm={() => onDeletePlaylist(playlist._pid)}
        title="Delete Playlist?"
        message={`Are you sure you want to delete "${playlist.name}"? This will permanently delete the playlist.`}
        confirmText="Delete Playlist"
      />

      {/* Remove Song Confirmation Modal */}
      <ConfirmModal
        isOpen={Boolean(songToDelete)}
        onClose={() => setSongToDelete(null)}
        onConfirm={() => onRemoveSong(playlist._pid, songToDelete._sid)}
        title="Remove Song from Playlist?"
        message={`Remove "${songToDelete?.name}" from "${playlist.name}"?`}
        confirmText="Remove Song"
      />
    </div>
  );
}
