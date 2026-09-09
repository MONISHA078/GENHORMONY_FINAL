# GenHarmony 🎵

GenHarmony is a premium multimodal, emotion-driven music intelligence engine. It captures user inputs (text, face, or voice) in real-time, fusses them together using a decision fusion service, classifies the user's emotional state (`HAPPY`, `SAD`, `CALM`, `ANGRY`, `FEAR`), and serves personalized, rating-sorted music recommendations.

---

## 🚀 Quick Start Guide

You can run GenHarmony either **locally (recommended if Docker Desktop is offline)** or using **Docker Compose**.

---

### Method 1: Local Run (Direct Execution)

Since PostgreSQL is running locally on port `5432`, you can execute the backend and frontend services directly on your Windows host.

#### 1. Backend Setup & Seeding
1. Open a terminal and navigate to the backend directory:
   ```powershell
   cd backend
   ```
2. Activate the pre-configured Python virtual environment:
   ```powershell
  .\venv\Scripts\activate
   ```
3. Initialize the database schema and seed default data (roles, standard song library):
   ```powershell
   python -m app.database.seed
   ```
   *Note: This connects to `postgresql://postgres:moni07@localhost:5432/music_db` and creates the necessary tables automatically.*
4. Start the FastAPI development server:
   ```powershell
   python -m uvicorn app.main:app --host 127.0.0.1 --port 8000
   ```
   > [!IMPORTANT]
   > On the first startup, the backend preloads the Hugging Face text-classification model (`bhadresh-savani/distilbert-base-uncased-emotion`), which is about **268MB**. The server might take **30 to 60 seconds** to start listening on port `8000` while downloading this model.

---

#### 2. Frontend Setup
1. Open a second terminal and navigate to the frontend directory:
   ```powershell
   cd frontend
   ```
2. Start the Vite development server:
   ```powershell
   npm run dev
   ```
   *The frontend is pre-configured to run on port `3000` and automatically proxies `/api/*` requests to the backend server running at `http://localhost:8000`.*
3. Open [http://localhost:3000](http://localhost:3000) in your web browser.

---

### Method 2: Running via Docker Compose

If your Docker daemon/Desktop is running, you can run the entire stack with a single command:

1. Navigate to the root directory containing `docker-compose.yml`:
   ```powershell
   docker-compose up -d --build
   ```
2. Docker will build and run three containers:
   - **Database (`db`)**: PostgreSQL container running on port `5432`.
   - **Backend (`backend`)**: FastAPI server running on port `8000`.
   - **Frontend (`frontend`)**: React / Vite application served on port `3000`.
3. Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🛠️ Configuration Details (.env Files)

### Backend Configuration (`backend/.env`)
The backend is configured using standard environment variables:
- **`DATABASE_URL`**: `postgresql://postgres:moni07@localhost:5432/music_db`
- **`SECRET_KEY`**: JWT token signing key (`genharmony_very_secure_key_987654321`)
- **`JAMENDO_CLIENT_ID`**: Client ID for fetching live tracks (`f1ef9f1f`)
- **`CLOUDINARY_*`**: Keys for storing uploaded profile/audio assets.

### Frontend Configuration (`frontend/.env`)
- **`VITE_API_URL`**: `http://localhost:8000` (specifies the backend target URL)

---

## 🔑 Default Accounts & Access

- **Admin Account (One-Click login from login screen)**:
  - **Email**: `admin@genharmony.com`
  - **Password**: `admin123`
  - *Clicking the "One-Click Admin Login" button on the UI will automatically request these credentials and create the admin account on the backend if it doesn't already exist.*

---

## 🧬 System Architecture

```mermaid
graph TD
    User([User App]) -->|Login / Auth| API[FastAPI Router]
    User -->|Capture Face, Audio, or Text| API
    API -->|Text| TextSvc[HuggingFace DistilBERT / Lexicon fallback]
    API -->|Face| FaceSvc[DeepFace / OpenCV Cascade fallback]
    API -->|Audio| VoiceSvc[Librosa Feature Extraction / Classifier]
    TextSvc & FaceSvc & VoiceSvc --> Fusion[Emotion Decision Fusion Service]
    Fusion -->|Resulting Tag| RecEngine[Recommendation Engine]
    RecEngine -->|Filter & Sort by User Rating| DB[(Database)]
    RecEngine -->|Predefined List| User
    User -->|Play / Stream| Stream[Streaming Endpoint with Auto-Silence Fallback]
```
