import React, { useState, useEffect, useRef } from 'react';
import {
  fetchPlaylists,
  fetchPlaylistSongs,
  searchSongsAPI,
  createPlaylistAPI,
  addSongToPlaylistAPI,
  updatePlaylistAPI,
  deletePlaylistAPI,
  removeSongFromPlaylistAPI,
  uploadPlaylistThumbnail,
  formatPlaylistDuration
} from './services/api';
import { INITIAL_SONGS } from './data/musicData';
import { synth } from './services/audioPlayer';
import { useAuth } from './context/AuthContext';

import Sidebar from './components/Sidebar';
import PlayerBar from './components/PlayerBar';
import NowPlayingPanel from './components/NowPlayingPanel';
import BottomNav from './components/BottomNav';
import MiniPlayer from './components/MiniPlayer';
import CreatePlaylistModal from './components/CreatePlaylistModal';

import LoginScreen from './screens/LoginScreen';
import HomeScreen from './screens/HomeScreen';
import SearchScreen from './screens/SearchScreen';
import PlaylistDetailScreen from './screens/PlaylistDetailScreen';
import NowPlayingScreen from './screens/NowPlayingScreen';

export default function App() {
  const {
    user,
    isAuthenticated,
    isLoading,
    authError,
    loginWithGoogle,
    logout,
    clearAuthError
  } = useAuth();

  if (isLoading || !isAuthenticated) {
    return (
      <LoginScreen
        onGoogleLogin={loginWithGoogle}
        isVerifyingSession={isLoading}
        error={authError}
        onDismissError={clearAuthError}
      />
    );
  }

  return <AuthenticatedMusicApp key={user.id} user={user} onLogout={logout} />;
}

