"""
FastAPI application entry point.
"""

from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from config import settings
from api.routes import router

backend_root = Path(__file__).resolve().parent
generated_root = backend_root / "generated"
generated_root.mkdir(parents=True, exist_ok=True)
frontend_models_root = backend_root.parent / "frontend" / "assets" / "models"

app = FastAPI(
    title="Fashion Designer Backend",
    description="LLM-powered garment preview generation",
    version="1.0.0",
)

# Configure CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.FRONTEND_URL, "http://localhost:8081", "exp://"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API routes
app.include_router(router, prefix="/api")
app.mount("/generated", StaticFiles(directory=generated_root), name="generated")
app.mount("/assets/models", StaticFiles(directory=frontend_models_root), name="model-assets")


@app.get("/")
async def root():
    """Root endpoint."""
    return {
        "service": "fashion-designer-backend",
        "version": "1.0.0",
        "endpoints": ["/api/generate", "/api/generate/stream", "/api/health"],
    }


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        "main:app",
        host=settings.HOST,
        port=settings.PORT,
        reload=True,
    )
