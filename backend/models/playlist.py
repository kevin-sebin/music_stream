from sqlalchemy import Column, Date, Integer, String, ForeignKey

from backend.db.base import Base


class playlists(Base):
    __tablename__ = 'playlists'
    _pid = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey('users.uid'), nullable=True)
    name = Column(String(100))
    img = Column(String(255))
    created_at = Column(Date)
    genre = Column(String(50))
