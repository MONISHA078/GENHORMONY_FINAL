from pydantic import BaseModel, field_validator
from typing import Optional
from datetime import datetime


class SongBase(BaseModel):
    title: str
    artist: str
    album: Optional[str] = None
    emotion_tag: str  # HAPPY, SAD, ANGRY, CALM, FEAR
    cover_url: Optional[str] = None
    genre: Optional[str] = None


class SongCreate(SongBase):
    pass


class SongResponse(SongBase):
    id: str
    file_path: str
    duration: Optional[int] = None
    is_active: bool
    created_at: datetime
    source: Optional[str] = None
    cloudinary_url: Optional[str] = None
    cloudinary_public_id: Optional[str] = None

    class Config:
        from_attributes = True


class GenerateMusicRequest(BaseModel):
    emotion_tag: Optional[str] = None
    prompt: Optional[str] = None
    duration: Optional[int] = 15

    @field_validator("emotion_tag")
    @classmethod
    def normalize_emotion(cls, v):
        if v is not None:
            return v.strip().upper()
        return v

    @field_validator("prompt")
    @classmethod
    def validate_prompt_length(cls, v):
        if v is not None and len(v.strip()) > 500:
            raise ValueError("Prompt must be 500 characters or less.")
        return v


class GeneratedMusicResponse(BaseModel):
    id: str
    user_id: str
    prompt: str
    emotion_tag: str
    file_path: str
    created_at: datetime

    class Config:
        from_attributes = True
