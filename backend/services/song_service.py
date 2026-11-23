from typing import Optional

import yt_dlp
from sqlalchemy.orm import Session

from backend.models import songs


def search_songs(query: Optional[str], limit: int, db: Session):
    search_term = (query or "").strip()
    if not search_term:
        return db.query(songs).limit(10).all()

    ydl_opts = {
        "quiet": True,
        "no_warnings": True,
        "extract_flat": True,
        "skip_download": True,
    }
    search_query = f"ytsearch{limit}:{search_term}"
    with yt_dlp.YoutubeDL(ydl_opts) as ydl:
        info = ydl.extract_info(search_query, download=False)

    results = []
    for video in info.get("entries", []):
        if not video:
            continue
        results.append({
            "id": video.get("id"),
            "title": video.get("title"),
            "artist": (
                video.get("artist")
                or video.get("creator")
                or video.get("uploader")
                or video.get("channel")
                or "Unknown Artist"
            ),
            "duration": video.get("duration"),
            "youtube_id": video.get("id"),
            "thumbnail": (
                f"https://i.ytimg.com/vi/{video.get('id')}/hqdefault.jpg"
            ),
        })
    return results


def get_stream_url(youtube_id: str) -> str:
    ydl_opts = {
        "format": "bestaudio/best",
        "quiet": None,
    }
    with yt_dlp.YoutubeDL(ydl_opts) as ydl:
        info = ydl.extract_info(
            f"https://www.youtube.com/watch?v={youtube_id}",
            download=False,
        )
    return info["url"]