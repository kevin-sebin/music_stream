from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from backend.db.database import get_db
from backend.schemas.playlist import playlistStruct, playlistUpdateStruct, playlistThumbnailStruct, thumbnailSaveStruct
from backend.schemas.song import addToPlaylistStruct
from backend.services import playlist_service
from backend.services import storage_service


router = APIRouter()


@router.get("/")
def home(db: Session = Depends(get_db)):
    return playlist_service.get_home_feed(db)


@router.post("/playlists")
def create_playlists(
    request: playlistStruct,
    db: Session = Depends(get_db),
):
    return playlist_service.create_playlist(request, db)


@router.patch("/playlists/{pid}")
def update_playlist(
    pid: int,
    request: playlistUpdateStruct,
    db: Session = Depends(get_db),
):
    return playlist_service.update_playlist(pid, request, db)

@router.put('/playlists/{pid}/thumbnail/upload-url')
def generate_url(
    pid: int,
    request: playlistThumbnailStruct
):
    return storage_service.generateUploadUrl(pid, request.content_type)

@router.put('/playlists/{pid}/thumbnail')
def save_thumbnail(
    pid: int,
    request: thumbnailSaveStruct,
    db: Session=Depends(get_db)
):
    return playlist_service.save_playlist_thumbnail(pid, request, db)


@router.delete("/playlists/{pid}")
def delete_playlist(pid: int, db: Session = Depends(get_db)):
    return playlist_service.delete_playlist(pid, db)


@router.get("/playlists/{pid}")
def get_playlist(pid: int, db: Session = Depends(get_db)):
    return playlist_service.get_playlist_songs(pid, db)


@router.post("/playlists/{pid}")
def add_to_playlist(
    pid: int,
    request: addToPlaylistStruct,
    db: Session = Depends(get_db),
):
    return playlist_service.add_song_to_playlist(pid, request, db)


@router.delete("/playlists/{pid}/songs/{sid}")
def delete_from_playlist(
    pid: int,
    sid: int,
    db: Session = Depends(get_db),
):
    return playlist_service.remove_song_from_playlist(pid, sid, db)