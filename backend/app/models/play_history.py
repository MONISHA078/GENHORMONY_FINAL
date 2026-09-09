import uuid
from datetime import datetime
from sqlalchemy import Column, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.database.session import Base


class PlayHistory(Base):
    __tablename__ = "play_history"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(
        String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False
    )
    song_id = Column(
        String(100), ForeignKey("songs.id", ondelete="CASCADE"), nullable=True
    )
    generated_music_id = Column(
        String(36), ForeignKey("generated_music.id", ondelete="CASCADE"), nullable=True
    )
    played_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    user = relationship("User", back_populates="play_history")
    song = relationship("Song", back_populates="play_history")
    generated_music = relationship("GeneratedMusic", back_populates="play_history")
