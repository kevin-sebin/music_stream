from typing import Optional

from pydantic import BaseModel


class addToPlaylistStruct(BaseModel):
    name: Optional[str] = None
    youtube_id: Optional[str] = None
    artist: Optional[str] = None
    duration: Optional[str] = None
    img: Optional[str] = None