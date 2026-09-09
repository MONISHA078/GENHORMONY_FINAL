import uuid
from datetime import datetime
from sqlalchemy import Column, String, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.database.session import Base


class User(Base):
    __tablename__ = "users"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    email = Column(String(255), unique=True, nullable=False, index=True)
    hashed_password = Column(String(255), nullable=False)
    first_name = Column(String(100), nullable=True)
    last_name = Column(String(100), nullable=True)
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    role_id = Column(
        String(36), ForeignKey("roles.id", ondelete="RESTRICT"), nullable=False
    )

    # Relationships
    role = relationship("Role", back_populates="users")
    emotion_history = relationship(
        "EmotionHistory", back_populates="user", cascade="all, delete-orphan"
    )
    generated_music = relationship(
        "GeneratedMusic", back_populates="user", cascade="all, delete-orphan"
    )
    play_history = relationship(
        "PlayHistory", back_populates="user", cascade="all, delete-orphan"
    )
    feedback = relationship(
        "Feedback", back_populates="user", cascade="all, delete-orphan"
    )
    sessions = relationship(
        "Session", back_populates="user", cascade="all, delete-orphan"
    )
