from sqlalchemy.orm import Session
from typing import List
from app.repositories.base_repository import BaseRepository
from app.models.song import Song


class SongRepository(BaseRepository[Song]):
    def get_active_songs(
        self, db: Session, *, skip: int = 0, limit: int = 1000
    ) -> List[Song]:
        return (
            db.query(Song)
            .filter(Song.is_active == True)
            .order_by(Song.created_at.desc())
            .offset(skip)
            .limit(limit)
            .all()
        )

    def get_songs_by_emotion(self, db: Session, emotion: str) -> List[Song]:
        return (
            db.query(Song)
            .filter(Song.is_active == True, Song.emotion_tag == emotion.upper())
            .order_by(Song.created_at.desc())
            .all()
        )


song_repository = SongRepository(Song)
