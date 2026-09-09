from fastapi import APIRouter
from app.api.v1 import auth, users, songs, emotion, history, feedback

api_router = APIRouter()

api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(users.router, prefix="/users", tags=["users"])
api_router.include_router(songs.router, prefix="/songs", tags=["songs"])
api_router.include_router(emotion.router, prefix="/emotion", tags=["emotion"])
api_router.include_router(history.router, prefix="/history", tags=["history"])
api_router.include_router(feedback.router, prefix="/feedback", tags=["feedback"])
