import sys
from pathlib import Path

# Ensure backend directory is in sys.path for direct execution from any directory
backend_dir = str(Path(__file__).resolve().parent.parent)
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

try:
    from app.config import settings
    from app.database import init_db, SessionLocal
    from app.services.seed_service import seed_database
    from app.api import api_router
except (ImportError, ModuleNotFoundError):
    from config import settings
    from database import init_db, SessionLocal
    from services.seed_service import seed_database
    from api import api_router

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize database tables
    init_db()
    # Seed initial dataset if empty
    db = SessionLocal()
    try:
        seed_database(db)
    finally:
        db.close()
    yield

app = FastAPI(
    title="Incident Memory - AI Incident Response & Root-Cause Agent",
    description="Enterprise SRE operational memory system powered by Hindsight.",
    version="1.0.0",
    lifespan=lifespan
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount all API routes
app.include_router(api_router)

@app.get("/")
def root():
    return {
        "product": "Incident Memory",
        "description": "AI-powered incident investigation with long-term operational memory.",
        "version": "1.0.0",
        "docs": "/docs",
        "status": "operational",
        "memory_provider": settings.MEMORY_PROVIDER,
        "llm_provider": settings.active_llm_provider
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="127.0.0.1", port=settings.PORT, reload=True)
