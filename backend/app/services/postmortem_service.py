import uuid
from typing import List, Optional
from sqlalchemy.orm import Session
from app.models.incident import Incident, Resolution, IncidentInvestigation
from app.models.postmortem import Postmortem
from app.schemas.postmortem import PostmortemResponse
from app.llm import get_llm_provider
from app.utils import now_utc

class PostmortemService:
    @staticmethod
    async def generate_postmortem(
        incident_id: str,
        author: str,
        db: Session
    ) -> Postmortem:
        inc = db.query(Incident).filter(Incident.id == incident_id).first()
        if not inc:
            raise ValueError(f"Incident {incident_id} not found")

        res = db.query(Resolution).filter(Resolution.incident_id == incident_id).first()
        inv = db.query(IncidentInvestigation).filter(IncidentInvestigation.incident_id == incident_id).order_by(IncidentInvestigation.created_at.desc()).first()

        incident_dict = {
            "id": inc.id,
            "service_id": inc.service_id,
            "title": inc.title,
            "error_message": inc.error_message,
            "environment": inc.environment,
            "deployment_version": inc.deployment_version
        }

        resolution_dict = {
            "root_cause": res.root_cause if res else (inv.likely_root_cause if inv else "Under investigation"),
            "fix_applied": res.fix_applied if res else "Mitigation applied",
            "result": res.result if res else "Resolved",
            "lessons_learned": res.lessons_learned if res else "Documented in memory",
            "failed_attempts": res.failed_attempts if res else "",
            "resolved_by": author
        }

        inv_dict = {
            "current_evidence": inv.current_evidence if inv else [],
            "what_worked_before": inv.what_worked_before if inv else [],
            "what_failed_before": inv.what_failed_before if inv else []
        }

        llm = get_llm_provider()
        data = await llm.generate_postmortem(incident_dict, resolution_dict, inv_dict)

        # Check existing
        existing = db.query(Postmortem).filter(Postmortem.incident_id == incident_id).first()
        if existing:
            existing.title = data["title"]
            existing.summary = data["summary"]
            existing.impact = data["impact"]
            existing.timeline = data["timeline"]
            existing.root_cause = data["root_cause"]
            existing.evidence = data["evidence"]
            existing.what_worked = data["what_worked"]
            existing.what_failed = data["what_failed"]
            existing.resolution = data["resolution"]
            existing.lessons_learned = data["lessons_learned"]
            existing.prevention_recommendations = data["prevention_recommendations"]
            existing.author = author
            existing.status = "Published"
            db.commit()
            db.refresh(existing)
            return existing

        pm = Postmortem(
            id=f"PM-{incident_id.replace('INC-', '')}",
            incident_id=incident_id,
            title=data["title"],
            summary=data["summary"],
            impact=data["impact"],
            timeline=data["timeline"],
            root_cause=data["root_cause"],
            evidence=data["evidence"],
            what_worked=data["what_worked"],
            what_failed=data["what_failed"],
            resolution=data["resolution"],
            lessons_learned=data["lessons_learned"],
            prevention_recommendations=data["prevention_recommendations"],
            author=author,
            status="Published",
            created_at=now_utc()
        )
        db.add(pm)
        db.commit()
        db.refresh(pm)
        return pm

    @staticmethod
    def list_postmortems(db: Session) -> List[Postmortem]:
        return db.query(Postmortem).order_by(Postmortem.created_at.desc()).all()

    @staticmethod
    def get_postmortem(postmortem_id: str, db: Session) -> Optional[Postmortem]:
        return db.query(Postmortem).filter(
            (Postmortem.id == postmortem_id) | (Postmortem.incident_id == postmortem_id)
        ).first()

postmortem_service = PostmortemService()
