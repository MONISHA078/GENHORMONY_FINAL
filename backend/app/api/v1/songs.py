import os
from fastapi import APIRouter, Depends, UploadFile, File, Form, HTTPException, status
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from typing import List, Optional
from app.database.session import get_db
from app.models.user import User
from app.schemas.song import SongResponse, GenerateMusicRequest, GeneratedMusicResponse
from app.services.auth import auth_service
from app.services.song import song_service
from app.services.music_gen import music_gen_service
from app.repositories.song import song_repository
from app.repositories.emotion import emotion_history_repository
from app.repositories.generated_music import generated_music_repository
from app.repositories.feedback import feedback_repository
from app.utils.config import settings

router = APIRouter()


@router.get("", response_model=List[SongResponse])
def list_songs(
    current_user: User = Depends(auth_service.get_current_user),
    db: Session = Depends(get_db),
):
    """
    List all active predefined songs.
    """
    return song_repository.get_active_songs(db)


@router.get("/recommend", response_model=List[SongResponse])
def recommend_songs(
    emotion: Optional[str] = None,
    current_user: User = Depends(auth_service.get_current_user),
    db: Session = Depends(get_db),
):
    """
    Recommend songs based on user's active emotion. Uses Jamendo API if configured, otherwise local database.
    """
    target_emotion = emotion
    if not target_emotion:
        # Get the user's latest emotion log
        history = emotion_history_repository.get_user_history(
            db, user_id=current_user.id, limit=1
        )
        if history:
            target_emotion = history[0].detected_emotion
        else:
            target_emotion = "CALM"

    # Self-healing database migration: ensure cover_url column exists in the songs table
    try:
        from sqlalchemy import text

        db.execute(
            text("ALTER TABLE songs ADD COLUMN IF NOT EXISTS cover_url VARCHAR(512)")
        )
        db.commit()
    except Exception:
        db.rollback()
        # Fallback raw alter for DBs that do not support IF NOT EXISTS natively (like SQLite, though Postgres does)
        try:
            db.execute(text("ALTER TABLE songs ADD COLUMN cover_url VARCHAR(512)"))
            db.commit()
        except Exception:
            db.rollback()

    # Jamendo Recommendation Engine
    if not settings.JAMENDO_CLIENT_ID:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Jamendo API client ID is not configured.",
        )

    jamendo_songs = []
    try:
        import urllib.request
        import urllib.parse
        import json
        from app.models.song import Song

        # Map target emotion to Jamendo fuzzytags search terms
        tag_map = {
            "HAPPY": "happy",
            "SAD": "sad",
            "CALM": "calm",
            "ANGRY": "energetic",
            "FEAR": "dark",
        }
        query_tag = tag_map.get(target_emotion.upper(), "calm")

        params = {
            "client_id": settings.JAMENDO_CLIENT_ID,
            "format": "json",
            "limit": 15,
            "fuzzytags": query_tag,
            "boost": "popularity_month",
        }

        query_string = urllib.parse.urlencode(params)
        url = f"https://api.jamendo.com/v3.0/tracks/?{query_string}"

        req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
        with urllib.request.urlopen(req, timeout=5) as response:
            data = json.loads(response.read().decode())

            # Jamendo sometimes returns HTTP 200 with a failed status for rate limits or invalid client IDs
            if data.get("headers", {}).get("status") == "failed":
                error_msg = data.get("headers", {}).get(
                    "error_message", "Unknown API error"
                )
                raise Exception(f"Jamendo API Error: {error_msg}")

            results = data.get("results", [])

            for item in results:
                track_id = item.get("id")
                title = item.get("name")
                artist = item.get("artist_name")
                audio_url = item.get("audio")
                cover_img = item.get("image")

                if track_id and title and artist and audio_url:
                    song_id = f"jamendo_{track_id}"

                    # Dynamically register in standard database Song table to respect foreign keys (feedback/history)
                    existing = db.query(Song).filter(Song.id == song_id).first()
                    if not existing:
                        existing = Song(
                            id=song_id,
                            title=title.strip(),
                            artist=artist.strip(),
                            album=item.get("album_name") or "Jamendo Album",
                            file_path=audio_url,
                            emotion_tag=target_emotion.upper(),
                            duration=int(item.get("duration") or 180),
                            cover_url=cover_img,
                            is_active=True,
                        )
                        db.add(existing)
                        db.commit()
                        db.refresh(existing)
                    else:
                        # Update cover_url if not already stored
                        if not existing.cover_url and cover_img:
                            existing.cover_url = cover_img
                            db.add(existing)
                            db.commit()
                            db.refresh(existing)

                    jamendo_songs.append(existing)
    except Exception as e:
        import logging

        logging.getLogger("genharmony.api").error(f"Jamendo integration failed: {e}")
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Failed to fetch recommendations from Jamendo API.",
        )

    # Personalize: Sort recommendations using the user's historical ratings
    user_ratings = feedback_repository.get_user_ratings_map(db, user_id=current_user.id)
    jamendo_songs.sort(key=lambda s: user_ratings.get(s.id, 0), reverse=True)
    return jamendo_songs


