from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, ConfigDict

class ServiceBase(BaseModel):
    id: str
    name: str
    description: Optional[str] = None
    tier: str = "Tier-1"
    dependencies: List[str] = []
    status: str = "operational"

class ServiceCreate(ServiceBase):
    pass

class ServiceResponse(ServiceBase):
    created_at: datetime
    incident_count: Optional[int] = 0
    memory_count: Optional[int] = 0
    recurring_causes: Optional[List[str]] = []

    model_config = ConfigDict(from_attributes=True)
