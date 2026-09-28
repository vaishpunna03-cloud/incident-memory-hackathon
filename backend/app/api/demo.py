from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db, SessionLocal
from app.models.incident import Incident, IncidentInvestigation
from app.models.memory import MemoryRecord
from app.services.seed_service import seed_database
from app.agent.investigator import investigator

router = APIRouter(prefix="/demo", tags=["Demo"])

@router.get("/before")
async def get_demo_before(db: Session = Depends(get_db)):
    """Simulates investigation WITHOUT operational memory."""
    incident_104 = {
        "id": "INC-104-DEMO",
        "service_id": "payment-api",
        "title": "Payment API database connection timeout",
        "error_message": "database connection timeout in pool",
        "environment": "Production",
        "severity": "High",
        "deployment_version": "v2.1.0",
        "deployment_commit": "a4f89d1"
    }

    dummy_inc = Incident(
        id=incident_104["id"],
        service_id=incident_104["service_id"],
        title=incident_104["title"],
        error_message=incident_104["error_message"],
        environment=incident_104["environment"],
        severity=incident_104["severity"],
        deployment_version=incident_104["deployment_version"],
        deployment_commit=incident_104["deployment_commit"]
    )

    # Investigate with use_memory = False
    inv = await investigator.investigate(dummy_inc, db, use_memory=False)
    
    return {
        "mode": "WITHOUT_MEMORY",
        "title": "Without Operational Memory (Generic Triage)",
        "approach": "Isolated Telemetry Analysis",
        "behavior": [
            {"step": "1. Generic Troubleshooting", "detail": "Analyzes raw error string without historical context."},
            {"step": "2. Pod Restart Recommended", "detail": "Runbook recommends restarting the pod to clear connections (ignoring past lessons)."},
            {"step": "3. Blind Configuration Check", "detail": "No awareness that previous deployment v1.8.2 had an identical pool sizing defect."},
            {"step": "4. Trial-and-Error MTTR", "detail": "Estimated 45-60 minutes spent diagnosing recurring saturation post-restart."}
        ],
        "investigation": inv
    }

@router.get("/after")
async def get_demo_after(db: Session = Depends(get_db)):
    """Simulates investigation WITH Hindsight operational memory."""
    # Ensure INC-071 is in memory
    inc_104 = db.query(Incident).filter(Incident.id == "INC-104").first()
    if not inc_104:
        inc_104 = Incident(
            id="INC-104",
            service_id="payment-api",
            title="Payment API database connection timeout",
            error_message="database connection timeout in pool",
            description="Checkout gateway throwing 504 timeouts. Active connections saturating after deployment v2.1.0.",
            environment="Production",
            severity="High",
            deployment_version="v2.1.0",
            deployment_commit="a4f89d1"
        )
        db.add(inc_104)
        db.commit()
        db.refresh(inc_104)

    inv = await investigator.investigate(inc_104, db, use_memory=True)

    return {
        "mode": "WITH_HINDSIGHT_MEMORY",
        "title": "With Hindsight Operational Memory (Contextual SRE)",
        "approach": "Historical Precedent + Live Telemetry Synthesis",
        "behavior": [
            {"step": "1. Historical Incident Recalled", "detail": "Instantly recalls INC-071 (87% historical relevance) on payment-api."},
            {"step": "2. Previous Failed Attempt Avoided", "detail": "Explicitly warns: 'Do NOT restart pods alone—INC-071 proved exhaustion recurs in 3 mins.'"},
            {"step": "3. Root Cause Targeted", "detail": "Directs engineer straight to deployment v2.1.0 connection pool config parameters."},
            {"step": "4. Accelerated MTTR", "detail": "Investigation generated in seconds with actionable verification runbook."}
        ],
        "investigation": inv
    }

@router.post("/reset")
def reset_demo_data(db: Session = Depends(get_db)):
    """Resets database and reseeds baseline dataset."""
    db.query(IncidentInvestigation).delete()
    db.query(MemoryRecord).delete()
    db.query(Incident).delete()
    db.commit()
    seed_database(db)
    return {"status": "success", "message": "Demo data successfully reset to clean baseline"}
