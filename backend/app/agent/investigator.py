import uuid
from typing import Dict, Any, Optional
from sqlalchemy.orm import Session
from app.memory import get_memory_provider
from app.llm import get_llm_provider
from app.agent.evidence_engine import EvidenceEngine
from app.models.incident import Incident, IncidentEvent, IncidentInvestigation
from app.schemas.incident import InvestigationResponse
from app.utils import now_utc

class IncidentInvestigator:
    def __init__(self):
        self.memory_provider = get_memory_provider()
        self.llm_provider = get_llm_provider()

    async def investigate(
        self,
        incident: Incident,
        db: Session,
        use_memory: bool = True
    ) -> InvestigationResponse:
        # Step 1: Extract current verifiable evidence
        incident_dict = {
            "id": incident.id,
            "service_id": incident.service_id,
            "title": incident.title,
            "error_message": incident.error_message,
            "description": incident.description,
            "environment": incident.environment,
            "severity": incident.severity,
            "deployment_version": incident.deployment_version,
            "deployment_commit": incident.deployment_commit,
        }
        current_evidence = EvidenceEngine.extract_current_evidence(incident_dict)

        # Record event
        ev1 = IncidentEvent(
            id=str(uuid.uuid4())[:8],
            incident_id=incident.id,
            event_type="Evidence Collected",
            description=f"Collected {len(current_evidence)} telemetry and deployment evidence items.",
            timestamp=now_utc(),
            metadata_json={"evidence_count": len(current_evidence)}
        )
        db.add(ev1)
        db.commit()

        # Step 2: Query historical memory
        historical_matches = []
        if use_memory:
            query = f"{incident.error_message} {incident.title}"
            historical_matches = await self.memory_provider.search(
                query=query,
                service_id=incident.service_id,
                top_k=3,
                context={
                    "deployment_version": incident.deployment_version,
                    "exclude_incident_id": incident.id
                }
            )

            # Record event
            ev2 = IncidentEvent(
                id=str(uuid.uuid4())[:8],
                incident_id=incident.id,
                event_type="Historical Memory Retrieved",
                description=f"Retrieved {len(historical_matches)} historical memories from operational store.",
                timestamp=now_utc(),
                metadata_json={"match_count": len(historical_matches)}
            )
            db.add(ev2)
            db.commit()

        # Step 3: LLM Synthesis
        raw_result = await self.llm_provider.generate_investigation(
            incident_data=incident_dict,
            current_evidence=current_evidence,
            historical_matches=historical_matches,
            use_memory=use_memory
        )

        # Step 4: Persist Investigation in DB
        inv_id = f"INV-{uuid.uuid4().hex[:8]}"
        investigation_model = IncidentInvestigation(
            id=inv_id,
            incident_id=incident.id,
            summary=raw_result["summary"],
            likely_root_cause=raw_result["likely_root_cause"],
            confidence=raw_result["confidence"],
            relevance_score=raw_result["relevance_score"],
            current_evidence=raw_result["current_evidence"],
            historical_matches=[m.model_dump() if hasattr(m, "model_dump") else m for m in raw_result["historical_matches"]],
            evidence_chain=raw_result["evidence_chain"],
            why_factors=raw_result["why_factors"],
            what_worked_before=raw_result["what_worked_before"],
            what_failed_before=raw_result["what_failed_before"],
            recommended_steps=raw_result["recommended_steps"],
            verification_steps=raw_result["verification_steps"],
            risk_unknowns=raw_result["risk_unknowns"],
            prevention_recommendations=raw_result["prevention_recommendations"],
            memory_used=raw_result["memory_used"],
            is_contextual=raw_result["is_contextual"],
            created_at=now_utc()
        )
        db.add(investigation_model)

        # Record Investigation Generated event
        ev3 = IncidentEvent(
            id=str(uuid.uuid4())[:8],
            incident_id=incident.id,
            event_type="Investigation Generated",
            description="AI Root-Cause Agent synthesized current evidence with historical memory.",
            timestamp=now_utc(),
            metadata_json={"investigation_id": inv_id}
        )
        db.add(ev3)
        db.commit()

        return InvestigationResponse(
            incident_id=incident.id,
            summary=raw_result["summary"],
            likely_root_cause=raw_result["likely_root_cause"],
            confidence=raw_result["confidence"],
            relevance_score=raw_result["relevance_score"],
            current_evidence=raw_result["current_evidence"],
            historical_matches=historical_matches,
            evidence_chain=raw_result["evidence_chain"],
            why_factors=raw_result["why_factors"],
            what_worked_before=raw_result["what_worked_before"],
            what_failed_before=raw_result["what_failed_before"],
            recommended_steps=raw_result["recommended_steps"],
            verification_steps=raw_result["verification_steps"],
            risk_unknowns=raw_result["risk_unknowns"],
            prevention_recommendations=raw_result["prevention_recommendations"],
            memory_used=raw_result["memory_used"],
            is_contextual=raw_result["is_contextual"],
            created_at=investigation_model.created_at
        )

investigator = IncidentInvestigator()
