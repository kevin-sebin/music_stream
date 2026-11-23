import React, { useState, useEffect, useRef } from 'react';
import { X, Pencil, Loader2, Upload, Check, Trash2 } from 'lucide-react';
import VinylDisc from './VinylDisc';
import { uploadPlaylistThumbnail } from '../services/api';

const GENRE_SUGGESTIONS = [
  'Indie · Chill',
  'Lo-fi · Beats',
  'Acoustic · Warm',
  'Electronic · Pulse',
  'R&B · Soul',
  'Synthwave · Night'
];

export default function EditPlaylistModal({
  isOpen,
  onClose,
  playlist,
  onSave
}) {
  const [name, setName] = useState('');
  const [genre, setGenre] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (playlist && isOpen) {
      setName(playlist.name || '');
      setGenre(playlist.genre || '');
      setImageFile(null);
      setPreviewUrl(playlist.img || playlist.thumbnail || '');
      setErrorMsg('');
      setUploadStatus('');
    }
  }, [playlist, isOpen]);

  if (!isOpen || !playlist) return null;

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowed = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowed.includes(file.type)) {
      setErrorMsg('Unsupported format. Please select a JPG, PNG, or WEBP image.');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setErrorMsg('Image size exceeds 10MB limit.');
      return;
    }

    setErrorMsg('');
    setImageFile(file);
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
  };

  const handleResetImage = () => {
    setImageFile(null);
    setPreviewUrl(playlist.img || playlist.thumbnail || '');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMsg('Playlist name is required.');
      return;
    }

    setIsLoading(true);
    setErrorMsg('');

    try {
      // 1. If user selected a new cover image, upload to S3 and save thumbnail
      if (imageFile) {
        setUploadStatus('Uploading cover to S3...');
        await uploadPlaylistThumbnail(playlist._pid, imageFile);
      }

      // 2. Save playlist metadata
      setUploadStatus('Saving changes...');
      await onSave(playlist._pid, {
        name: name.trim(),
        genre: genre.trim() || 'Indie · Chill'
      });

      onClose();
    } catch (err) {
      setErrorMsg(err.message || 'Failed to update playlist');
    } finally {
      setIsLoading(false);
      setUploadStatus('');
    }
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return '';
    const kb = bytes / 1024;
    if (kb < 1024) return `${Math.round(kb)} KB`;
    return `${(kb / 1024).toFixed(1)} MB`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="w-full max-w-md bg-[#121318] border border-neutral-800 rounded-3xl p-6 shadow-2xl relative select-none"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-neutral-800/80">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-white text-black flex items-center justify-center shadow-md">
              <Pencil size={16} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight">Edit Playlist</h2>
              <p className="text-xs text-neutral-400">Update playlist details and cover</p>
            </div>
          </div>

          <button
            onClick={onClose}
            disabled={isLoading}
            className="p-1.5 text-neutral-400 hover:text-white rounded-full hover:bg-neutral-800 transition-colors"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          {/* Cover Preview & Image Upload Section (Replaced Color Picker) */}
          <div className="flex items-center space-x-4 p-3 bg-[#181920] rounded-2xl border border-neutral-800/70">
            <VinylDisc
              size="lg"
              thumbnail={previewUrl}
              bgColor={playlist.color || '#22232a'}
              className="w-20 h-20 rounded-2xl flex-shrink-0 shadow-lg border border-white/10"
              alt={name || playlist.name}
            />

            <div className="flex-1 min-w-0">
              <label className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider block mb-1">
                Playlist Thumbnail
              </label>

              {/* Hidden File Input */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleFileChange}
                className="hidden"
              />

              {imageFile ? (
                <div className="space-y-1.5">
                  <div className="flex items-center space-x-1.5 text-xs text-white truncate">
                    <Check size={14} className="text-green-400 flex-shrink-0" />
                    <span className="truncate font-medium">{imageFile.name}</span>
                    <span className="text-[10px] text-neutral-400 flex-shrink-0">
                      ({formatFileSize(imageFile.size)})
                    </span>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="text-xs font-semibold text-neutral-300 hover:text-white underline transition-colors"
                    >
                      Change
                    </button>
                    <span className="text-neutral-600 text-xs">·</span>
                    <button
                      type="button"
                      onClick={handleResetImage}
                      className="text-xs font-medium text-rose-400 hover:text-rose-300 transition-colors flex items-center space-x-1"
                    >
                      <Trash2 size={12} />
                      <span>Reset</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center space-x-2 px-3.5 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white text-xs font-semibold shadow-sm transition-colors"
                  >
                    <Upload size={14} className="text-neutral-300" />
                    <span>Upload New Cover</span>
                  </button>
                  <p className="text-[10px] text-neutral-500 mt-1">
                    JPG, PNG, or WEBP (up to 10MB)
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Playlist Name Input */}
          <div>
            <label className="text-xs font-semibold text-neutral-300 block mb-1.5">
              Playlist Name <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (errorMsg) setErrorMsg('');
              }}
              placeholder="Playlist name"
              className="w-full px-4 py-2.5 rounded-xl bg-[#1a1b22] border border-neutral-700/80 text-white placeholder-neutral-500 text-sm focus:outline-none focus:border-white transition-colors"
            />
          </div>

          {/* Genre Input & Suggestion Chips */}
          <div>
            <label className="text-xs font-semibold text-neutral-300 block mb-1.5">
              Genre or Vibe
            </label>
            <input
              type="text"
              value={genre}
              onChange={(e) => setGenre(e.target.value)}
              placeholder="e.g. Indie · Chill"
              className="w-full px-4 py-2 rounded-xl bg-[#1a1b22] border border-neutral-700/80 text-white placeholder-neutral-500 text-sm focus:outline-none focus:border-white transition-colors mb-2"
            />
            <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 scrollbar-none">
              {GENRE_SUGGESTIONS.map((g) => (
                <button
                  key={g}
                  type="button"
                  onClick={() => setGenre(g)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-medium whitespace-nowrap transition-colors ${
                    genre === g 
                      ? 'bg-neutral-200 text-black font-semibold' 
                      : 'bg-neutral-800 text-neutral-400 hover:text-white'
                  }`}
                >
                  {g}
                </button>
              ))}
            </div>
          </div>

          {/* Error Message */}
          {errorMsg && (
            <p className="text-xs text-rose-400 font-medium">{errorMsg}</p>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-end space-x-3 pt-3 border-t border-neutral-800/80">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="px-4 py-2 rounded-full text-xs font-semibold text-neutral-400 hover:text-white transition-colors"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isLoading}
              className="flex items-center space-x-1.5 px-6 py-2.5 rounded-full bg-white text-black hover:bg-neutral-200 font-bold text-xs tracking-tight shadow-lg transition-transform active:scale-95 disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  <span>{uploadStatus || 'Saving...'}</span>
                </>
              ) : (
                <span>Save Changes</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
