from datetime import datetime
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, ConfigDict

class PostmortemBase(BaseModel):
    incident_id: str
    title: str
    summary: str
    impact: str
    timeline: List[Dict[str, Any]] = []
    root_cause: str
    evidence: List[str] = []
    what_worked: List[str] = []
    what_failed: List[str] = []
    resolution: str
    lessons_learned: List[str] = []
    prevention_recommendations: List[str] = []
    author: str = "SRE Lead Investigator"
    status: str = "Published"

class PostmortemCreate(PostmortemBase):
    pass

class PostmortemGenerateRequest(BaseModel):
    incident_id: str
    author: Optional[str] = "SRE Lead Investigator"

class PostmortemResponse(PostmortemBase):
    id: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
