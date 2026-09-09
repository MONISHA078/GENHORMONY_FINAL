# pyrefly: ignore [missing-import]
import pytest
import sys
import os
import uuid
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

# Add app directory to path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.main import app
from app.database.session import get_db, Base
from app.models.role import Role

# Setup temporary sqlite database for tests
SQLALCHEMY_DATABASE_URL = "sqlite:///./test_harmony.db"
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Re-create schemas
Base.metadata.drop_all(bind=engine)
Base.metadata.create_all(bind=engine)

# Seed roles table inside testing session
db = TestingSessionLocal()
if not db.query(Role).filter(Role.name == "USER").first():
    db.add(Role(id=str(uuid.uuid4()), name="USER"))
if not db.query(Role).filter(Role.name == "ADMIN").first():
    db.add(Role(id=str(uuid.uuid4()), name="ADMIN"))
db.commit()
db.close()

def override_get_db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()

app.dependency_overrides[get_db] = override_get_db
client = TestClient(app)

# Cache token globally for sub-tests
token_cache = {}

def test_user_registration():
    """
    Test user registration endpoint.
    """
    payload = {
        "email": "testuser@gmail.com",
        "password": "testpassword123",
        "first_name": "Test",
        "last_name": "User"
    }
    response = client.post("/api/v1/auth/register", json=payload)
    assert response.status_code == 201, f"Failed: {response.content}"
    data = response.json()
    assert data["email"] == "testuser@gmail.com"
    assert "id" in data

def test_user_login():
    """
    Test authentication and JWT retrieval.
    """
    payload = {
        "email": "testuser@gmail.com",
        "password": "testpassword123"
    }
    response = client.post("/api/v1/auth/login", json=payload)
    assert response.status_code == 200, f"Failed: {response.content}"
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"
    token_cache["token"] = data["access_token"]

def test_user_login_case_insensitive():
    """
    Test case-insensitive login email behavior.
    """
    payload = {
        "email": "TeStUsEr@GmaIL.CoM",
        "password": "testpassword123"
    }
    response = client.post("/api/v1/auth/login", json=payload)
    assert response.status_code == 200, f"Failed: {response.content}"
    data = response.json()
    assert "access_token" in data

def test_text_emotion_detection():
    """
    Test text-based sentiment analysis with JWT auth.
    """
    headers = {"Authorization": f"Bearer {token_cache['token']}"}
    payload = {"text": "I am feeling extremely happy and excited today!"}
    response = client.post("/api/v1/emotion/text", json=payload, headers=headers)
    assert response.status_code == 200
    data = response.json()
    assert "detected_emotion" in data
    assert "scores" in data
    assert "HAPPY" in data["scores"]

def test_multimodal_fusion():
    """
    Test decision fusion engine endpoint.
    """
    headers = {"Authorization": f"Bearer {token_cache['token']}"}
    payload = {
        "text_scores": {"HAPPY": 0.8, "SAD": 0.05, "CALM": 0.1, "ANGRY": 0.02, "FEAR": 0.03},
        "speech_scores": {"HAPPY": 0.4, "SAD": 0.1, "CALM": 0.2, "ANGRY": 0.2, "FEAR": 0.1},
        "face_scores": {"HAPPY": 0.7, "SAD": 0.05, "CALM": 0.15, "ANGRY": 0.05, "FEAR": 0.05}
    }
    response = client.post("/api/v1/emotion/fuse", json=payload, headers=headers)
    assert response.status_code == 200
    data = response.json()
    assert "detected_emotion" in data
    assert "scores" in data
    assert data["detected_emotion"] == "HAPPY"

def test_song_recommendations():
    """
    Test recommendation list endpoint.
    """
    headers = {"Authorization": f"Bearer {token_cache['token']}"}
    response = client.get("/api/v1/songs/recommend?emotion=HAPPY", headers=headers)
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)

def test_music_generation():
    """
    Test music generation endpoint.
    """
    headers = {"Authorization": f"Bearer {token_cache['token']}"}
    payload = {"emotion_tag": "HAPPY", "duration": 10}
    response = client.post("/api/v1/songs/generate", json=payload, headers=headers)
    assert response.status_code == 201, f"Failed: {response.content}"
    data = response.json()
    assert data["emotion_tag"] == "HAPPY"
    assert "file_path" in data
    assert "id" in data

# Clean up SQLite test file after test run finishes
@pytest.fixture(scope="session", autouse=True)
def cleanup(request):
    def remove_test_db():
        engine.dispose() # Dispose of the engine first to release connection locks
        if os.path.exists("./test_harmony.db"):
            os.remove("./test_harmony.db")
    request.addfinalizer(remove_test_db)