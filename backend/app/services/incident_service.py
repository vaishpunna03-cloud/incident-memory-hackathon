import uuid
from typing import List, Optional
from sqlalchemy.orm import Session
from sqlalchemy import or_
from app.models.incident import Incident, IncidentEvent, IncidentInvestigation, Resolution
from app.models.memory import MemoryRecord
from app.schemas.incident import IncidentCreate, ResolutionCreate
from app.schemas.memory import MemoryRecordCreate, MemoryRecordResponse
from app.memory import get_memory_provider
from app.utils import now_utc

class IncidentService:
    @staticmethod
    def create_incident(data: IncidentCreate, db: Session) -> Incident:
        count = db.query(Incident).count() + 1
        # Format: INC-104 or next number
        inc_id = f"INC-{100 + count:03d}"
        
        inc = Incident(
            id=inc_id,
            service_id=data.service_id,
            title=data.title,
            error_message=data.error_message,
            description=data.description,
            environment=data.environment,
            severity=data.severity,
            status="active",
            deployment_version=data.deployment_version,
            deployment_commit=data.deployment_commit,
            incident_timestamp=data.incident_timestamp or now_utc(),
            created_at=now_utc()
        )
        db.add(inc)

        # Initial event
        ev = IncidentEvent(
            id=str(uuid.uuid4())[:8],
            incident_id=inc_id,
            event_type="Incident Created",
            description=f"Incident opened for {data.service_id} ({data.severity}) with error: '{data.error_message}'.",
            timestamp=now_utc(),
            metadata_json={"deployment": data.deployment_version}
        )
        db.add(ev)
        db.commit()
        db.refresh(inc)
        return inc

    @staticmethod
    def get_incident(incident_id: str, db: Session) -> Optional[Incident]:
        return db.query(Incident).filter(Incident.id == incident_id).first()

    @staticmethod
    def list_incidents(
        db: Session,
        service_id: Optional[str] = None,
        severity: Optional[str] = None,
        status: Optional[str] = None,
        search: Optional[str] = None
    ) -> List[Incident]:
        query = db.query(Incident)
        if service_id:
            query = query.filter(Incident.service_id == service_id)
        if severity:
            query = query.filter(Incident.severity == severity)
        if status:
            query = query.filter(Incident.status == status)
        if search:
            query = query.filter(
                or_(
                    Incident.id.ilike(f"%{search}%"),
                    Incident.title.ilike(f"%{search}%"),
                    Incident.error_message.ilike(f"%{search}%")
                )
            )
        return query.order_by(Incident.created_at.desc()).all()

    @staticmethod
    async def resolve_incident(
        incident_id: str,
        resolution_in: ResolutionCreate,
        db: Session
    ) -> Resolution:
        inc = db.query(Incident).filter(Incident.id == incident_id).first()
        if not inc:
            raise ValueError(f"Incident {incident_id} not found")

        now = now_utc()
        inc.status = "resolved"
        inc.resolved_at = now

        # Add event: Engineer Reviewed
        ev1 = IncidentEvent(
            id=str(uuid.uuid4())[:8],
            incident_id=incident_id,
            event_type="Engineer Reviewed",
            description=f"Engineer reviewed investigation and applied remediation.",
            timestamp=now,
            metadata_json={"resolved_by": resolution_in.resolved_by}
        )
        db.add(ev1)

        # Upsert Resolution
        res = db.query(Resolution).filter(Resolution.incident_id == incident_id).first()
        if not res:
            res = Resolution(
                id=f"RES-{incident_id.replace('INC-', '')}",
                incident_id=incident_id,
                root_cause=resolution_in.root_cause,
                fix_applied=resolution_in.fix_applied,
                result=resolution_in.result,
                lessons_learned=resolution_in.lessons_learned,
                failed_attempts=resolution_in.failed_attempts,
                resolved_by=resolution_in.resolved_by or "SRE On-Call Engineer",
                created_at=now
            )
            db.add(res)
        else:
            res.root_cause = resolution_in.root_cause
            res.fix_applied = resolution_in.fix_applied
            res.result = resolution_in.result
            res.lessons_learned = resolution_in.lessons_learned
            res.failed_attempts = resolution_in.failed_attempts

        # Add event: Incident Resolved
        ev2 = IncidentEvent(
            id=str(uuid.uuid4())[:8],
            incident_id=incident_id,
            event_type="Incident Resolved",
            description=f"Incident resolved: {resolution_in.result}.",
            timestamp=now,
            metadata_json={"fix": resolution_in.fix_applied}
        )
        db.add(ev2)
        db.commit()

        # Step 2: Extract useful knowledge & retain in Hindsight
        memory_provider = get_memory_provider()
        record_create = MemoryRecordCreate(
            incident_id=inc.id,
            service_id=inc.service_id,
            title=inc.title,
            original_error=inc.error_message,
            root_cause=resolution_in.root_cause,
            successful_fix=resolution_in.fix_applied,
            failed_attempt=resolution_in.failed_attempts or "Restarting service alone",
            deployment_context=f"{inc.deployment_version} ({inc.deployment_commit or 'config'})",
            lesson_learned=resolution_in.lessons_learned,
            runbook_step=f"Run verification commands for {inc.service_id} after deploy",
            tags=[inc.service_id, inc.severity.lower(), "retained"]
        )

        # Add event: Knowledge Extracted
        ev3 = IncidentEvent(
            id=str(uuid.uuid4())[:8],
            incident_id=incident_id,
            event_type="Knowledge Extracted",
            description="Extracted root cause, successful fix, failed attempts, and operational lessons.",
            timestamp=now,
            metadata_json={"tags": record_create.tags}
        )
        db.add(ev3)

        # Retain in memory
        await memory_provider.retain(record_create)

        # Add event: Memory Retained
        ev4 = IncidentEvent(
            id=str(uuid.uuid4())[:8],
            incident_id=incident_id,
            event_type="Memory Retained",
            description="Operational memory record persisted into Hindsight long-term storage.",
            timestamp=now,
            metadata_json={"memory_id": f"MEM-{incident_id.replace('INC-', '')}"}
        )
        db.add(ev4)
        db.commit()

        return res

incident_service = IncidentService()