@router.post(
    "/generate",
    response_model=GeneratedMusicResponse,
    status_code=status.HTTP_201_CREATED,
)
def generate_music(
    req: GenerateMusicRequest,
    current_user: User = Depends(auth_service.get_current_user),
    db: Session = Depends(get_db),
):
    """
    Generate new audio track using AI matching user's prompt and tag.
    Supports emotions: HAPPY, SAD, ANGRY, CALM, NEUTRAL, SURPRISE.
    Duration must be between 10 and 30 seconds (default 15).
    If both prompt and emotion_tag are provided, prompt takes priority.
    """
    # Validate that at least one of emotion_tag or prompt is provided
    if not req.emotion_tag and not req.prompt:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Either 'emotion_tag' or 'prompt' must be provided.",
        )

    # Validate emotion tag if provided
    valid_tags = ["HAPPY", "SAD", "ANGRY", "CALM", "NEUTRAL", "SURPRISE", "FEAR"]
    emotion = (req.emotion_tag or "NEUTRAL").upper()
    if emotion not in valid_tags:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid emotion tag. Must be one of: {', '.join(valid_tags)}",
        )

    # Validate duration
    duration = req.duration if req.duration is not None else settings.MUSICGEN_DEFAULT_DURATION
    if duration < settings.MUSICGEN_MIN_DURATION or duration > settings.MUSICGEN_MAX_DURATION:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Duration must be between {settings.MUSICGEN_MIN_DURATION} and {settings.MUSICGEN_MAX_DURATION} seconds.",
        )

    # Generate audio file (custom prompt takes priority over emotion)
    try:
        file_path = music_gen_service.generate_track(
            emotion_tag=emotion,
            custom_prompt=req.prompt,
            duration=duration,
        )
    except RuntimeError as e:
        # Concurrency protection: generation already in progress
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail=str(e),
        )
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )
    except Exception as e:
        import logging
        logging.getLogger("genharmony.api").error(f"Music generation failed: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="AI music generation failed. Please try again later.",
        )

    # Save metadata entry in database
    prompt_text = req.prompt if req.prompt else f"AI Generated {emotion.capitalize()} Music"
    db_obj = generated_music_repository.create_generated_music(
        db,
        user_id=current_user.id,
        prompt=prompt_text,
        emotion_tag=emotion,
        file_path=file_path,
    )
    return db_obj


@router.get("/generated/history", response_model=List[GeneratedMusicResponse])
def list_generated_history(
    current_user: User = Depends(auth_service.get_current_user),
    db: Session = Depends(get_db),
):
    """
    List all AI music generated by the current user.
    """
    return generated_music_repository.get_user_generated_music(
        db, user_id=current_user.id
    )


@router.get("/stream/generated/{generated_music_id}")
def stream_generated_music(
    generated_music_id: str,
    current_user: User = Depends(auth_service.get_current_user),
    db: Session = Depends(get_db),
):
    """
    Securely stream generated AI music track files.
    Auto-synthesizes missing audio on demand if storage was cleared.
    """
    track = generated_music_repository.get(db, generated_music_id)
    if not track:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Generated track not found."
        )
    if track.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied to this generated track.",
        )

    file_abs_path = os.path.join(settings.BASE_DIR, track.file_path)
    if not os.path.exists(file_abs_path):
        # Auto re-synthesize file on demand if cleaned up
        os.makedirs(os.path.dirname(file_abs_path), exist_ok=True)
        try:
            music_gen_service._generate_procedural_track(
                emotion=track.emotion_tag.lower() if track.emotion_tag else "calm",
                prompt=track.prompt or "",
                abs_path=file_abs_path,
                rel_path=track.file_path,
                duration=15,
            )
        except Exception:
            pass

    if not os.path.exists(file_abs_path):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Audio file is missing on storage.",
        )

    return FileResponse(file_abs_path, media_type="audio/wav")


@router.get("/{song_id}", response_model=SongResponse)
def get_song(
    song_id: str,
    current_user: User = Depends(auth_service.get_current_user),
    db: Session = Depends(get_db),
):
    """
    Get detailed metadata of a song.
    """
    song = song_repository.get(db, song_id)
    if not song:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Song not found."
        )
    return song


