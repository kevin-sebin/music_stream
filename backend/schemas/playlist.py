from datetime import date
from typing import Optional

from pydantic import BaseModel


class playlistStruct(BaseModel):
    name: str
    img: str
    created_at: date
    genre: str

class playlistUpdateStruct(BaseModel):
    name: Optional[str] = None
    img: Optional[str] = None
    created_at: Optional[date] = None
    genre: Optional[str] = None

class playlistThumbnailStruct(BaseModel):
    content_type: str

class thumbnailSaveStruct(BaseModel):
    img: str