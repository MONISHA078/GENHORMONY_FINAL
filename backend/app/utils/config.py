import os
from dotenv import load_dotenv
from pydantic_settings import BaseSettings

# Find base backend directory and load .env file (force override existing environment variables)
backend_dir = os.path.dirname(
    os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
)
load_dotenv(os.path.join(backend_dir, ".env"), override=True)


class Settings(BaseSettings):
    PROJECT_NAME: str = "GenHarmony"
    API_V1_STR: str = "/api/v1"

    # Security
    SECRET_KEY: str = os.getenv(
        "SECRET_KEY", "supersecretkey_change_me_in_production_1234567890"
    )
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days

    # Database
    DATABASE_URL: str = os.getenv(
        "DATABASE_URL", "postgresql://postgres:postgres@localhost:5432/genharmony"
    )

    # Jamendo API Client ID
    JAMENDO_CLIENT_ID: str | None = os.getenv("JAMENDO_CLIENT_ID", None)

    # Cloudinary Config
    CLOUDINARY_CLOUD_NAME: str | None = os.getenv("CLOUDINARY_CLOUD_NAME", None)
    CLOUDINARY_API_KEY: str | None = os.getenv("CLOUDINARY_API_KEY", None)
    CLOUDINARY_API_SECRET: str | None = os.getenv("CLOUDINARY_API_SECRET", None)

    # Storage Paths
    BASE_DIR: str = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    UPLOAD_DIR: str = os.path.join(BASE_DIR, "uploads")
    GENERATED_MUSIC_DIR: str = os.path.join(BASE_DIR, "generated_music")
    MUSIC_LIBRARY_DIR: str = os.path.join(BASE_DIR, "music_library")

    # MusicGen Config
    MUSICGEN_MODEL: str = os.getenv("MUSICGEN_MODEL", "facebook/musicgen-small")
    MUSICGEN_ENABLED: bool = os.getenv("MUSICGEN_ENABLED", "true").lower() == "true"
    MUSICGEN_DEFAULT_DURATION: int = int(os.getenv("MUSICGEN_DEFAULT_DURATION", "15"))
    MUSICGEN_MAX_DURATION: int = int(os.getenv("MUSICGEN_MAX_DURATION", "30"))
    MUSICGEN_MIN_DURATION: int = int(os.getenv("MUSICGEN_MIN_DURATION", "10"))

    class Config:
        case_sensitive = True


settings = Settings()

# Ensure directories exist
for path in [
    settings.UPLOAD_DIR,
    settings.GENERATED_MUSIC_DIR,
    settings.MUSIC_LIBRARY_DIR,
]:
    os.makedirs(path, exist_ok=True)
