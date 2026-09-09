import uuid
from sqlalchemy import Column, String
from sqlalchemy.orm import relationship
from app.database.session import Base


class Role(Base):
    __tablename__ = "roles"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String(50), unique=True, nullable=False, index=True)

    users = relationship("User", back_populates="role", cascade="all, delete-orphan")
