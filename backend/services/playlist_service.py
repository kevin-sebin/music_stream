from fastapi import HTTPException
from sqlalchemy.orm import Session

from backend.core.config import AWS_BUCKET_NAME
from backend.models import playlist_songs, playlists, songs
from backend.schemas.playlist import playlistStruct, playlistUpdateStruct, thumbnailSaveStruct
from backend.schemas.song import addToPlaylistStruct
from backend.services.storage_service import _create_s3_client


def get_home_feed(db: Session):
    feed = db.query(playlists).all()
    result = []
    for playlist in feed:
        count = (
            db.query(playlist_songs._sid)
            .join(songs, playlist_songs._sid == songs._sid)
            .filter(playlist_songs._pid == playlist._pid)
            .distinct()
            .count()
        )
        result.append({
            "_pid": playlist._pid,
            "name": playlist.name,
            "img": playlist.img,
            "created_at": playlist.created_at,
            "genre": playlist.genre,
            "songsCount": count,
        })
    return result


def create_playlist(request: playlistStruct, db: Session):
    latest = db.query(playlists).order_by(playlists._pid.desc()).first()
    playlist_id = 0 if latest is None else latest._pid + 1
    new_playlist = playlists(
        _pid=playlist_id,
        name=request.name,
        img=request.img,
        created_at=request.created_at,
        genre=request.genre,
    )
    db.add(new_playlist)
    db.commit()
    return {"detail": "playlist created", "_pid": playlist_id}


def update_playlist(pid: int, request: playlistUpdateStruct, db: Session):
    playlist = db.query(playlists).filter(playlists._pid == pid).first()
    if playlist is None:
        raise HTTPException(status_code=404, detail="playlist not found")
    for field, value in request.dict(exclude_unset=True).items():
        setattr(playlist, field, value)
    db.commit()
    db.refresh(playlist)
    return {"detail": "playlist updated"}


def save_playlist_thumbnail(pid: int, request: thumbnailSaveStruct, db:Session):
    playlist = db.query(playlists).filter(playlists._pid == pid).first()
    for field, value in request.dict(exclude_unset=True).items():
        setattr(playlist, field, value)
    db.commit()
    db.refresh(playlist)
    return {'detail': 'playlist thumbnail saved'}


def delete_playlist(pid: int, db: Session):
    playlist = db.query(playlists).filter(playlists._pid == pid).first()
    if playlist is None:
        raise HTTPException(status_code=404, detail="playlist does not exist")
    db.query(playlist_songs).filter(playlist_songs._pid == pid).delete()
    db.delete(playlist)
    db.commit()
    return {"detail": "playlist deleted"}


def get_playlist_songs(pid: int, db: Session):
    playlist = db.query(playlists).filter(playlists._pid == pid).first()
    if playlist is None:
        raise HTTPException(status_code=404, detail="playlist does not exist")
    song_links = db.query(playlist_songs).filter(playlist_songs._pid == pid).all()
    song_ids = [link._sid for link in song_links]
    if not song_ids:
        return []
    songs_in_db = db.query(songs).filter(songs._sid.in_(song_ids)).all()
    songs_by_id = {song._sid: song for song in songs_in_db}
    return [songs_by_id[sid] for sid in song_ids if sid in songs_by_id]


def add_song_to_playlist(pid: int, request: addToPlaylistStruct, db: Session):
    playlist = db.query(playlists).filter(playlists._pid == pid).first()
    if playlist is None:
        raise HTTPException(status_code=404, detail="playlist does not exist")

    # Prevent duplicate entries of the same song in the playlist
    if request.youtube_id:
        existing_song = (
            db.query(songs)
            .join(playlist_songs, songs._sid == playlist_songs._sid)
            .filter(
                playlist_songs._pid == pid,
                songs.url == request.youtube_id
            )
            .first()
        )
        if existing_song:
            return {
                "detail": "song already in playlist",
                "_sid": existing_song._sid,
                "_pid": pid,
                "name": existing_song.name,
            }

    new_song = songs(
        name=(request.name or "Untitled Track")[:255],
        url=(request.youtube_id or "")[:255],
        artist=(request.artist or "")[:255],
        duration=(request.duration or "")[:255],
        img=(request.img or "")[:255],
    )
    db.add(new_song)
    db.flush()

    existing_link = db.query(playlist_songs).filter(
        playlist_songs._pid == pid,
        playlist_songs._sid == new_song._sid,
    ).first()
    if not existing_link:
        db.add(playlist_songs(_pid=pid, _sid=new_song._sid))

    db.commit()
    db.refresh(new_song)
    return {
        "detail": "song added",
        "_sid": new_song._sid,
        "_pid": pid,
        "name": new_song.name,
    }


def remove_song_from_playlist(pid: int, sid: int, db: Session):
    playlist = db.query(playlists).filter(playlists._pid == pid).first()
    if playlist is None:
        raise HTTPException(status_code=404, detail="playlist does not exist")
    links = db.query(playlist_songs).filter(
        playlist_songs._pid == pid,
        playlist_songs._sid == sid,
    ).all()
    if not links:
        raise HTTPException(
            status_code=404,
            detail="song does not exist in the playlist",
        )
    for link in links:
        db.delete(link)
    db.commit()
    return {"detail": "song removed from playlist"}