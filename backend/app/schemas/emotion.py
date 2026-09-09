from pydantic import BaseModel
from typing import Dict, Optional


class TextRequest(BaseModel):
    text: str


class EmotionScores(BaseModel):
    HAPPY: float
    SAD: float
    CALM: float
    ANGRY: float
    FEAR: float


class EmotionResponse(BaseModel):
    detected_emotion: str
    scores: EmotionScores


class FusionRequest(BaseModel):
    text_scores: Optional[Dict[str, float]] = None
    speech_scores: Optional[Dict[str, float]] = None
    face_scores: Optional[Dict[str, float]] = None
    weights: Optional[Dict[str, float]] = None
