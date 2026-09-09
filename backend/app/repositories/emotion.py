from sqlalchemy.orm import Session
from typing import List
from datetime import datetime
from app.repositories.base_repository import BaseRepository
from app.models.emotion import EmotionHistory


class EmotionHistoryRepository(BaseRepository[EmotionHistory]):
    def create_history_entry(
        self,
        db: Session,
        *,
        user_id: str,
        detected_emotion: str,
        text_score: float = None,
        speech_score: float = None,
        face_score: float = None,
        fusion_score: float
    ) -> EmotionHistory:
        db_obj = EmotionHistory(
            user_id=user_id,
            detected_emotion=detected_emotion.upper(),
            text_score=text_score,
            speech_score=speech_score,
            face_score=face_score,
            fusion_score=fusion_score,
            timestamp=datetime.utcnow(),
        )
        return self.create(db, obj_in=db_obj)

    def get_user_history(
        self, db: Session, user_id: str, limit: int = 50
    ) -> List[EmotionHistory]:
        return (
            db.query(EmotionHistory)
            .filter(EmotionHistory.user_id == user_id)
            .order_by(EmotionHistory.timestamp.desc())
            .limit(limit)
            .all()
        )


emotion_history_repository = EmotionHistoryRepository(EmotionHistory)
