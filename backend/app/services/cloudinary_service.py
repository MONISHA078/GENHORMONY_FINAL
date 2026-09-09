import cloudinary
import cloudinary.uploader
import cloudinary.api
from app.utils.config import settings

# Configure Cloudinary
if settings.CLOUDINARY_CLOUD_NAME and settings.CLOUDINARY_API_KEY and settings.CLOUDINARY_API_SECRET:
    cloudinary.config(
        cloud_name=settings.CLOUDINARY_CLOUD_NAME,
        api_key=settings.CLOUDINARY_API_KEY,
        api_secret=settings.CLOUDINARY_API_SECRET,
        secure=True,
    )

class CloudinaryService:
    @staticmethod
    def upload_song(file_path: str, public_id: str = None) -> dict:
        """
        Uploads a song to Cloudinary.
        """
        try:
            # Upload the file
            # resource_type "video" is used for audio files as well in Cloudinary
            response = cloudinary.uploader.upload(
                file_path,
                resource_type="video",
                public_id=public_id,
                folder="genharmony/songs"
            )
            return {
                "success": True,
                "url": response.get("secure_url"),
                "public_id": response.get("public_id"),
                "duration": response.get("duration")
            }
        except Exception as e:
            return {
                "success": False,
                "error": str(e)
            }

    @staticmethod
    def delete_song(public_id: str) -> dict:
        """
        Deletes a song from Cloudinary by its public ID.
        """
        try:
            response = cloudinary.uploader.destroy(
                public_id,
                resource_type="video"
            )
            return {
                "success": True,
                "result": response.get("result")
            }
        except Exception as e:
            return {
                "success": False,
                "error": str(e)
            }

    @staticmethod
    def upload_cover(file_path: str, public_id: str = None) -> dict:
        """
        Uploads a cover image to Cloudinary.
        """
        try:
            response = cloudinary.uploader.upload(
                file_path,
                resource_type="image",
                public_id=public_id,
                folder="genharmony/covers"
            )
            return {
                "success": True,
                "url": response.get("secure_url"),
                "public_id": response.get("public_id")
            }
        except Exception as e:
            return {
                "success": False,
                "error": str(e)
            }

    @staticmethod
    def delete_cover(public_id: str) -> dict:
        """
        Deletes a cover image from Cloudinary by its public ID.
        """
        try:
            response = cloudinary.uploader.destroy(
                public_id,
                resource_type="image"
            )
            return {
                "success": True,
                "result": response.get("result")
            }
        except Exception as e:
            return {
                "success": False,
                "error": str(e)
            }

# Aliases for conceptual alignment
CloudinaryService.upload_music = CloudinaryService.upload_song
CloudinaryService.delete_music = CloudinaryService.delete_song
