from sqlalchemy import Column, ForeignKey, Integer

from backend.db.base import Base

class playlist_songs(Base):
    __tablename__ = 'playlist_songs'
    _pid = Column(Integer, ForeignKey('playlists._pid'), primary_key=True, index=True)
    _sid = Column(Integer, ForeignKey('songs._sid'), primary_key=True, index=True)
