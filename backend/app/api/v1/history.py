from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from typing import List
from app.database.session import get_db
from app.models.user import User
from app.schemas.history import (
    PlayHistoryCreate,
    PlayHistoryResponse,
    EmotionHistoryResponse,
)
from app.services.auth import auth_service
from app.repositories.play_history import play_history_repository
from app.repositories.emotion import emotion_history_repository

router = APIRouter()


@router.post(
    "/play", response_model=PlayHistoryResponse, status_code=status.HTTP_201_CREATED
)
def record_play(
    req: PlayHistoryCreate,
    current_user: User = Depends(auth_service.get_current_user),
    db: Session = Depends(get_db),
):
    """
    Log a play history event when a user plays a song (predefined or generated).
    """
    db_obj = play_history_repository.create_play_entry(
        db,
        user_id=current_user.id,
        song_id=req.song_id,
        generated_music_id=req.generated_music_id,
    )
    return db_obj


@router.get("/play", response_model=List[PlayHistoryResponse])
def get_play_history(
    current_user: User = Depends(auth_service.get_current_user),
    db: Session = Depends(get_db),
):
    """
    Get the list of recently played songs for the current user.
    """
    return play_history_repository.get_user_play_history(db, user_id=current_user.id)


@router.get("/emotion", response_model=List[EmotionHistoryResponse])
def get_emotion_history(
    current_user: User = Depends(auth_service.get_current_user),
    db: Session = Depends(get_db),
):
    """
    Get the list of recently logged emotion records for the current user.
    """
    return emotion_history_repository.get_user_history(db, user_id=current_user.id)
