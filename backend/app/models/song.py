import uuid
from datetime import datetime
from sqlalchemy import Column, String, Integer, Boolean, DateTime
from sqlalchemy.orm import relationship
from app.database.session import Base


class Song(Base):
    __tablename__ = "songs"

    id = Column(String(100), primary_key=True, default=lambda: str(uuid.uuid4()))
    title = Column(String(255), nullable=False)
    artist = Column(String(255), nullable=False)
    album = Column(String(255), nullable=True)
    file_path = Column(String(512), nullable=False)
    emotion_tag = Column(
        String(50), nullable=False, index=True
    )  # e.g. HAPPY, SAD, ANGRY, CALM, FEAR
    duration = Column(Integer, nullable=True)  # in seconds
    is_active = Column(Boolean, default=True, nullable=False)
    cover_url = Column(String(512), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    source = Column(String(50), nullable=True)  # e.g. "cloudinary", "jamendo", "local"
    genre = Column(String(100), nullable=True)
    cloudinary_url = Column(String(512), nullable=True)
    cloudinary_public_id = Column(String(255), nullable=True)

    play_history = relationship(
        "PlayHistory", back_populates="song", cascade="all, delete-orphan"
    )
    feedback = relationship(
        "Feedback", back_populates="song", cascade="all, delete-orphan"
    )
