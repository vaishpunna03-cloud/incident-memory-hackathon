from datetime import datetime
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.incident import Incident, IncidentInvestigation
from app.models.memory import MemoryRecord
from app.models.service import Service
from app.schemas.health import DashboardStats
from app.api.health import get_system_health

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])

@router.get("/stats", response_model=DashboardStats)
async def get_dashboard_stats(db: Session = Depends(get_db)):
    total_inc = db.query(Incident).count()
    active_inc = db.query(Incident).filter(Incident.status == "active").count()
    resolved_inc = db.query(Incident).filter(Incident.status == "resolved").count()
    total_mem = db.query(MemoryRecord).count()
    services_count = db.query(Service).count()
    high_sev_inc = db.query(Incident).filter(Incident.severity.in_(["Critical", "High"])).count()

    recent_models = db.query(Incident).order_by(Incident.created_at.desc()).limit(8).all()
    recent = []
    for inc in recent_models:
        latest_inv = (
            db.query(IncidentInvestigation)
            .filter(IncidentInvestigation.incident_id == inc.id)
            .order_by(IncidentInvestigation.created_at.desc())
            .first()
        )
        match_count = len(latest_inv.historical_matches) if latest_inv and latest_inv.historical_matches else 0

        recent.append({
            "id": inc.id,
            "service_id": inc.service_id,
            "title": inc.title,
            "error_message": inc.error_message,
            "environment": inc.environment,
            "severity": inc.severity,
            "status": inc.status,
            "created_at": inc.created_at.isoformat(),
            "historical_match_count": match_count
        })

    health = await get_system_health(db)

    return DashboardStats(
        total_incidents=total_inc,
        active_incidents=active_inc,
        resolved_incidents=resolved_inc,
        historical_memories=total_mem,
        services_count=services_count,
        high_severity_incidents=high_sev_inc,
        system_health=health,
        recent_incidents=recent
    )
