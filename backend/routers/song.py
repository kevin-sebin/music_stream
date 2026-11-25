from typing import Optional
from fastapi import APIRouter, Depends, Query
from fastapi.responses import RedirectResponse
from sqlalchemy.orm import Session
from backend.db.database import get_db
from backend.services import song_service


router = APIRouter()


@router.get("/songs/search")
def search_songs(
    query: Optional[str] = Query(None, alias="q"),
    limit: int = 10,
    db: Session = Depends(get_db),
):
    return song_service.search_songs(query, limit, db)


@router.get("/songs/stream/{youtube_id}")
def stream_song(youtube_id: str):
    return RedirectResponse(url=song_service.get_stream_url(youtube_id))