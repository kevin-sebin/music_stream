from sqlalchemy import Column, Date, Integer, String

from backend.db.base import Base


class playlists(Base):
    __tablename__ = 'playlists'
    _pid = Column(Integer, primary_key=True, index=True)
    name = Column(String(100))
    img = Column(String(255))
    created_at = Column(Date)
    genre = Column(String(50))
