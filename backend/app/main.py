"""
FastAPI Main Application entry point for SignSpeak AI.
"""
import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .config import settings
from .inference.model_loader import gesture_model
from .services.recognition_service import recognition_service
from .api.routes import router

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger("signspeak.main")

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Load AI model into memory once
    logger.info("Initializing SignSpeak AI Backend...")
    loaded = gesture_model.load()
    if loaded:
        logger.info(f"Model successfully loaded. Supported classes ({len(gesture_model.labels)}): {gesture_model.labels}")
    else:
        logger.warning("No trained model loaded at startup. System will report 'model not ready'.")
    
    yield
    
    # Shutdown: Clean up resources
    logger.info("Shutting down SignSpeak AI Backend and releasing vision resources...")
    recognition_service.close()

app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="Real-Time Sign Language Recognition and Speech Translation API using MediaPipe and Deep Learning.",
    lifespan=lifespan
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Attach API routers
app.include_router(router)

@app.get("/")
def root():
    return {
        "service": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "docs_url": "/docs",
        "health_check": "/api/health",
        "model_loaded": gesture_model.is_loaded
    }
