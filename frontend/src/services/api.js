import { INITIAL_PLAYLISTS, INITIAL_SONGS } from '../data/musicData';

export const API_BASE_URL = 'http://localhost:8000';

const COLOR_PALETTE = ['#356e3f', '#306975', '#923c38', '#ad8a32', '#593671', '#6d3753', '#374868'];

/**
 * Normalizes any song object returned by the backend (FastAPI / YouTube / SQL)
 * so the frontend components never crash or need field adjustments.
 */
export function normalizeSong(item, idx = 0) {
  if (!item) return null;

  const sid = item._sid ?? item.sid ?? item.id ?? (idx + 1);
  const name = item.name || item.title || 'Untitled Track';
  const artist = item.artist || item.channel || item.uploader || 'Luna Bay';

  // Calculate & normalize duration
  let duration = item.duration;
  let durationSecs = item.durationSecs ?? item.duration_seconds ?? item.duration_secs;

  if (typeof duration === 'number') {
    durationSecs = Math.floor(duration);
    const m = Math.floor(durationSecs / 60);
    const s = Math.floor(durationSecs % 60);
    duration = `${m}:${s < 10 ? '0' : ''}${s}`;
  } else if (typeof durationSecs === 'number' && !duration) {
    const m = Math.floor(durationSecs / 60);
    const s = Math.floor(durationSecs % 60);
    duration = `${m}:${s < 10 ? '0' : ''}${s}`;
  } else if (typeof duration === 'string' && duration.includes(':') && !durationSecs) {
    const parts = duration.split(':').map(Number);
    if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
      durationSecs = parts[0] * 60 + parts[1];
    } else if (parts.length === 3 && !isNaN(parts[0]) && !isNaN(parts[1]) && !isNaN(parts[2])) {
      durationSecs = parts[0] * 3600 + parts[1] * 60 + parts[2];
    } else {
      durationSecs = 210;
    }
  } else if (!duration && !durationSecs) {
    const fallback = INITIAL_SONGS[idx % INITIAL_SONGS.length];
    duration = fallback?.duration || '3:30';
    durationSecs = fallback?.durationSecs || 210;
  }

  // Extract youtube_id reliably
  let youtubeId = item.youtube_id || item.id || '';
  if (!youtubeId && item.url) {
    if (item.url.includes('/stream/')) {
      youtubeId = item.url.split('/stream/')[1].split('?')[0];
    } else if (!item.url.startsWith('http://') && !item.url.startsWith('https://')) {
      youtubeId = item.url;
    }
  }
  if (!youtubeId && typeof sid === 'string' && isNaN(Number(sid))) {
    youtubeId = sid;
  }

  // Construct audio stream URL:
  let url = item.url || '';
  if (youtubeId) {
    url = `${API_BASE_URL}/songs/stream/${youtubeId}`;
  } else if (url && !url.startsWith('http://') && !url.startsWith('https://') && !url.startsWith('/')) {
    url = `${API_BASE_URL}/songs/stream/${url}`;
  }

  const color = item.color || COLOR_PALETTE[idx % COLOR_PALETTE.length];
  const thumbnail = item.thumbnail || item.img || '';

  return {
    _sid: sid,
    id: sid,
    youtube_id: youtubeId,
    name,
    artist,
    duration: typeof duration === 'string' ? duration : '3:30',
    durationSecs: durationSecs || 210,
    url,
    img: thumbnail,
    thumbnail: thumbnail,
    color,
    discColor: item.discColor || color
  };
}

export const S3_BUCKET_NAME = import.meta.env.VITE_AWS_BUCKET_NAME || 'your-music-app-assets';
export const S3_REGION = import.meta.env.VITE_AWS_REGION || 'ap-southeast-2';

export function resolvePlaylistImg(img) {
  if (!img) return '';
  if (img.startsWith('/static/')) {
    return `${API_BASE_URL}${img}`;
  }
  if (img.startsWith('http://') || img.startsWith('https://') || img.startsWith('blob:') || img.startsWith('data:')) {
    return img;
  }
  return `https://${S3_BUCKET_NAME}.s3.${S3_REGION}.amazonaws.com/${img}`;
}

/**
 * Calculates and formats total duration of a list of songs into human-readable text.
 * e.g., '7 min 39 sec', '1 hr 15 min', or '0 min'
 */
