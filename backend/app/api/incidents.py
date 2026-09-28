from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas.incident import (
    IncidentCreate, IncidentResponse, ResolutionCreate,
    ResolutionResponse, InvestigationResponse
)
from app.schemas.memory import HistoricalMatch
from app.services.incident_service import incident_service
from app.agent.investigator import investigator
from app.models.incident import Incident, IncidentInvestigation, Resolution
from app.memory import get_memory_provider

router = APIRouter(prefix="/incidents", tags=["Incidents"])

@router.post("", response_model=IncidentResponse)
def create_incident(incident_in: IncidentCreate, db: Session = Depends(get_db)):
    inc = incident_service.create_incident(incident_in, db)
    return inc

@router.get("", response_model=List[IncidentResponse])
def list_incidents(
    service_id: Optional[str] = Query(None),
    severity: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    incidents = incident_service.list_incidents(db, service_id, severity, status, search)
    results = []
    for inc in incidents:
        # Get count of historical matches or latest investigation
        latest_inv = (
            db.query(IncidentInvestigation)
            .filter(IncidentInvestigation.incident_id == inc.id)
            .order_by(IncidentInvestigation.created_at.desc())
            .first()
        )
        match_count = len(latest_inv.historical_matches) if latest_inv and latest_inv.historical_matches else 0
        
        inc_dict = {
            "id": inc.id,
            "service_id": inc.service_id,
            "title": inc.title,
            "error_message": inc.error_message,
            "description": inc.description,
            "environment": inc.environment,
            "severity": inc.severity,
            "status": inc.status,
            "deployment_version": inc.deployment_version,
            "deployment_commit": inc.deployment_commit,
            "incident_timestamp": inc.incident_timestamp,
            "created_at": inc.created_at,
            "resolved_at": inc.resolved_at,
            "historical_match_count": match_count,
            "events": inc.events,
            "resolution": inc.resolution,
            "latest_investigation": latest_inv
        }
        results.append(inc_dict)
    return results

@router.get("/{incident_id}", response_model=IncidentResponse)
def get_incident(incident_id: str, db: Session = Depends(get_db)):
    inc = incident_service.get_incident(incident_id, db)
    if not inc:
        raise HTTPException(status_code=404, detail="Incident not found")
    
    latest_inv = (
        db.query(IncidentInvestigation)
        .filter(IncidentInvestigation.incident_id == inc.id)
        .order_by(IncidentInvestigation.created_at.desc())
        .first()
    )
    match_count = len(latest_inv.historical_matches) if latest_inv and latest_inv.historical_matches else 0

    return {
        "id": inc.id,
        "service_id": inc.service_id,
        "title": inc.title,
        "error_message": inc.error_message,
        "description": inc.description,
        "environment": inc.environment,
        "severity": inc.severity,
        "status": inc.status,
        "deployment_version": inc.deployment_version,
        "deployment_commit": inc.deployment_commit,
        "incident_timestamp": inc.incident_timestamp,
        "created_at": inc.created_at,
        "resolved_at": inc.resolved_at,
        "historical_match_count": match_count,
        "events": inc.events,
        "resolution": inc.resolution,
        "latest_investigation": latest_inv
    }

@router.post("/{incident_id}/investigate", response_model=InvestigationResponse)
async def investigate_incident(
    incident_id: str,
    use_memory: bool = Query(True),
    db: Session = Depends(get_db)
):
    inc = incident_service.get_incident(incident_id, db)
    if not inc:
        raise HTTPException(status_code=404, detail="Incident not found")

    result = await investigator.investigate(incident=inc, db=db, use_memory=use_memory)
    return result

@router.get("/{incident_id}/memory", response_model=List[HistoricalMatch])
async def get_incident_memory(incident_id: str, db: Session = Depends(get_db)):
    inc = incident_service.get_incident(incident_id, db)
    if not inc:
        raise HTTPException(status_code=404, detail="Incident not found")

    memory_provider = get_memory_provider()
    query = f"{inc.error_message} {inc.title}"
    matches = await memory_provider.search(
        query=query,
        service_id=inc.service_id,
        top_k=5,
        context={"deployment_version": inc.deployment_version}
    )
    return matches

@router.post("/{incident_id}/resolve", response_model=ResolutionResponse)
async def resolve_incident(
    incident_id: str,
    resolution_in: ResolutionCreate,
    db: Session = Depends(get_db)
):
    try:
        res = await incident_service.resolve_incident(incident_id, resolution_in, db)
        return res
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
