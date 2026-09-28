import time
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import text
from app.config import settings
from app.database import get_db
from app.schemas.health import HealthResponse, HealthComponent
from app.memory import get_memory_provider
from app.llm import get_llm_provider
from app.utils import now_utc

router = APIRouter(prefix="/health", tags=["Health"])

@router.get("", response_model=HealthResponse)
async def get_system_health(db: Session = Depends(get_db)):
    start_time = time.time()
    
    # 1. Database check
    db_status = "Connected"
    db_latency = None
    try:
        t0 = time.time()
        db.execute(text("SELECT 1"))
        db_latency = round((time.time() - t0) * 1000, 2)
    except Exception as e:
        db_status = "Unavailable"

    # 2. Memory Provider check
    memory_provider = get_memory_provider()
    mem_health = await memory_provider.check_health()

    # 3. LLM Provider check
    llm_provider = get_llm_provider()
    llm_health = await llm_provider.check_health()

    total_latency = round((time.time() - start_time) * 1000, 2)

    return HealthResponse(
        status="Healthy" if db_status != "Unavailable" else "Degraded",
        environment=settings.ENVIRONMENT,
        timestamp=now_utc(),
        backend=HealthComponent(
            status="Healthy",
            details="FastAPI backend operational",
            latency_ms=total_latency
        ),
        database=HealthComponent(
            status=db_status,
            details="PostgreSQL / SQLite Storage Engine",
            latency_ms=db_latency
        ),
        hindsight=HealthComponent(
            status=mem_health.get("status", "Demo Mode"),
            details=mem_health.get("provider", "Hindsight Memory")
        ),
        llm=HealthComponent(
            status=llm_health.get("status", "Demo Mode"),
            details=llm_health.get("provider", "SRE Reasoning Agent")
        ),
        api=HealthComponent(
            status="Healthy",
            details="REST API Endpoints Active"
        )
    )
