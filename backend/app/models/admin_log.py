import uuid
from datetime import datetime
from sqlalchemy import Column, String, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.database.session import Base


class AdminLog(Base):
    __tablename__ = "admin_logs"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    admin_id = Column(
        String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False
    )
    action = Column(String(255), nullable=False)  # e.g. "UPLOAD_SONG", "DELETE_USER"
    details = Column(Text, nullable=True)
    timestamp = Column(DateTime, default=datetime.utcnow, nullable=False)

    admin = relationship("User")
