from sqlalchemy.orm import Session
from typing import List
from datetime import datetime
from app.repositories.base_repository import BaseRepository
from app.models.play_history import PlayHistory


class PlayHistoryRepository(BaseRepository[PlayHistory]):
    def create_play_entry(
        self,
        db: Session,
        *,
        user_id: str,
        song_id: str = None,
        generated_music_id: str = None
    ) -> PlayHistory:
        db_obj = PlayHistory(
            user_id=user_id,
            song_id=song_id,
            generated_music_id=generated_music_id,
            played_at=datetime.utcnow(),
        )
        return self.create(db, obj_in=db_obj)

    def get_user_play_history(
        self, db: Session, user_id: str, limit: int = 50
    ) -> List[PlayHistory]:
        return (
            db.query(PlayHistory)
            .filter(PlayHistory.user_id == user_id)
            .order_by(PlayHistory.played_at.desc())
            .limit(limit)
            .all()
        )


play_history_repository = PlayHistoryRepository(PlayHistory)
