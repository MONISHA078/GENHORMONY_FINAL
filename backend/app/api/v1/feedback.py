from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.models.user import User
from app.schemas.feedback import FeedbackSubmit, FeedbackResponse
from app.services.auth import auth_service
from app.repositories.feedback import feedback_repository

router = APIRouter()


@router.post("/submit", response_model=FeedbackResponse)
def submit_feedback(
    req: FeedbackSubmit,
    current_user: User = Depends(auth_service.get_current_user),
    db: Session = Depends(get_db),
):
    """
    Submit rating (1-5 stars) and comment feedback for a song or generated track.
    If the user has already rated this track, it updates the previous rating.
    """
    db_obj = feedback_repository.create_feedback_entry(
        db,
        user_id=current_user.id,
        song_id=req.song_id,
        generated_music_id=req.generated_music_id,
        rating=req.rating,
        comment=req.comment,
    )
    return db_obj
