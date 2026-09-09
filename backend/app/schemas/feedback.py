from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime


class FeedbackSubmit(BaseModel):
    song_id: Optional[str] = None
    generated_music_id: Optional[str] = None
    rating: int = Field(..., ge=1, le=5)  # Rating must be between 1 and 5
    comment: Optional[str] = None


class FeedbackResponse(BaseModel):
    id: str
    user_id: str
    song_id: Optional[str] = None
    generated_music_id: Optional[str] = None
    rating: int
    comment: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True
