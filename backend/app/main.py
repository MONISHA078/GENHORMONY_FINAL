import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.utils.config import settings

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
    handlers=[logging.StreamHandler()],
)
logger = logging.getLogger("genharmony")

app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    docs_url="/docs",
    redoc_url="/redoc",
)

from app.api.router import api_router

# Set CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_origin_regex=r"https?://(localhost|127\.0\.0\.1|192\.168\.\d+\.\d+|10\.\d+\.\d+\.\d+|172\.(1[6-9]|2\d|3[0-1])\.\d+\.\d+)(:\d+)?",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router, prefix=settings.API_V1_STR)


@app.on_event("startup")
async def startup_event():
    logger.info("Running database initialization/seeding...")
    try:
        from app.database.seed import seed_db

        seed_db()
        logger.info("Database initialized and seeded successfully.")
    except Exception as e:
        logger.error(f"Error initializing database: {e}")

    logger.info("GenHarmony Backend API ready.")


@app.get("/")
def read_root():
    return {
        "message": "Welcome to GenHarmony Context-Aware Generative Music Engine API"
    }


@app.get("/health")
def health_check():
    return {"status": "healthy", "database": "configured"}
