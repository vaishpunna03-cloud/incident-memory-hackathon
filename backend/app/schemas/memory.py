from datetime import datetime
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field, ConfigDict

class SimilarityFactors(BaseModel):
    service_match: float = Field(..., description="Service match percentage (e.g. 100%)")
    error_similarity: float = Field(..., description="Error pattern similarity percentage")
    deployment_context: float = Field(..., description="Deployment context similarity")
    failure_pattern: float = Field(..., description="Failure pattern match")

class HistoricalMatch(BaseModel):
    incident_id: str
    service_id: str
    relevance_score: float = Field(..., description="Historical relevance percentage (not certainty)")
    factors: SimilarityFactors
    original_error: str
    root_cause: str
    successful_fix: str
    failed_attempt: Optional[str] = None
    deployment_context: Optional[str] = None
    lesson_learned: str
    runbook_step: Optional[str] = None
    date: str
    retrieval_reason: str = Field(..., description="Why this memory was retrieved")

class MemoryRecordBase(BaseModel):
    incident_id: str
    service_id: str
    title: str
    original_error: str
    root_cause: str
    successful_fix: str
    failed_attempt: Optional[str] = None
    deployment_context: Optional[str] = None
    lesson_learned: str
    runbook_step: Optional[str] = None
    tags: List[str] = []

class MemoryRecordCreate(MemoryRecordBase):
    pass

class MemoryRecordResponse(MemoryRecordBase):
    id: str
    source: str = "hindsight"
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

class MemoryStats(BaseModel):
    total_memories: int
    incidents_remembered: int
    services_count: int
    recent_memories: List[MemoryRecordResponse] = []
    provider_status: str # "Connected" or "Demo Mode"
    provider_name: str # "Hindsight" or "Demo Hindsight"

class MemorySearchQuery(BaseModel):
    query: str
    service_id: Optional[str] = None
    limit: int = 10
