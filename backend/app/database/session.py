# pyrefly: ignore [missing-import]
from sqlalchemy import create_engine
# pyrefly: ignore [missing-import]
from sqlalchemy.orm import sessionmaker, DeclarativeBase
from app.utils.config import settings

# Create engine
engine = create_engine(settings.DATABASE_URL, pool_pre_ping=True)

# Create SessionLocal class
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Declarative base
class Base(DeclarativeBase):
    pass

# Dependency to get db session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
