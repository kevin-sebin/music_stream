from sqlalchemy import Column, Integer, String

from backend.db.base import Base

class songs(Base):
    __tablename__ = 'songs'
    _sid = Column(Integer, primary_key=True, index=True)
    name = Column(String(255))
    url = Column(String(255))
    artist = Column(String(255))
    duration = Column(String(255))
    img = Column(String(255))

