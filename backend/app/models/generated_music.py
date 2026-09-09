import uuid
from datetime import datetime
from sqlalchemy import Column, String, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.database.session import Base


class GeneratedMusic(Base):
    __tablename__ = "generated_music"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(
        String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False
    )
    prompt = Column(Text, nullable=False)
    emotion_tag = Column(String(50), nullable=False, index=True)
    file_path = Column(String(512), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    user = relationship("User", back_populates="generated_music")
    play_history = relationship(
        "PlayHistory", back_populates="generated_music", cascade="all, delete-orphan"
    )
    feedback = relationship(
        "Feedback", back_populates="generated_music", cascade="all, delete-orphan"
    )