@router.post(
    "/upload", response_model=SongResponse, status_code=status.HTTP_201_CREATED
)
def upload_song(
    title: str = Form(...),
    artist: str = Form(...),
    album: Optional[str] = Form(default=None),
    emotion_tag: str = Form(...),
    genre: str = Form(...),
    file: UploadFile = File(...),
    cover: Optional[UploadFile] = File(default=None),
    current_admin: User = Depends(auth_service.get_current_admin),
    db: Session = Depends(get_db),
):
    """
    Upload a new song file and tag it with an emotion. (Admin only)
    Stores song in predefined library and Cloudinary cloud storage.
    """
    # 1. Validate metadata
    if not title.strip():
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Title cannot be empty.")
    if not artist.strip():
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Artist cannot be empty.")
    if not genre.strip():
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Genre cannot be empty.")

    valid_tags = ["HAPPY", "SAD", "ANGRY", "CALM", "FEAR", "NEUTRAL", "SURPRISE"]
    if emotion_tag.upper() not in valid_tags:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid emotion tag. Must be one of: {', '.join(valid_tags)}",
        )

    # 2. Validate audio file
    if not file.filename:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid audio file name.")

    ext = os.path.splitext(file.filename)[1].lower()
    if ext not in [".mp3", ".wav"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Unsupported audio format. Only .mp3 and .wav files are allowed.",
        )

    allowed_mimes = ["audio/mpeg", "audio/mp3", "audio/wav", "audio/x-wav", "audio/x-mpeg"]
    if file.content_type not in allowed_mimes:
        # Fallback check if browser did not set correct MIME type but extension is valid
        if ext not in [".mp3", ".wav"]:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid file MIME type: {file.content_type}",
            )

    # Validate file size (max 25MB)
    MAX_FILE_SIZE = 25 * 1024 * 1024
    try:
        file.file.seek(0, os.SEEK_END)
        file_size = file.file.tell()
        file.file.seek(0)
    except Exception:
        file_size = 0

    if file_size > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="File size too large. Maximum allowed size is 25MB.",
        )

    # 3. Validate cover file if provided
    if cover and cover.filename:
        cover_ext = os.path.splitext(cover.filename)[1].lower()
        if cover_ext not in [".jpg", ".jpeg", ".png", ".webp"]:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Unsupported cover image format. Only .jpg, .jpeg, .png, and .webp are allowed.",
            )

    return song_service.upload_song(
        db,
        title=title.strip(),
        artist=artist.strip(),
        album=album.strip() if album else None,
        emotion_tag=emotion_tag.upper(),
        file=file,
        genre=genre.strip(),
        cover=cover if (cover and cover.filename) else None,
        admin_id=current_admin.id,
    )


