import uuid
from datetime import datetime
from sqlalchemy import Column, String, Integer, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.database.session import Base


class Feedback(Base):
    __tablename__ = "feedback"

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
    rating = Column(Integer, nullable=False)  # 1 to 5
    comment = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    user = relationship("User", back_populates="feedback")
    song = relationship("Song", back_populates="feedback")
    generated_music = relationship("GeneratedMusic", back_populates="feedback")
