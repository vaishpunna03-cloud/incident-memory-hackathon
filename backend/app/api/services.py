from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.service import Service
from app.models.incident import Incident
from app.models.memory import MemoryRecord
from app.schemas.service import ServiceResponse

router = APIRouter(prefix="/services", tags=["Services"])

@router.get("", response_model=List[ServiceResponse])
def list_services(db: Session = Depends(get_db)):
    services = db.query(Service).all()
    results = []
    for s in services:
        inc_count = db.query(Incident).filter(Incident.service_id == s.id).count()
        mem_count = db.query(MemoryRecord).filter(MemoryRecord.service_id == s.id).count()
        
        # Get recurring causes
        mems = db.query(MemoryRecord).filter(MemoryRecord.service_id == s.id).all()
        recurring = list(set(m.root_cause for m in mems))[:3]

        resp = ServiceResponse(
            id=s.id,
            name=s.name,
            description=s.description,
            tier=s.tier,
            dependencies=s.dependencies or [],
            status=s.status,
            created_at=s.created_at,
            incident_count=inc_count,
            memory_count=mem_count,
            recurring_causes=recurring
        )
        results.append(resp)
    return results

@router.get("/{service_id}", response_model=ServiceResponse)
def get_service(service_id: str, db: Session = Depends(get_db)):
    s = db.query(Service).filter(Service.id == service_id).first()
    if not s:
        raise HTTPException(status_code=404, detail="Service not found")
        
    inc_count = db.query(Incident).filter(Incident.service_id == s.id).count()
    mem_count = db.query(MemoryRecord).filter(MemoryRecord.service_id == s.id).count()
    mems = db.query(MemoryRecord).filter(MemoryRecord.service_id == s.id).all()
    recurring = list(set(m.root_cause for m in mems))[:3]

    return ServiceResponse(
        id=s.id,
        name=s.name,
        description=s.description,
        tier=s.tier,
        dependencies=s.dependencies or [],
        status=s.status,
        created_at=s.created_at,
        incident_count=inc_count,
        memory_count=mem_count,
        recurring_causes=recurring
    )
