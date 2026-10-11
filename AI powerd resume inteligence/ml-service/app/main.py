from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import logging

from app.config import get_settings
from app.embeddings.transformer_service import TransformerService
from app.api import nlp_routes, embedding_routes, matching_routes, interview_routes

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s - %(message)s"
)
logger = logging.getLogger("careermind-ml")
settings = get_settings()

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: preload Transformer model once
    logger.info("Initializing CareerMind ML Service...")
    logger.info("Pre-warming Transformer embeddings and taxonomy models...")
    _ = TransformerService.get_instance()
    logger.info("ML Service is ready to serve inference requests.")
    yield
    logger.info("Shutting down CareerMind ML Service...")

app = FastAPI(
    title=settings.app_name,
    version=settings.app_version,
    description="Inference microservice for Sentence-BERT semantic matching, TF-IDF baseline, skill taxonomy normalization, and interview answer evaluation.",
    lifespan=lifespan
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API Routers
app.include_router(nlp_routes.router)
app.include_router(embedding_routes.router)
app.include_router(matching_routes.router)
app.include_router(interview_routes.router)

@app.get("/health", tags=["Health"])
def health_check():
    return {
        "status": "UP",
        "service": settings.app_name,
        "version": settings.app_version,
        "model": settings.model_name
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host=settings.host, port=settings.port, reload=settings.debug)