export function formatPlaylistDuration(songsList) {
  if (!Array.isArray(songsList) || songsList.length === 0) {
    return '0 min';
  }

  let totalSeconds = 0;
  for (const song of songsList) {
    let secs = song.durationSecs;
    if (typeof secs !== 'number' || isNaN(secs) || secs <= 0) {
      if (typeof song.duration === 'string' && song.duration.includes(':')) {
        const parts = song.duration.trim().split(':').map(Number);
        if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
          secs = parts[0] * 60 + parts[1];
        } else if (parts.length === 3 && !isNaN(parts[0]) && !isNaN(parts[1]) && !isNaN(parts[2])) {
          secs = parts[0] * 3600 + parts[1] * 60 + parts[2];
        }
      } else if (typeof song.duration === 'number' && !isNaN(song.duration)) {
        secs = song.duration;
      }
    }
    if (typeof secs === 'number' && !isNaN(secs) && secs > 0) {
      totalSeconds += secs;
    }
  }

  if (totalSeconds === 0) return '0 min';

  const hrs = Math.floor(totalSeconds / 3600);
  const mins = Math.floor((totalSeconds % 3600) / 60);
  const remainingSecs = totalSeconds % 60;

  if (hrs > 0) {
    return mins > 0 ? `${hrs} hr ${mins} min` : `${hrs} hr`;
  }
  if (mins > 0 && remainingSecs > 0) {
    return `${mins} min ${remainingSecs} sec`;
  }
  if (mins > 0) {
    return `${mins} min`;
  }
  return `${remainingSecs} sec`;
}

/**
 * Formats a playlist date string (YYYY-MM-DD or ISO) into human-readable display e.g. "Nov 21, 2026"
 */
export function formatPlaylistDate(dateVal) {
  if (!dateVal) return '';

  try {
    if (typeof dateVal === 'string' && /^\d{4}-\d{2}-\d{2}/.test(dateVal)) {
      const parts = dateVal.split('T')[0].split('-').map(Number);
      if (parts.length === 3) {
        const [year, month, day] = parts;
        const d = new Date(year, month - 1, day);
        return d.toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric'
        });
      }
    }

    const d = new Date(dateVal);
    if (!isNaN(d.getTime())) {
      return d.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    }
  } catch (err) {
    // fallback
  }

  return String(dateVal);
}

export async function fetchPlaylists() {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2000);
    const response = await fetch(`${API_BASE_URL}/`, { signal: controller.signal });
    clearTimeout(timeoutId);
    if (!response.ok) throw new Error('Network error');
    const data = await response.json();
    if (Array.isArray(data) && data.length > 0) {
      return data.map((pl, idx) => {
        const fallback = INITIAL_PLAYLISTS[idx % INITIAL_PLAYLISTS.length];
        const resolvedImg = resolvePlaylistImg(pl.img) || fallback.img;
        const actualDate = pl.created_at || fallback.created_at;
        const displayDate = formatPlaylistDate(actualDate) || fallback.createdAtDisplay || 'Recently';

        return {
          _pid: pl._pid ?? pl.id,
          name: pl.name || fallback.name,
          genre: pl.genre || fallback.genre,
          displayGenre: pl.genre ? pl.genre.split('·')[0].trim() : fallback.displayGenre,
          songsCount: pl.songsCount !== undefined ? pl.songsCount : (fallback.songsCount || 0),
          durationText: fallback.durationText || '0 min',
          created_at: actualDate,
          createdAtDisplay: displayDate,
          color: fallback.color,
          accentColor: fallback.accentColor,
          textColor: fallback.textColor,
          img: resolvedImg,
          thumbnail: resolvedImg
        };
      });
    }
  } catch (err) {
    console.warn('Backend unavailable, using local mock data:', err.message);
  }
  return INITIAL_PLAYLISTS;
}

export async function fetchPlaylistSongs(pid) {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2000);
    const response = await fetch(`${API_BASE_URL}/playlists/${pid}`, { signal: controller.signal });
    clearTimeout(timeoutId);
    if (!response.ok) throw new Error('Network error');
    const data = await response.json();
    if (Array.isArray(data)) {
      return data.map((song, idx) => normalizeSong(song, idx));
    }
  } catch (err) {
    console.warn(`Backend unavailable for playlist ${pid}, using local songs:`, err.message);
  }
  const songs = INITIAL_SONGS.filter(s => s.playlistId === Number(pid));
  return songs.length > 0 ? songs : INITIAL_SONGS.slice(0, 6);
}

export async function searchSongsAPI(query) {
  if (!query || !query.trim()) {
    return INITIAL_SONGS.slice(0, 6);
  }
  const q = query.toLowerCase().trim();
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2000);
    const response = await fetch(`${API_BASE_URL}/songs/search?q=${encodeURIComponent(q)}`, { signal: controller.signal });
    clearTimeout(timeoutId);
    if (response.ok) {
      const data = await response.json();
      if (Array.isArray(data) && data.length > 0) {
        return data.map((item, idx) => normalizeSong(item, idx));
      }
    }
  } catch (err) {
    // Network or server offline
  }

  // Graceful client-side fallback
  return INITIAL_SONGS.filter(s =>
    s.name.toLowerCase().includes(q) ||
    s.artist.toLowerCase().includes(q)
  );
}

