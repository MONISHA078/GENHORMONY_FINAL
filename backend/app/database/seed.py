import logging
from sqlalchemy.orm import Session
from app.database.session import engine, SessionLocal, Base
from app.models.role import Role
from app.models.song import Song
from app.models.user import User
from app.utils.security import get_password_hash


logger = logging.getLogger("genharmony.seed")

DEFAULT_ROLES = ["ADMIN", "USER"]

DEFAULT_SONGS = [
    {
        "title": "Sunlight Dance",
        "artist": "GenHarmony Ensemble",
        "album": "Acoustic Joy",
        "file_path": "music_library/sunlight_dance.mp3",
        "emotion_tag": "HAPPY",
        "duration": 180,
    },
    {
        "title": "Summer Breeze",
        "artist": "Vibrant Vibes",
        "album": "Seasonal Beats",
        "file_path": "music_library/summer_breeze.mp3",
        "emotion_tag": "HAPPY",
        "duration": 210,
    },
    {
        "title": "Rainy Window",
        "artist": "Melancholia",
        "album": "Nocturnes",
        "file_path": "music_library/rainy_window.mp3",
        "emotion_tag": "SAD",
        "duration": 240,
    },
    {
        "title": "Lost Echoes",
        "artist": "Sorrow Key",
        "album": "Isolated",
        "file_path": "music_library/lost_echoes.mp3",
        "emotion_tag": "SAD",
        "duration": 195,
    },
    {
        "title": "Quiet Mind",
        "artist": "Zen Master",
        "album": "Chakra Flow",
        "file_path": "music_library/quiet_mind.mp3",
        "emotion_tag": "CALM",
        "duration": 300,
    },
    {
        "title": "Ocean Breeze",
        "artist": "Nature Whispers",
        "album": "Therapy",
        "file_path": "music_library/ocean_breeze.mp3",
        "emotion_tag": "CALM",
        "duration": 320,
    },
    {
        "title": "Thunderous Rage",
        "artist": "Heavy Pulse",
        "album": "Riot",
        "file_path": "music_library/thunderous_rage.mp3",
        "emotion_tag": "ANGRY",
        "duration": 150,
    },
    {
        "title": "Red Mist",
        "artist": "The Distortions",
        "album": "Aggression",
        "file_path": "music_library/red_mist.mp3",
        "emotion_tag": "ANGRY",
        "duration": 165,
    },
    {
        "title": "Shadow Whispers",
        "artist": "Creepy Keys",
        "album": "Nightmare",
        "file_path": "music_library/shadow_whispers.mp3",
        "emotion_tag": "FEAR",
        "duration": 220,
    },
    {
        "title": "Suspense Rising",
        "artist": "Cinematic Thrill",
        "album": "Tension Tracks",
        "file_path": "music_library/suspense_rising.mp3",
        "emotion_tag": "FEAR",
        "duration": 185,
    },
]


def seed_db():
    logger.info("Initializing database schema...")
    Base.metadata.create_all(bind=engine)

    # Self-healing migration: widen ID columns to support Jamendo IDs like jamendo_123456789
    from sqlalchemy import text
    try:
        with engine.connect() as conn:
            # Widen songs primary key to VARCHAR(100)
            conn.execute(text("ALTER TABLE songs ALTER COLUMN id TYPE VARCHAR(100)"))
            # Widen foreign key columns that reference songs.id
            conn.execute(text("ALTER TABLE feedback ALTER COLUMN song_id TYPE VARCHAR(100)"))
            conn.execute(text("ALTER TABLE play_history ALTER COLUMN song_id TYPE VARCHAR(100)"))
            # Add Cloudinary-related columns if they don't exist
            conn.execute(text("ALTER TABLE songs ADD COLUMN IF NOT EXISTS source VARCHAR(50)"))
            conn.execute(text("ALTER TABLE songs ADD COLUMN IF NOT EXISTS genre VARCHAR(100)"))
            conn.execute(text("ALTER TABLE songs ADD COLUMN IF NOT EXISTS cloudinary_url VARCHAR(512)"))
            conn.execute(text("ALTER TABLE songs ADD COLUMN IF NOT EXISTS cloudinary_public_id VARCHAR(255)"))
            # Set default source for existing songs to 'local' if they are null
            conn.execute(text("UPDATE songs SET source = 'local' WHERE source IS NULL"))
            conn.commit()
            logger.info("Schema widening and Cloudinary migration applied successfully.")
    except Exception as e:
        logger.info(f"Schema widening migration skipped or already applied: {e}")

    db: Session = SessionLocal()
    try:
        # Seed Roles
        logger.info("Seeding user roles...")
        role_map = {}
        for role_name in DEFAULT_ROLES:
            existing_role = db.query(Role).filter(Role.name == role_name).first()
            if not existing_role:
                new_role = Role(name=role_name)
                db.add(new_role)
                db.flush()
                logger.info(f"Added role: {role_name}")
                role_map[role_name] = new_role
            else:
                role_map[role_name] = existing_role

        # Seed Default Accounts
        logger.info("Seeding default user accounts...")
        default_accounts = [
            {
                "email": "admin@genharmony.com",
                "password": "admin123",
                "first_name": "GenHarmony",
                "last_name": "Admin",
                "role_name": "ADMIN",
            },
            {
                "email": "user@genharmony.com",
                "password": "user123",
                "first_name": "GenHarmony",
                "last_name": "User",
                "role_name": "USER",
            },
        ]
        for account in default_accounts:
            existing_user = (
                db.query(User)
                .filter(User.email == account["email"].lower())
                .first()
            )
            if not existing_user:
                role = role_map.get(account["role_name"])
                if role:
                    new_user = User(
                        email=account["email"].lower(),
                        hashed_password=get_password_hash(account["password"]),
                        first_name=account["first_name"],
                        last_name=account["last_name"],
                        role_id=role.id,
                        is_active=True,
                    )
                    db.add(new_user)
                    logger.info(f"Added default account: {account['email']} ({account['role_name']})")

        # Seed Songs
        logger.info("Seeding default emotion-categorized song library...")
        for song_data in DEFAULT_SONGS:
            existing_song = (
                db.query(Song)
                .filter(
                    Song.title == song_data["title"], Song.artist == song_data["artist"]
                )
                .first()
            )
            if not existing_song:
                new_song = Song(
                    title=song_data["title"],
                    artist=song_data["artist"],
                    album=song_data["album"],
                    file_path=song_data["file_path"],
                    emotion_tag=song_data["emotion_tag"],
                    duration=song_data["duration"],
                    source="local",
                )
                db.add(new_song)
                logger.info(f"Added song: {new_song.title} ({new_song.emotion_tag})")

        db.commit()
        logger.info("Seeding completed successfully.")
    except Exception as e:
        db.rollback()
        logger.error(f"Error seeding database: {e}")
        raise e
    finally:
        db.close()


if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)
    seed_db()
