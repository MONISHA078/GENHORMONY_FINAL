import csv
import uuid
from app.database.session import SessionLocal
from app.models.song import Song

# Mood mapping from Kaggle to GenHarmony standard tags
mood_map = {"Happy": "HAPPY", "Calm": "CALM", "Sad": "SAD", "Energetic": "ANGRY"}


def seed_kaggle():
    db = SessionLocal()
    try:
        csv_path = r"C:\Users\DELL\Downloads\data_moods.csv"
        print(f"Reading CSV from {csv_path}...")

        with open(csv_path, mode="r", encoding="utf-8") as f:
            reader = csv.DictReader(f)
            songs_added = 0

            for row in reader:
                title = row["name"]
                artist = row["artist"]
                album = row["album"]
                length_ms = int(row["length"])
                duration = int(length_ms / 1000)
                mood = row["mood"]

                emotion_tag = mood_map.get(mood, "CALM")

                # Dynamic audio mapping to existing physical files
                if emotion_tag == "HAPPY":
                    file_path = "music_library/sunlight_dance.mp3"
                else:
                    file_path = "music_library/quiet_mind.mp3"

                # Avoid duplicates
                existing = (
                    db.query(Song)
                    .filter(Song.title == title, Song.artist == artist)
                    .first()
                )
                if existing:
                    continue

                song = Song(
                    id=str(uuid.uuid4()),
                    title=title,
                    artist=artist,
                    album=album,
                    file_path=file_path,
                    emotion_tag=emotion_tag,
                    duration=duration,
                )
                db.add(song)
                songs_added += 1

            db.commit()
            print(
                f"Successfully seeded {songs_added} songs from Kaggle dataset into PostgreSQL database!"
            )
    except Exception as e:
        db.rollback()
        print(f"Error seeding database: {e}")
    finally:
        db.close()


if __name__ == "__main__":
    seed_kaggle()
