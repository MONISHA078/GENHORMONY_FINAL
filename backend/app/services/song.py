import os
import shutil
import logging
from sqlalchemy.orm import Session
from typing import Optional
from fastapi import UploadFile, HTTPException, status
from app.models.song import Song
from app.repositories.song import song_repository
from app.utils.config import settings

logger = logging.getLogger("genharmony.song")


class SongService:
    def save_song_file(self, file: UploadFile) -> str:
        """
        Saves the uploaded file to the music library storage directory.
        Returns the relative path.
        """
        filename = file.filename
        safe_filename = os.path.basename(filename)
        dest_path = os.path.join(settings.MUSIC_LIBRARY_DIR, safe_filename)

        try:
            file.file.seek(0)
            file_bytes = file.file.read()
            if file_bytes:
                with open(dest_path, "wb") as buffer:
                    buffer.write(file_bytes)
            file.file.seek(0)
            return f"music_library/{safe_filename}"
        except Exception as e:
            logger.error(f"Error saving song file: {e}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to save uploaded audio file.",
            )

    def upload_song(
        self,
        db: Session,
        title: str,
        artist: str,
        album: str,
        emotion_tag: str,
        file: UploadFile,
        genre: str = None,
        cover: Optional[UploadFile] = None,
        admin_id: Optional[str] = None,
    ) -> Song:
        """
        Registers a new song:
        1. Saves files temporarily to local storage.
        2. Uploads audio/cover files to Cloudinary.
        3. Saves database record.
        4. Rolls back Cloudinary upload if DB save fails.
        """
        import uuid
        os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
        
        # Save audio file to temp path
        temp_audio_path = os.path.join(settings.UPLOAD_DIR, f"temp_{uuid.uuid4()}_{file.filename}")
        try:
            file.file.seek(0)
            with open(temp_audio_path, "wb") as buffer:
                shutil.copyfileobj(file.file, buffer)
        except Exception as e:
            logger.error(f"Error saving temp audio file: {e}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to save uploaded audio file temporarily.",
            )

        # Optional cover image upload
        cover_url = None
        cover_public_id = None
        temp_cover_path = None
        if cover:
            temp_cover_path = os.path.join(settings.UPLOAD_DIR, f"temp_{uuid.uuid4()}_{cover.filename}")
            try:
                cover.file.seek(0)
                with open(temp_cover_path, "wb") as buffer:
                    shutil.copyfileobj(cover.file, buffer)
                
                from app.services.cloudinary_service import CloudinaryService
                logger.info(f"Uploading cover image to Cloudinary...")
                cover_res = CloudinaryService.upload_cover(temp_cover_path)
                if cover_res.get("success"):
                    cover_url = cover_res.get("url")
                    cover_public_id = cover_res.get("public_id")
                else:
                    raise HTTPException(
                        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                        detail=f"Cloudinary cover upload failed: {cover_res.get('error')}"
                    )
            except Exception as e:
                if os.path.exists(temp_audio_path):
                    os.remove(temp_audio_path)
                if temp_cover_path and os.path.exists(temp_cover_path):
                    os.remove(temp_cover_path)
                raise e

        # Upload audio to Cloudinary
        cloudinary_url = None
        cloudinary_public_id = None
        duration = 180
        
        try:
            from app.services.cloudinary_service import CloudinaryService
            logger.info(f"Uploading song '{title}' to Cloudinary...")
            res = CloudinaryService.upload_song(temp_audio_path)
            
            if res.get("success") and res.get("url"):
                cloudinary_url = res.get("url")
                cloudinary_public_id = res.get("public_id")
                if res.get("duration"):
                    duration = int(res.get("duration"))
                logger.info(f"Successfully uploaded song to Cloudinary: {cloudinary_url}")
            else:
                if cover_public_id:
                    CloudinaryService.delete_cover(cover_public_id)
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail=f"Cloudinary upload failed: {res.get('error')}"
                )
        except Exception as e:
            if os.path.exists(temp_audio_path):
                os.remove(temp_audio_path)
            if temp_cover_path and os.path.exists(temp_cover_path):
                os.remove(temp_cover_path)
            raise e

        # Clean up temp files
        if os.path.exists(temp_audio_path):
            os.remove(temp_audio_path)
        if temp_cover_path and os.path.exists(temp_cover_path):
            os.remove(temp_cover_path)

        # Create Song entry in DB
        try:
            new_song = Song(
                title=title,
                artist=artist,
                album=album if album else "Single",
                file_path=cloudinary_url,
                emotion_tag=emotion_tag.upper(),
                duration=duration,
                is_active=True,
                cover_url=cover_url,
                genre=genre,
                source="cloudinary",
                cloudinary_url=cloudinary_url,
                cloudinary_public_id=cloudinary_public_id,
            )
            created_song = song_repository.create(db, obj_in=new_song)

            # Log admin audit log
            if admin_id:
                try:
                    from app.models.admin_log import AdminLog
                    log_entry = AdminLog(
                        admin_id=admin_id,
                        action="UPLOAD_SONG",
                        details=f"Uploaded song: '{title}' by '{artist}' (ID: {created_song.id}, Source: cloudinary, Genre: {genre})"
                    )
                    db.add(log_entry)
                    db.commit()
                except Exception as log_err:
                    logger.warning(f"Failed to save admin audit log: {log_err}")

            return created_song
        except Exception as e:
            from app.services.cloudinary_service import CloudinaryService
            if cloudinary_public_id:
                CloudinaryService.delete_song(cloudinary_public_id)
            if cover_public_id:
                CloudinaryService.delete_cover(cover_public_id)
            logger.error(f"Database insertion failed, rolled back Cloudinary. Error: {e}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Database operation failed. Cloudinary upload rolled back.",
            )

    def delete_song(self, db: Session, song_id: str, admin_id: Optional[str] = None) -> None:
        """
        Removes a song metadata and deletes its physical/cloud file.
        """
        song = song_repository.get(db, song_id)
        if not song:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="Song not found."
            )

        details = f"Deleted song ID: {song.id}, Title: {song.title}, Source: {song.source or 'unknown'}"

        # If Cloudinary source, delete from Cloudinary using stored public_id
        if song.source == "cloudinary" and song.cloudinary_public_id:
            from app.services.cloudinary_service import CloudinaryService
            logger.info(f"Deleting song from Cloudinary with public_id: {song.cloudinary_public_id}")
            res = CloudinaryService.delete_song(song.cloudinary_public_id)
            
            if not res.get("success"):
                logger.error(f"Cloudinary deletion failed for {song.cloudinary_public_id}: {res.get('error')}")
                raise HTTPException(
                    status_code=status.HTTP_502_BAD_GATEWAY,
                    detail=f"Failed to delete audio file from Cloudinary: {res.get('error')}"
                )
                
            result_code = res.get("result")
            if result_code not in ["ok", "not found"]:
                logger.error(f"Cloudinary deletion returned non-ok result: {result_code}")
                raise HTTPException(
                    status_code=status.HTTP_502_BAD_GATEWAY,
                    detail=f"Cloudinary deletion returned result: {result_code}"
                )
            
            # Clean up cover url if also from cloudinary
            if song.cover_url and "cloudinary.com" in song.cover_url and "genharmony/covers" in song.cover_url:
                try:
                    parts = song.cover_url.split("/")
                    filename_ext = parts[-1]
                    cover_pub = f"genharmony/covers/{filename_ext.split('.')[0]}"
                    CloudinaryService.delete_cover(cover_pub)
                except Exception as cover_err:
                    logger.warning(f"Failed to delete cover image from Cloudinary: {cover_err}")

        elif song.source == "local" or (not song.source and not song.file_path.startswith("http")):
            file_abs_path = os.path.join(settings.BASE_DIR, song.file_path)
            if os.path.exists(file_abs_path):
                try:
                    os.remove(file_abs_path)
                except Exception as e:
                    logger.error(f"Error deleting song file from disk: {e}")

        # Remove database entry
        song_repository.remove(db, id=song_id)

        # Log admin audit log
        if admin_id:
            try:
                from app.models.admin_log import AdminLog
                log_entry = AdminLog(
                    admin_id=admin_id,
                    action="DELETE_SONG",
                    details=details
                )
                db.add(log_entry)
                db.commit()
            except Exception as log_err:
                logger.warning(f"Failed to save admin audit log: {log_err}")

        return None


song_service = SongService()
