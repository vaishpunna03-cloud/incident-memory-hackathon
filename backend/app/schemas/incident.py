from datetime import datetime
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field, ConfigDict
from app.schemas.memory import HistoricalMatch

class IncidentBase(BaseModel):
    service_id: str
    title: str
    error_message: str
    description: Optional[str] = None
    environment: str = "Production"
    severity: str = "High"
    deployment_version: Optional[str] = None
    deployment_commit: Optional[str] = None
    incident_timestamp: Optional[datetime] = None

class IncidentCreate(IncidentBase):
    pass

class IncidentEventResponse(BaseModel):
    id: str
    incident_id: str
    event_type: str
    description: str
    timestamp: datetime
    metadata_json: Dict[str, Any] = {}

    model_config = ConfigDict(from_attributes=True)

class ResolutionCreate(BaseModel):
    root_cause: str
    fix_applied: str
    result: str = "Successfully Resolved"
    lessons_learned: str
    failed_attempts: Optional[str] = None
    resolved_by: Optional[str] = "SRE On-Call Engineer"

class ResolutionResponse(BaseModel):
    id: str
    incident_id: str
    root_cause: str
    fix_applied: str
    result: str
    lessons_learned: str
    failed_attempts: Optional[str] = None
    resolved_by: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

class EvidenceChainStep(BaseModel):
    step_id: int
    title: str
    description: str
    evidence_type: str # "current", "historical", "synthesis", "conclusion"
    icon: Optional[str] = None
    details: Optional[str] = None

class WhyFactor(BaseModel):
    factor: str
    explanation: str
    weight: str

class InvestigationResponse(BaseModel):
    incident_id: str
    summary: str
    likely_root_cause: str
    confidence: str # "High", "Medium", "Low"
    relevance_score: float # 0 - 100%
    current_evidence: List[str] = []
    historical_matches: List[HistoricalMatch] = []
    evidence_chain: List[EvidenceChainStep] = []
    why_factors: List[WhyFactor] = []
    what_worked_before: List[str] = []
    what_failed_before: List[str] = []
    recommended_steps: List[str] = []
    verification_steps: List[str] = []
    risk_unknowns: List[str] = []
    prevention_recommendations: List[str] = []
    memory_used: bool = True
    is_contextual: bool = True
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

class IncidentResponse(IncidentBase):
    id: str
    status: str
    created_at: datetime
    resolved_at: Optional[datetime] = None
    historical_match_count: int = 0
    latest_investigation: Optional[InvestigationResponse] = None
    resolution: Optional[ResolutionResponse] = None
    events: List[IncidentEventResponse] = []

    model_config = ConfigDict(from_attributes=True)
