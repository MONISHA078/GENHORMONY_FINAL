from fastapi import APIRouter, Depends, UploadFile, File
from sqlalchemy.orm import Session
import shutil
import os
from app.database.session import get_db
from app.models.user import User
from app.schemas.emotion import TextRequest, EmotionResponse, FusionRequest
from app.services.auth import auth_service
from app.services.emotion_text import text_emotion_service
from app.services.emotion_speech import speech_emotion_service
from app.services.emotion_face import face_emotion_service
from app.services.emotion_fusion import emotion_fusion_service
from app.repositories.emotion import emotion_history_repository
from app.utils.config import settings

router = APIRouter()


@router.post("/text", response_model=EmotionResponse)
def analyze_text(
    req: TextRequest,
    current_user: User = Depends(auth_service.get_current_user),
    db: Session = Depends(get_db),
):
    """
    Analyze the emotion of the input text block, log it to history, and return confidence details.
    """
    result = text_emotion_service.analyze_emotion(req.text)

    # Extract score of detected emotion to use as fusion_score for history log
    detected_emotion = result["detected_emotion"]
    fusion_score = result["scores"][detected_emotion]

    # Save log to database
    emotion_history_repository.create_history_entry(
        db,
        user_id=current_user.id,
        detected_emotion=detected_emotion,
        text_score=fusion_score,
        fusion_score=fusion_score,
    )

    return result


@router.post("/speech", response_model=EmotionResponse)
def analyze_speech(
    file: UploadFile = File(...),
    current_user: User = Depends(auth_service.get_current_user),
    db: Session = Depends(get_db),
):
    """
    Analyze speech voice files, log logs to history, and return emotion.
    """
    # Create temporary path inside upload directory
    temp_filename = f"speech_{current_user.id}_{file.filename}"
    temp_filepath = os.path.join(settings.UPLOAD_DIR, temp_filename)

    try:
        # Save file stream temporarily
        with open(temp_filepath, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        result = speech_emotion_service.analyze_speech(temp_filepath)

        detected_emotion = result["detected_emotion"]
        fusion_score = result["scores"][detected_emotion]

        # Save history log
        emotion_history_repository.create_history_entry(
            db,
            user_id=current_user.id,
            detected_emotion=detected_emotion,
            speech_score=fusion_score,
            fusion_score=fusion_score,
        )

        return result
    finally:
        # Clean up audio file
        if os.path.exists(temp_filepath):
            os.remove(temp_filepath)


@router.post("/face", response_model=EmotionResponse)
def analyze_face(
    file: UploadFile = File(...),
    current_user: User = Depends(auth_service.get_current_user),
    db: Session = Depends(get_db),
):
    """
    Analyze facial expressions in webcam frames, log results to history, and return emotion.
    """
    # Create temporary path inside upload directory
    temp_filename = f"face_{current_user.id}_{file.filename}"
    temp_filepath = os.path.join(settings.UPLOAD_DIR, temp_filename)

    try:
        # Save file stream temporarily
        with open(temp_filepath, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        result = face_emotion_service.analyze_face(temp_filepath)

        detected_emotion = result["detected_emotion"]
        fusion_score = result["scores"][detected_emotion]

        # Save history log
        emotion_history_repository.create_history_entry(
            db,
            user_id=current_user.id,
            detected_emotion=detected_emotion,
            face_score=fusion_score,
            fusion_score=fusion_score,
        )

        return result
    finally:
        # Clean up image file
        if os.path.exists(temp_filepath):
            os.remove(temp_filepath)


@router.post("/fuse", response_model=EmotionResponse)
def fuse_emotions(
    req: FusionRequest,
    current_user: User = Depends(auth_service.get_current_user),
    db: Session = Depends(get_db),
):
    """
    Fuse scores from active modalities (Text, Speech, Face) and save logging entries.
    """
    result = emotion_fusion_service.fuse_emotions(
        text_scores=req.text_scores,
        speech_scores=req.speech_scores,
        face_scores=req.face_scores,
        weights=req.weights,
    )

    detected_emotion = result["detected_emotion"]
    fusion_score = result["scores"][detected_emotion]

    # Save the final merged entry into history database
    emotion_history_repository.create_history_entry(
        db,
        user_id=current_user.id,
        detected_emotion=detected_emotion,
        text_score=req.text_scores.get(detected_emotion) if req.text_scores else None,
        speech_score=(
            req.speech_scores.get(detected_emotion) if req.speech_scores else None
        ),
        face_score=req.face_scores.get(detected_emotion) if req.face_scores else None,
        fusion_score=fusion_score,
    )

    return result