function AuthenticatedMusicApp({ user, onLogout }) {
  const audioRef = useRef(null);

  // Navigation View: 'home' | 'search' | 'playlist'
  const [activeView, setActiveView] = useState('home');

  // Fullscreen player modal (for mobile or expanded view)
  const [isNowPlayingOpen, setIsNowPlayingOpen] = useState(false);

  // Desktop right-hand Now Playing panel toggle
  const [isRightPanelOpen, setIsRightPanelOpen] = useState(true);

  // Create playlist modal toggle
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Playlists and Songs state (populated for the authenticated user)
  const [playlists, setPlaylists] = useState([]);
  const [selectedPlaylist, setSelectedPlaylist] = useState(null);
  const [playlistSongs, setPlaylistSongs] = useState([]);
  const [playbackQueue, setPlaybackQueue] = useState([]);

  // Search state (only triggered on Enter / submit)
  const [searchQuery, setSearchQuery] = useState('night');
  const [searchResults, setSearchResults] = useState(INITIAL_SONGS.slice(0, 6));
  const [isSearching, setIsSearching] = useState(false);

  // Playback state
  const [currentSong, setCurrentSong] = useState(INITIAL_SONGS[0]); // "Night Drive"
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(72); // 1:12
  const [isLiked, setIsLiked] = useState(false);
  const [isShuffle, setIsShuffle] = useState(false);
  const [isRepeat, setIsRepeat] = useState(false);
  const [volume, setVolume] = useState(75);

  // Ensure audio stops cleanly when logging out / unmounting
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      synth.stop();
    };
  }, []);

  // Load authenticated user's playlists and initial playlist songs from backend
  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      try {
        const loaded = await fetchPlaylists();
        if (!isMounted) return;
        setPlaylists(loaded);
        if (loaded.length > 0) {
          setSelectedPlaylist(loaded[0]);
          const songs = await fetchPlaylistSongs(loaded[0]._pid);
          if (!isMounted) return;
          setPlaylistSongs(songs);
          setPlaybackQueue(songs);
        } else {
          setSelectedPlaylist(null);
          setPlaylistSongs([]);
          setPlaybackQueue([]);
        }
      } catch (err) {
        if (err?.status === 401) return;
        console.warn('Failed to load user playlists:', err.message);
      }
    }
    loadData();
    return () => {
      isMounted = false;
    };
  }, [user?.id]);

  // Search songs only when explicitly submitted (e.g. Enter pressed)
  const executeSearch = async (query) => {
    setSearchQuery(query);
    setIsSearching(true);
    try {
      const results = await searchSongsAPI(query);
      setSearchResults(results);
    } finally {
      setIsSearching(false);
    }
  };

  // Handle actual audio streaming playback & fallback synthesizer
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.volume = volume / 100;

    if (isPlaying) {
      if (currentSong?.url && (currentSong.url.startsWith('http') || currentSong.url.startsWith('/'))) {
        if (audio.src !== currentSong.url) {
          audio.src = currentSong.url;
          audio.currentTime = currentTime || 0;
        }
        audio.play().catch(() => {
          // If streaming endpoint not ready or blocked, fall back to chill synth
          synth.playChillBeat();
        });
      } else {
        synth.playChillBeat();
      }
    } else {
      audio.pause();
      synth.stop();
    }
  }, [isPlaying, currentSong]);

  // Audio timer ticker (if no real audio stream is playing)
  useEffect(() => {
    let interval = null;
    if (isPlaying) {
      interval = setInterval(() => {
        if (audioRef.current && !audioRef.current.paused && audioRef.current.duration) {
          // Handled by native onTimeUpdate
        } else {
          setCurrentTime((prev) => {
            const total = currentSong?.durationSecs || 222;
            if (prev >= total) {
              handleNextSong();
              return 0;
            }
            return prev + 1;
          });
        }
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isPlaying, currentSong, playbackQueue, isShuffle, isRepeat]);

  // Handlers
  const handleTogglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  const handlePlaySong = (song) => {
    setCurrentSong(song);
    setCurrentTime(0);
    setIsPlaying(true);
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
    }
  };

  const handleSeek = (newTime) => {
    setCurrentTime(newTime);
    if (audioRef.current && !isNaN(audioRef.current.duration)) {
      audioRef.current.currentTime = newTime;
    }
  };

  const handlePlayPlaylist = async (playlist) => {
    setSelectedPlaylist(playlist);
    try {
      const songs = await fetchPlaylistSongs(playlist._pid);
      setPlaylistSongs(songs);
      setPlaybackQueue(songs);
      if (songs && songs.length > 0) {
        handlePlaySong(songs[0]);
        setIsNowPlayingOpen(true);
      }
    } catch (err) {
      if (err?.status === 401) return;
      console.warn('Failed to play playlist:', err.message);
    }
  };

  const handleSelectPlaylist = async (playlist) => {
    setSelectedPlaylist(playlist);
    try {
      const songs = await fetchPlaylistSongs(playlist._pid);
      setPlaylistSongs(songs);
      setPlaybackQueue(songs);
      const durationText = formatPlaylistDuration(songs);
      setSelectedPlaylist(prev => prev ? { ...prev, songsCount: songs.length, durationText } : prev);
      setPlaylists(prev => prev.map(p => p._pid === playlist._pid ? { ...p, songsCount: songs.length, durationText } : p));
      setActiveView('playlist');
    } catch (err) {
      if (err?.status === 401) return;
      console.warn('Failed to load playlist songs:', err.message);
    }
  };

  const handlePlayAll = (songs, shuffleMode = false) => {
    if (!songs || songs.length === 0) return;
    setPlaybackQueue(songs);
    setIsShuffle(shuffleMode);

    let firstTrack = songs[0];
    if (shuffleMode && songs.length > 1) {
      const randomIndex = Math.floor(Math.random() * songs.length);
      firstTrack = songs[randomIndex];
    }

    handlePlaySong(firstTrack);
    setIsNowPlayingOpen(true);
  };

  const handlePrevSong = () => {
    const list = playbackQueue.length > 0 ? playbackQueue : (playlistSongs.length > 0 ? playlistSongs : INITIAL_SONGS);
    if (!list || list.length === 0) return;
    const currentIndex = list.findIndex(s => s._sid === currentSong?._sid);
    const prevIndex = (currentIndex - 1 + list.length) % list.length;
    handlePlaySong(list[prevIndex]);
  };

  const handleNextSong = () => {
    const list = playbackQueue.length > 0 ? playbackQueue : (playlistSongs.length > 0 ? playlistSongs : INITIAL_SONGS);
    if (!list || list.length === 0) return;

    if (isRepeat) {
      handlePlaySong(currentSong);
      return;
    }

    const currentIndex = list.findIndex(s => s._sid === currentSong?._sid);
    let nextIndex;
    if (isShuffle && list.length > 1) {
      do {
        nextIndex = Math.floor(Math.random() * list.length);
      } while (nextIndex === currentIndex && list.length > 1);
    } else {
      nextIndex = (currentIndex + 1) % list.length;
    }

    handlePlaySong(list[nextIndex]);
  };

  const handleCreatePlaylist = async (playlistData, imageFile) => {
    try {
      // 1. Directly hits backend POST /playlists
      const res = await createPlaylistAPI({ ...playlistData, img: '' });

      // 2. Re-fetch playlists from backend
      const updated = await fetchPlaylists();
      setPlaylists(updated);

      let createdPid = res?._pid;
      if (createdPid === undefined) {
        const found = updated.find(p => p.name.toLowerCase() === playlistData.name.toLowerCase()) || updated[updated.length - 1];
        if (found) createdPid = found._pid;
      }

      // 3. If imageFile was provided, upload thumbnail directly to Amazon S3
      if (imageFile && createdPid !== undefined) {
        await uploadPlaylistThumbnail(createdPid, imageFile);
        const refreshed = await fetchPlaylists();
        setPlaylists(refreshed);
        const created = refreshed.find(p => p._pid === Number(createdPid)) || refreshed[refreshed.length - 1];
        if (created) {
          setSelectedPlaylist(created);
          setPlaylistSongs([]);
          setActiveView('playlist');
          return;
        }
      }

      // 4. Select newly created playlist
      const created = updated.find(p => p.name.toLowerCase() === playlistData.name.toLowerCase()) || updated[updated.length - 1];
      if (created) {
        setSelectedPlaylist(created);
        setPlaylistSongs([]);
        setActiveView('playlist');
      }
    } catch (err) {
      if (err?.status === 401) return;
      throw err;
    }
  };

  const handleAddToPlaylist = async (pid, song) => {
    try {
      // 1. Directly hit backend POST /playlists/{pid} with pid in header and body data
      await addSongToPlaylistAPI(pid, song);

      // 2. Re-fetch playlists to update song counts
      const updatedPlaylists = await fetchPlaylists();
      setPlaylists(updatedPlaylists);

      // 3. Always refresh songs if currently viewing this playlist
      const songs = await fetchPlaylistSongs(pid);
      if (selectedPlaylist?._pid === Number(pid)) {
        setPlaylistSongs(songs);
        const durationText = formatPlaylistDuration(songs);
        setSelectedPlaylist(prev => prev ? { ...prev, songsCount: songs.length, durationText } : prev);
      }
    } catch (err) {
      if (err?.status === 401) return;
      throw err;
    }
  };

  const handleUpdatePlaylist = async (pid, data) => {
    try {
      await updatePlaylistAPI(pid, data);
      const updated = await fetchPlaylists();
      setPlaylists(updated);
      const current = updated.find(p => p._pid === Number(pid));
      if (current) setSelectedPlaylist(current);
    } catch (err) {
      if (err?.status === 401) return;
      throw err;
    }
  };

  const handleDeletePlaylist = async (pid) => {
    try {
      await deletePlaylistAPI(pid);
      const updated = await fetchPlaylists();
      setPlaylists(updated);
      if (updated.length > 0) {
        setSelectedPlaylist(updated[0]);
      } else {
        setSelectedPlaylist(null);
        setPlaylistSongs([]);
      }
      setActiveView('home');
    } catch (err) {
      if (err?.status === 401) return;
      console.warn('Backend delete playlist error:', err.message);
      throw err;
    }
  };

  const handleRemoveSongFromPlaylist = async (pid, sid) => {
    try {
      await removeSongFromPlaylistAPI(pid, sid);
      const songs = await fetchPlaylistSongs(pid);
      setPlaylistSongs(songs);
      const updated = await fetchPlaylists();
      setPlaylists(updated);
      if (selectedPlaylist?._pid === Number(pid)) {
        const durationText = formatPlaylistDuration(songs);
        setSelectedPlaylist(prev => prev ? { ...prev, songsCount: songs.length, durationText } : prev);
      }
    } catch (err) {
      if (err?.status === 401) return;
      console.warn('Backend remove song error:', err.message);
      throw err;
    }
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#07080a] text-white font-sans antialiased">
      {/* 1. DESKTOP / LAPTOP SIDEBAR */}
      <Sidebar
        activeView={activeView}
        onNavigate={(view) => setActiveView(view)}
        playlists={playlists}
        selectedPlaylistId={selectedPlaylist?._pid}
        onSelectPlaylist={handleSelectPlaylist}
        onOpenCreateModal={() => setIsCreateModalOpen(true)}
        user={user}
        onLogout={onLogout}
      />

      {/* 2. MAIN CENTER CONTENT AREA */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden relative">
        {/* Scrollable Screen Content */}
        <main className="flex-1 overflow-y-auto scrollbar-none pb-24 lg:pb-6">
          {activeView === 'home' && (
            <HomeScreen
              playlists={playlists}
              onSelectPlaylist={handleSelectPlaylist}
              onPlayPlaylist={handlePlayPlaylist}
              onOpenCreateModal={() => setIsCreateModalOpen(true)}
              user={user}
              onLogout={onLogout}
            />
          )}

          {activeView === 'search' && (
            <SearchScreen
              initialQuery={searchQuery}
              onSearchSubmit={executeSearch}
              songs={searchResults}
              isSearching={isSearching}
              onSelectSong={(song) => {
                handlePlaySong(song);
                // On mobile, also expand player
                if (window.innerWidth < 1024) {
                  setIsNowPlayingOpen(true);
                }
              }}
              currentSongId={currentSong?._sid}
              isPlaying={isPlaying}
            />
          )}

          {activeView === 'playlist' && (
            <PlaylistDetailScreen
              playlist={selectedPlaylist}
              songs={playlistSongs}
              onBack={() => setActiveView('home')}
              onPlaySong={(song, queue) => {
                if (queue && queue.length > 0) {
                  setPlaybackQueue(queue);
                }
                handlePlaySong(song);
                if (window.innerWidth < 1024) {
                  setIsNowPlayingOpen(true);
                }
              }}
              onPlayAll={handlePlayAll}
              onUpdatePlaylist={handleUpdatePlaylist}
              onDeletePlaylist={handleDeletePlaylist}
              onRemoveSong={handleRemoveSongFromPlaylist}
              currentSongId={currentSong?._sid}
              isPlaying={isPlaying}
            />
          )}
        </main>

        {/* 3. MOBILE DOCKED CONTROLS (MiniPlayer + BottomNav) */}
        <div className="lg:hidden absolute bottom-0 left-0 right-0 z-30 flex flex-col pointer-events-none">
          {/* Floating MiniPlayer when on mobile */}
          {currentSong && (
            <div className="px-3 pb-1 pointer-events-auto">
              <MiniPlayer
                currentSong={currentSong}
                isPlaying={isPlaying}
                onTogglePlay={handleTogglePlay}
                onOpenFullPlayer={() => setIsNowPlayingOpen(true)}
              />
            </div>
          )}

          {/* Mobile Bottom Navigation Bar */}
          <div className="pointer-events-auto">
            <BottomNav
              activeTab={activeView === 'playlist' ? 'home' : activeView}
              onTabChange={(tab) => setActiveView(tab)}
            />
          </div>
        </div>

        {/* 4. DESKTOP / LAPTOP BOTTOM PLAYER BAR */}
        <PlayerBar
          currentSong={currentSong}
          isPlaying={isPlaying}
          currentTime={currentTime}
          onTogglePlay={handleTogglePlay}
          onSeek={handleSeek}
          onPrev={handlePrevSong}
          onNext={handleNextSong}
          isLiked={isLiked}
          onToggleLike={() => setIsLiked(!isLiked)}
          isShuffle={isShuffle}
          onToggleShuffle={() => setIsShuffle(!isShuffle)}
          isRepeat={isRepeat}
          onToggleRepeat={() => setIsRepeat(!isRepeat)}
          volume={volume}
          onVolumeChange={setVolume}
          isRightPanelOpen={isRightPanelOpen}
          onToggleRightPanel={() => setIsRightPanelOpen(!isRightPanelOpen)}
          onOpenFullscreen={() => setIsNowPlayingOpen(true)}
        />
      </div>

      {/* 5. DESKTOP RIGHT-HAND NOW PLAYING PANEL (Expandable/Docked) */}
      {isRightPanelOpen && (
        <NowPlayingPanel
          song={currentSong}
          isPlaying={isPlaying}
          isLiked={isLiked}
          onToggleLike={() => setIsLiked(!isLiked)}
          onClose={() => setIsRightPanelOpen(false)}
          playlistSongs={playlistSongs}
        />
      )}

      {/* 6. FULLSCREEN NOW PLAYING OVERLAY (Mobile Sheet / Full View) */}
      {isNowPlayingOpen && (
        <NowPlayingScreen
          song={currentSong}
          isPlaying={isPlaying}
          currentTime={currentTime}
          onTogglePlay={handleTogglePlay}
          onSeek={handleSeek}
          onPrev={handlePrevSong}
          onNext={handleNextSong}
          onClose={() => setIsNowPlayingOpen(false)}
          isLiked={isLiked}
          onToggleLike={() => setIsLiked(!isLiked)}
          playlists={playlists}
          onAddToPlaylist={handleAddToPlaylist}
          onOpenCreatePlaylist={() => setIsCreateModalOpen(true)}
        />
      )}

      {/* 7. CREATE NEW PLAYLIST MODAL */}
      <CreatePlaylistModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreate={handleCreatePlaylist}
      />

      {/* Hidden HTML5 Audio Element for real backend streaming */}
      <audio
        ref={audioRef}
        className="hidden"
        onEnded={handleNextSong}
        onTimeUpdate={() => {
          if (audioRef.current && !isNaN(audioRef.current.currentTime)) {
            setCurrentTime(Math.floor(audioRef.current.currentTime));
          }
        }}
      />
    </div>
  );
}
