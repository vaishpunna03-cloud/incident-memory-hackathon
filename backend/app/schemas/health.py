from datetime import datetime
from typing import Dict, Any, Optional
from pydantic import BaseModel

class HealthComponent(BaseModel):
    status: str # "Healthy", "Connected", "Demo Mode", "Unavailable"
    details: Optional[str] = None
    latency_ms: Optional[float] = None

class HealthResponse(BaseModel):
    status: str
    environment: str
    timestamp: datetime
    backend: HealthComponent
    database: HealthComponent
    hindsight: HealthComponent
    llm: HealthComponent
    api: HealthComponent

class DashboardStats(BaseModel):
    total_incidents: int
    active_incidents: int
    resolved_incidents: int
    historical_memories: int
    services_count: int
    high_severity_incidents: int
    system_health: HealthResponse
    recent_incidents: list = []
