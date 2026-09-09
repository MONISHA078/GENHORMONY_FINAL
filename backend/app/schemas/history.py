from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from app.schemas.song import SongResponse, GeneratedMusicResponse


class PlayHistoryCreate(BaseModel):
    song_id: Optional[str] = None
    generated_music_id: Optional[str] = None


class PlayHistoryResponse(BaseModel):
    id: str
    user_id: str
    song_id: Optional[str] = None
    generated_music_id: Optional[str] = None
    played_at: datetime

    # Nested detail shapes (Optional)
    song: Optional[SongResponse] = None
    generated_music: Optional[GeneratedMusicResponse] = None

    class Config:
        from_attributes = True


class EmotionHistoryResponse(BaseModel):
    id: str
    user_id: str
    detected_emotion: str
    text_score: Optional[float] = None
    speech_score: Optional[float] = None
    face_score: Optional[float] = None
    fusion_score: float
    timestamp: datetime

    class Config:
        from_attributes = True
