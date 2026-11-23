import React, { useState } from 'react';
import { X, Check, Loader2, ListPlus, Plus } from 'lucide-react';
import VinylDisc from './VinylDisc';

export default function AddToPlaylistModal({
  isOpen,
  onClose,
  song,
  playlists = [],
  onAddToPlaylist,
  onOpenCreatePlaylist
}) {
  const [loadingPid, setLoadingPid] = useState(null);
  const [successPid, setSuccessPid] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen || !song) return null;

  const handleSelect = async (pl) => {
    const targetPid = pl._pid !== undefined ? pl._pid : pl.id;
    setLoadingPid(targetPid);
    setErrorMsg('');
    try {
      await onAddToPlaylist(targetPid, song);
      setSuccessPid(targetPid);
      setTimeout(() => {
        onClose();
        setSuccessPid(null);
      }, 900);
    } catch (err) {
      setErrorMsg(err.message || 'Failed to add song to playlist');
    } finally {
      setLoadingPid(null);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm bg-[#121318] border border-neutral-800 rounded-3xl p-5 shadow-2xl relative select-none"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3.5 border-b border-neutral-800/80">
          <div className="flex items-center space-x-2">
            <ListPlus size={19} className="text-white" />
            <h3 className="text-base font-bold text-white tracking-tight">Add to Playlist</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-white rounded-full hover:bg-neutral-800 transition-colors"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        {/* Selected Song Preview Banner */}
        <div className="flex items-center space-x-3 p-3 my-3 bg-[#181920] rounded-2xl border border-neutral-800/60">
          <VinylDisc
            size="sm"
            thumbnail={song.thumbnail || song.img}
            bgColor={song.discColor || song.color}
            className="w-11 h-11 rounded-xl flex-shrink-0 shadow-sm"
          />
          <div className="truncate flex-1">
            <p className="text-xs font-bold text-white truncate leading-tight">{song.name}</p>
            <p className="text-[11px] text-neutral-400 truncate leading-tight mt-0.5">{song.artist}</p>
          </div>
        </div>

        {errorMsg && (
          <p className="text-xs text-rose-400 font-medium px-1 mb-2">{errorMsg}</p>
        )}

        {/* Playlists List */}
        <div className="space-y-1 max-h-60 overflow-y-auto scrollbar-none my-2">
          {playlists.map((pl, idx) => {
            const playlistId = pl._pid !== undefined ? pl._pid : pl.id;
            const isLoading = loadingPid === playlistId;
            const isSuccess = successPid === playlistId;

            return (
              <button
                key={playlistId ?? idx}
                onClick={() => handleSelect(pl)}
                disabled={isLoading || isSuccess}
                className="w-full flex items-center justify-between p-2.5 rounded-xl text-left hover:bg-neutral-800/60 active:bg-neutral-800 transition-colors group disabled:opacity-80"
              >
                <div className="flex items-center space-x-3 truncate">
                  <div
                    className="w-3.5 h-3.5 rounded-full flex-shrink-0 shadow-sm"
                    style={{ backgroundColor: pl.color }}
                  />
                  <div className="truncate">
                    <p className="text-sm font-semibold text-white truncate leading-tight group-hover:text-neutral-100">
                      {pl.name}
                    </p>
                    <p className="text-[11px] text-neutral-500 truncate leading-tight mt-0.5">
                      {pl.songsCount || 0} songs · {pl.displayGenre || pl.genre}
                    </p>
                  </div>
                </div>

                <div className="flex items-center ml-2">
                  {isLoading && <Loader2 size={16} className="animate-spin text-white" />}
                  {isSuccess && <Check size={18} className="text-green-400 stroke-[3]" />}
                  {!isLoading && !isSuccess && (
                    <Plus size={16} className="text-neutral-500 group-hover:text-white transition-colors" />
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* Optional: Create New Playlist shortcut */}
        <div className="pt-3 border-t border-neutral-800/80 mt-2">
          <button
            onClick={() => {
              onClose();
              onOpenCreatePlaylist && onOpenCreatePlaylist();
            }}
            className="w-full flex items-center justify-center space-x-2 py-2.5 rounded-xl bg-neutral-800/60 hover:bg-neutral-800 text-neutral-200 text-xs font-semibold transition-colors"
          >
            <Plus size={15} />
            <span>Create New Playlist</span>
          </button>
        </div>
      </div>
    </div>
  );
}
