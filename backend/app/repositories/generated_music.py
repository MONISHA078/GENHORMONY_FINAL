from sqlalchemy.orm import Session
from typing import List
from datetime import datetime
from app.repositories.base_repository import BaseRepository
from app.models.generated_music import GeneratedMusic


class GeneratedMusicRepository(BaseRepository[GeneratedMusic]):
    def create_generated_music(
        self,
        db: Session,
        *,
        user_id: str,
        prompt: str,
        emotion_tag: str,
        file_path: str
    ) -> GeneratedMusic:
        db_obj = GeneratedMusic(
            user_id=user_id,
            prompt=prompt,
            emotion_tag=emotion_tag.upper(),
            file_path=file_path,
            created_at=datetime.utcnow(),
        )
        return self.create(db, obj_in=db_obj)

    def get_user_generated_music(
        self, db: Session, user_id: str
    ) -> List[GeneratedMusic]:
        return (
            db.query(GeneratedMusic)
            .filter(GeneratedMusic.user_id == user_id)
            .order_by(GeneratedMusic.created_at.desc())
            .all()
        )


generated_music_repository = GeneratedMusicRepository(GeneratedMusic)
