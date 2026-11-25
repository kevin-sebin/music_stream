from sqlalchemy import Column, Integer, String, DateTime
from sqlalchemy import func
from backend.db.base import Base


class users(Base):
    __tablename__ = 'users'
    uid = Column(Integer, primary_key=True, index=True)
    google_id = Column(String(255), unique=True, index=True, nullable=False)
    email = Column(String(255), unique=True, index=True, nullable=False)
    name = Column(String(255), nullable=False)
    picture = Column(String(1000), nullable=True)
    created_at = Column(DateTime, server_default=func.now())