@router.post("/import-csv", response_model=dict)
def import_csv_dataset(
    file_path: Optional[str] = Form(None),
    file: Optional[UploadFile] = File(None),
    current_admin: User = Depends(auth_service.get_current_admin),
    db: Session = Depends(get_db),
):
    """
    Import a song dataset from a CSV file (uploaded or local filepath). (Admin only)
    """
    import csv
    import io
    import uuid
    from app.models.song import Song

    rows = []

    if file:
        try:
            content = file.file.read()
            decoded = content.decode("utf-8-sig")
            csv_reader = csv.DictReader(io.StringIO(decoded))
            rows = list(csv_reader)
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Error reading uploaded CSV file: {str(e)}",
            )
    elif file_path:
        if not os.path.exists(file_path):
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"CSV file not found at the specified path: {file_path}",
            )
        try:
            with open(file_path, mode="r", encoding="utf-8-sig") as f:
                csv_reader = csv.DictReader(f)
                rows = list(csv_reader)
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Error reading local CSV file: {str(e)}",
            )
    else:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Either a CSV file upload or a local file path must be provided.",
        )

    if not rows:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="The CSV file is empty or has invalid format.",
        )

    # Helper to retrieve CSV column case-insensitively
    def get_csv_value(row_dict, field_choices):
        for choice in field_choices:
            for key in row_dict.keys():
                if key.lower().strip() == choice.lower().strip():
                    return row_dict[key]
        return None

    # Column key choices
    title_choices = [
        "song_name",
        "song name",
        "name",
        "title",
        "track_name",
        "track name",
    ]
    artist_choices = ["artist", "artist_name", "artist name", "singer", "band"]
    album_choices = ["genre", "album", "album_name", "album name"]
    mood_choices = [
        "mood",
        "sentiment_label",
        "sentiment",
        "emotion_tag",
        "emotion",
        "tag",
    ]
    sentiment_choices = ["sentiment_label", "sentiment"]

    songs_imported = 0
    songs_skipped = 0

    for row in rows:
        title = get_csv_value(row, title_choices)
        artist = get_csv_value(row, artist_choices)

        if not title or not artist:
            songs_skipped += 1
            continue

        title = title.strip()
        artist = artist.strip()

        # Avoid duplicates
        existing = (
            db.query(Song).filter(Song.title == title, Song.artist == artist).first()
        )
        if existing:
            songs_skipped += 1
            continue

        # Album / Genre
        album = get_csv_value(row, album_choices)
        album = album.strip() if album else "Single"

        # Mood / Sentiment mapping
        mood = get_csv_value(row, mood_choices)
        sentiment = get_csv_value(row, sentiment_choices)

        m_lower = (mood or "").lower().strip()
        s_lower = (sentiment or "").lower().strip()

        # Map to GenHarmony tags: HAPPY, SAD, CALM, ANGRY, FEAR
        emotion_tag = "CALM"

        # Check mood
        if m_lower in ["happy", "joyful", "joy", "cheerful", "upbeat", "energetic"]:
            emotion_tag = "HAPPY"
        elif m_lower in [
            "sad",
            "melancholic",
            "melancholy",
            "emotional",
            "sorrowful",
            "depressed",
        ]:
            emotion_tag = "SAD"
        elif m_lower in ["calm", "soothing", "relaxed", "peaceful", "serene", "chill"]:
            emotion_tag = "CALM"
        elif m_lower in ["angry", "powerful", "aggressive", "rage", "furious"]:
            emotion_tag = "ANGRY"
        elif m_lower in ["fear", "scared", "spooky", "creepy", "tense"]:
            emotion_tag = "FEAR"
        # Check sentiment if mood mapping is default
        elif s_lower in ["happy", "motivated", "joyful", "excited"]:
            emotion_tag = "HAPPY"
        elif s_lower in ["sad", "depressed", "emotional"]:
            emotion_tag = "SAD"
        elif s_lower in ["relaxed", "calm", "peaceful"]:
            emotion_tag = "CALM"

        # File path
        song_id = str(uuid.uuid4())

        # Check if we can reuse default files
        if emotion_tag == "HAPPY":
            file_path = "music_library/sunlight_dance.mp3"
        elif emotion_tag == "CALM":
            file_path = "music_library/quiet_mind.mp3"
        else:
            file_path = f"music_library/imported_{song_id}.mp3"

        song = Song(
            id=song_id,
            title=title,
            artist=artist,
            album=album,
            file_path=file_path,
            emotion_tag=emotion_tag,
            duration=180,
            is_active=True,
        )
        db.add(song)
        songs_imported += 1

    try:
        db.commit()
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Database commit failed: {str(e)}",
        )

    return {
        "status": "success",
        "imported": songs_imported,
        "skipped": songs_skipped,
        "total": len(rows),
    }


@router.delete("/{song_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_song(
    song_id: str,
    current_admin: User = Depends(auth_service.get_current_admin),
    db: Session = Depends(get_db),
):
    """
    Delete a song from the library and remove its file. (Admin only)
    """
    return song_service.delete_song(db, song_id, admin_id=current_admin.id)


@router.get("/stream/{song_id}")
def stream_song(
    song_id: str,
    current_user: User = Depends(auth_service.get_current_user),
    db: Session = Depends(get_db),
):
    """
    Securely stream the audio file of a song. Checks JWT first.
    """
    song = song_repository.get(db, song_id)
    if not song:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Song not found."
        )

    # If the song file path is a remote Jamendo stream URL, redirect client directly to it
    if song.file_path.startswith("http://") or song.file_path.startswith("https://"):
        from fastapi.responses import RedirectResponse

        return RedirectResponse(song.file_path)

    file_abs_path = os.path.join(settings.BASE_DIR, song.file_path)
    if not os.path.exists(file_abs_path):
        # Seed a valid 10-second silent WAV file as a placeholder if missing
        os.makedirs(os.path.dirname(file_abs_path), exist_ok=True)
        import wave

        with wave.open(file_abs_path, "wb") as w:
            w.setnchannels(1)
            w.setsampwidth(1)  # 8-bit PCM
            w.setframerate(8000)
            w.writeframes(b"\x80" * 80000)  # 10 seconds of silence

    # Sniff media type based on file header
    with open(file_abs_path, "rb") as f:
        header = f.read(4)
    media_type = "audio/wav" if header == b"RIFF" else "audio/mpeg"

    return FileResponse(file_abs_path, media_type=media_type)