export async function createPlaylistAPI(playlistData) {
  const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
  const payload = {
    name: playlistData.name,
    img: playlistData.img || '',
    created_at: playlistData.created_at || today,
    genre: playlistData.genre || 'Indie · Chill'
  };

  const response = await fetch(`${API_BASE_URL}/playlists`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to create playlist on backend (${response.status}): ${errorText}`);
  }

  return await response.json();
}

export async function addSongToPlaylistAPI(pid, song) {
  let youtubeId = song.youtube_id || song.id || '';
  if (!youtubeId && song.url) {
    if (song.url.includes('/stream/')) {
      youtubeId = song.url.split('/stream/')[1].split('?')[0];
    } else if (!song.url.startsWith('http://') && !song.url.startsWith('https://')) {
      youtubeId = song.url;
    }
  }
  if (!youtubeId && typeof song._sid === 'string' && isNaN(Number(song._sid))) {
    youtubeId = song._sid;
  }

  const payload = {
    name: (song.name || song.title || 'Untitled Track').slice(0, 255),
    youtube_id: youtubeId,
    artist: (song.artist || song.artist_name || '').slice(0, 255),
    duration: String(song.duration || song.length || ''),
    img: song.thumbnail || song.img || ''
  };

  const response = await fetch(`${API_BASE_URL}/playlists/${pid}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'pid': String(pid) // Passing pid in the header as requested
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to add song to playlist (${response.status}): ${errorText}`);
  }

  return await response.json();
}

export async function updatePlaylistAPI(pid, updateData) {
  const payload = {};
  if (updateData.name) payload.name = updateData.name;
  if (updateData.genre) payload.genre = updateData.genre;
  if (updateData.img !== undefined) payload.img = updateData.img;
  if (updateData.created_at) payload.created_at = updateData.created_at;

  const response = await fetch(`${API_BASE_URL}/playlists/${pid}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to update playlist (${response.status}): ${errorText}`);
  }

  return await response.json();
}

export async function deletePlaylistAPI(pid) {
  const response = await fetch(`${API_BASE_URL}/playlists/${pid}`, {
    method: 'DELETE'
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to delete playlist (${response.status}): ${errorText}`);
  }

  return await response.json();
}

export async function removeSongFromPlaylistAPI(pid, sid) {
  const response = await fetch(`${API_BASE_URL}/playlists/${pid}/songs/${sid}`, {
    method: 'DELETE'
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to remove song from playlist (${response.status}): ${errorText}`);
  }

  return await response.json();
}

/**
 * 1. Request presigned upload URL from FastAPI PUT /playlists/{pid}/thumbnail/upload-url
 */
export async function getPlaylistThumbnailUploadUrlAPI(pid, contentType) {
  const response = await fetch(`${API_BASE_URL}/playlists/${pid}/thumbnail/upload-url`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ content_type: contentType })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to generate upload URL (${response.status}): ${errorText}`);
  }

  return await response.json();
}

/**
 * 2. Push binary image directly into Amazon S3 bucket via presigned PUT URL
 */
export async function uploadToS3(uploadUrl, file, contentType) {
  const response = await fetch(uploadUrl, {
    method: 'PUT',
    headers: {
      'Content-Type': contentType
    },
    body: file
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => '');
    throw new Error(`Failed to push image to Amazon S3 (${response.status}): ${errorText || response.statusText}`);
  }

  return true;
}

/**
 * 3. Save S3 object_key to backend via PUT /playlists/{pid}/thumbnail
 */
export async function savePlaylistThumbnailAPI(pid, objectKey) {
  const response = await fetch(`${API_BASE_URL}/playlists/${pid}/thumbnail`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ img: objectKey })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to save thumbnail in backend (${response.status}): ${errorText}`);
  }

  return await response.json();
}

/**
 * Direct S3 thumbnail upload orchestrator:
 * 1. Calls PUT /playlists/{pid}/thumbnail/upload-url to generate S3 presigned PUT URL
 * 2. Uploads the raw binary image directly from browser to Amazon S3 via PUT
 * 3. Calls PUT /playlists/{pid}/thumbnail with { img: object_key } to persist in backend database
 */
export async function uploadPlaylistThumbnail(pid, file) {
  if (!file) throw new Error('No image file selected.');

  let contentType = file.type;
  if (!contentType || contentType === 'image/jpg') {
    contentType = 'image/jpeg';
  }
  const allowed = ['image/jpeg', 'image/png', 'image/webp'];
  if (!allowed.includes(contentType)) {
    throw new Error('Unsupported image format. Please upload JPEG, PNG, or WEBP.');
  }

  // Step 1: PUT /playlists/{pid}/thumbnail/upload-url -> returns { upload_url, object_key }
  const { upload_url, object_key } = await getPlaylistThumbnailUploadUrlAPI(pid, contentType);

  // Step 2: PUT upload_url directly to Amazon S3 bucket from the browser
  await uploadToS3(upload_url, file, contentType);

  // Step 3: PUT /playlists/{pid}/thumbnail with { img: object_key }
  await savePlaylistThumbnailAPI(pid, object_key);

  return { object_key };
}
