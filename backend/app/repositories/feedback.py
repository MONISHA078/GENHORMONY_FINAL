from sqlalchemy.orm import Session
from typing import Dict
from datetime import datetime
from app.repositories.base_repository import BaseRepository
from app.models.feedback import Feedback


class FeedbackRepository(BaseRepository[Feedback]):
    def create_feedback_entry(
        self,
        db: Session,
        *,
        user_id: str,
        song_id: str = None,
        generated_music_id: str = None,
        rating: int,
        comment: str = None
    ) -> Feedback:
        # Check if user has already submitted feedback for this track or general app feedback
        query = db.query(Feedback).filter(Feedback.user_id == user_id)
        if song_id:
            query = query.filter(Feedback.song_id == song_id)
        elif generated_music_id:
            query = query.filter(Feedback.generated_music_id == generated_music_id)
        else:
            query = query.filter(Feedback.song_id == None, Feedback.generated_music_id == None)

        existing_feedback = query.first()
        if existing_feedback:
            existing_feedback.rating = rating
            existing_feedback.comment = comment
            existing_feedback.created_at = datetime.utcnow()
            db.commit()
            db.refresh(existing_feedback)
            return existing_feedback

        db_obj = Feedback(
            user_id=user_id,
            song_id=song_id,
            generated_music_id=generated_music_id,
            rating=rating,
            comment=comment,
            created_at=datetime.utcnow(),
        )
        return self.create(db, obj_in=db_obj)

    def get_user_ratings_map(self, db: Session, user_id: str) -> Dict[str, int]:
        """
        Returns a dictionary mapping song IDs to the rating given by the user.
        Used to personalize recommendations.
        """
        results = (
            db.query(Feedback.song_id, Feedback.rating)
            .filter(Feedback.user_id == user_id, Feedback.song_id != None)
            .all()
        )
        return {song_id: rating for song_id, rating in results}


feedback_repository = FeedbackRepository(Feedback)
