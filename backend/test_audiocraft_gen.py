import os
import sys

# Ensure backend root is in sys.path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.services.music_gen import music_gen_service

def test_generation():
    print("Starting AudioCraft MusicGen generation test...")
    try:
        # Generate happy music with 10 seconds duration
        rel_path = music_gen_service.generate_track("happy", duration=10)
        print(f"Generated track successfully: {rel_path}")
        
        # Verify file exists
        from app.utils.config import settings
        full_path = os.path.join(settings.BASE_DIR, rel_path)
        if os.path.exists(full_path):
            print(f"File exists: {full_path}")
            size = os.path.getsize(full_path)
            print(f"File size: {size} bytes")
            if size > 1000:
                print("SUCCESS: MusicGen generation works successfully!")
                return True
            else:
                print("FAILURE: Generated file is too small / empty.")
        else:
            print(f"FAILURE: Generated file not found at {full_path}")
    except Exception as e:
        print(f"FAILURE: Exception occurred: {e}")
        import traceback
        traceback.print_exc()
    return False

if __name__ == "__main__":
    test_generation()
