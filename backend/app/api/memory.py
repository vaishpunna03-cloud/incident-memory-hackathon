from typing import List, Optional
from fastapi import APIRouter, HTTPException, Query, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.memory import get_memory_provider
from app.schemas.memory import (
    MemoryStats, MemoryRecordResponse, MemoryRecordCreate,
    HistoricalMatch
)

router = APIRouter(prefix="/memory", tags=["Memory"])

@router.get("/stats", response_model=MemoryStats)
async def get_memory_stats():
    memory_provider = get_memory_provider()
    return await memory_provider.get_stats()

@router.get("", response_model=List[MemoryRecordResponse])
async def list_memories(
    service_id: Optional[str] = Query(None),
    limit: int = Query(50)
):
    memory_provider = get_memory_provider()
    return await memory_provider.list_memories(limit=limit, service_id=service_id)

@router.post("/retain", response_model=MemoryRecordResponse)
async def retain_memory(record: MemoryRecordCreate):
    memory_provider = get_memory_provider()
    return await memory_provider.retain(record)

@router.get("/search", response_model=List[HistoricalMatch])
async def search_memory(
    q: str = Query(..., description="Search query string"),
    service_id: Optional[str] = Query(None),
    limit: int = Query(5)
):
    memory_provider = get_memory_provider()
    return await memory_provider.search(
        query=q,
        service_id=service_id,
        top_k=limit
    )
