import uuid
from datetime import datetime
from sqlalchemy import Column, String, Float, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.database.session import Base


class EmotionHistory(Base):
    __tablename__ = "emotion_history"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(
        String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False
    )
    detected_emotion = Column(String(50), nullable=False, index=True)  # e.g. HAPPY, SAD
    text_score = Column(Float, nullable=True)
    speech_score = Column(Float, nullable=True)
    face_score = Column(Float, nullable=True)
    fusion_score = Column(Float, nullable=False)
    timestamp = Column(DateTime, default=datetime.utcnow, nullable=False)

    user = relationship("User", back_populates="emotion_history")
