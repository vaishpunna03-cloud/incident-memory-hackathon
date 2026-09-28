import re
from typing import List, Optional, Dict, Any
from app.memory.base import MemoryProvider
from app.schemas.memory import (
    HistoricalMatch, SimilarityFactors, MemoryRecordCreate,
    MemoryRecordResponse, MemoryStats
)
from app.database import SessionLocal
from app.models.memory import MemoryRecord
from app.models.incident import Incident
from app.utils import now_utc

class DemoMemoryProvider(MemoryProvider):
    def __init__(self):
        self.provider_name = "Demo Hindsight"
        self.status = "Demo Mode"

    def _tokenize(self, text: str) -> set:
        words = re.findall(r"\w+", (text or "").lower())
        stopwords = {"the", "a", "an", "is", "in", "of", "and", "or", "to", "for", "on", "at", "by", "with"}
        return set(w for w in words if w not in stopwords and len(w) > 2)

    def _compute_similarity(
        self,
        query: str,
        target_service: Optional[str],
        mem: MemoryRecord,
        context: Optional[Dict[str, Any]] = None
    ) -> HistoricalMatch:
        q_tokens = self._tokenize(query)
        mem_error_tokens = self._tokenize(mem.original_error + " " + mem.root_cause + " " + " ".join(mem.tags or []))
        
        # 1. Service match
        if target_service and mem.service_id.lower() == target_service.lower():
            service_score = 100.0
        elif target_service and ("payment" in target_service and "order" in mem.service_id):
            service_score = 65.0
        else:
            service_score = 30.0

        # 2. Error similarity (Jaccard + keyword overlaps)
        intersection = q_tokens.intersection(mem_error_tokens)
        union = q_tokens.union(mem_error_tokens)
        jaccard = (len(intersection) / len(union)) if union else 0.0
        
        # Boost if critical keywords match
        critical_keywords = ["pool", "timeout", "exhausted", "database", "connection", "memory", "leak", "jwt", "auth", "token", "lock", "deadlock"]
        overlap_critical = [k for k in critical_keywords if k in q_tokens and k in mem_error_tokens]
        boost = min(35.0, len(overlap_critical) * 15.0)
        error_score = min(98.0, round((jaccard * 65.0) + boost, 1))
        if error_score < 20.0 and len(intersection) > 0:
            error_score = 45.0

        # 3. Deployment context
        deploy_context = context.get("deployment_version", "") if context else ""
        if "config" in (mem.deployment_context or "").lower() or "pool" in (mem.deployment_context or "").lower():
            deployment_score = 80.0
        elif deploy_context and ("v1." in deploy_context or "v2." in deploy_context):
            deployment_score = 75.0
        else:
            deployment_score = 50.0

        # 4. Failure pattern match
        pattern_score = 85.0 if ("pool" in query.lower() or "timeout" in query.lower() or "exhaust" in query.lower()) else 60.0

        # Weighted Composite Relevance (label: historical relevance, NOT certainty)
        composite = round(
            (service_score * 0.35) +
            (error_score * 0.35) +
            (deployment_score * 0.15) +
            (pattern_score * 0.15),
            1
        )
        # Cap at 95% to avoid exaggerated certainty claims
        composite = min(95.0, composite)

        # Retrieval Reason
        reason_parts = []
        if service_score == 100.0:
            reason_parts.append(f"Identical service '{mem.service_id}'")
        else:
            reason_parts.append(f"Related service domain '{mem.service_id}'")
            
        if overlap_critical:
            reason_parts.append(f"shared keywords ({', '.join(overlap_critical)})")
        reason_parts.append(f"{error_score}% error signature alignment")

        retrieval_reason = "Why this memory was retrieved: " + "; ".join(reason_parts) + "."

        return HistoricalMatch(
            incident_id=mem.incident_id,
            service_id=mem.service_id,
            relevance_score=composite,
            factors=SimilarityFactors(
                service_match=service_score,
                error_similarity=error_score,
                deployment_context=deployment_score,
                failure_pattern=pattern_score
            ),
            original_error=mem.original_error,
            root_cause=mem.root_cause,
            successful_fix=mem.successful_fix,
            failed_attempt=mem.failed_attempt,
            deployment_context=mem.deployment_context,
            lesson_learned=mem.lesson_learned,
            runbook_step=mem.runbook_step,
            date=mem.created_at.strftime("%Y-%m-%d"),
            retrieval_reason=retrieval_reason
        )

    async def search(
        self,
        query: str,
        service_id: Optional[str] = None,
        top_k: int = 5,
        context: Optional[Dict[str, Any]] = None
    ) -> List[HistoricalMatch]:
        db = SessionLocal()
        try:
            records = db.query(MemoryRecord).all()
            if not records:
                return []

            exclude_id = context.get("exclude_incident_id") if context else None
            if exclude_id:
                records = [r for r in records if r.incident_id != exclude_id]

            matches = [
                self._compute_similarity(query, service_id, mem, context)
                for mem in records
            ]
            # Sort by composite relevance score descending
            matches.sort(key=lambda m: m.relevance_score, reverse=True)
            # Return top matches with relevance > 40%
            filtered = [m for m in matches if m.relevance_score >= 40.0]
            return filtered[:top_k] if filtered else matches[:top_k]
        finally:
            db.close()

    async def retain(self, record: MemoryRecordCreate) -> MemoryRecordResponse:
        db = SessionLocal()
        try:
            mem_id = f"MEM-{record.incident_id.replace('INC-', '')}"
            # Check if exists
            existing = db.query(MemoryRecord).filter(MemoryRecord.id == mem_id).first()
            if existing:
                existing.original_error = record.original_error
                existing.root_cause = record.root_cause
                existing.successful_fix = record.successful_fix
                existing.failed_attempt = record.failed_attempt
                existing.deployment_context = record.deployment_context
                existing.lesson_learned = record.lesson_learned
                existing.runbook_step = record.runbook_step
                existing.tags = record.tags
                db.commit()
                db.refresh(existing)
                return MemoryRecordResponse.model_validate(existing)
            
            new_record = MemoryRecord(
                id=mem_id,
                incident_id=record.incident_id,
                service_id=record.service_id,
                title=record.title,
                original_error=record.original_error,
                root_cause=record.root_cause,
                successful_fix=record.successful_fix,
                failed_attempt=record.failed_attempt,
                deployment_context=record.deployment_context,
                lesson_learned=record.lesson_learned,
                runbook_step=record.runbook_step,
                tags=record.tags,
                source="retained",
                created_at=now_utc()
            )
            db.add(new_record)
            db.commit()
            db.refresh(new_record)
            return MemoryRecordResponse.model_validate(new_record)
        finally:
            db.close()

    async def get_stats(self) -> MemoryStats:
        db = SessionLocal()
        try:
            records = db.query(MemoryRecord).order_by(MemoryRecord.created_at.desc()).all()
            total = len(records)
            unique_incidents = len(set(r.incident_id for r in records))
            unique_services = len(set(r.service_id for r in records))
            recent = [MemoryRecordResponse.model_validate(r) for r in records[:5]]

            return MemoryStats(
                total_memories=total,
                incidents_remembered=unique_incidents,
                services_count=unique_services,
                recent_memories=recent,
                provider_status="Connected (Demo)",
                provider_name="Hindsight Memory (Demo Adapter)"
            )
        finally:
            db.close()

    async def list_memories(
        self,
        limit: int = 50,
        service_id: Optional[str] = None
    ) -> List[MemoryRecordResponse]:
        db = SessionLocal()
        try:
            query = db.query(MemoryRecord)
            if service_id:
                query = query.filter(MemoryRecord.service_id == service_id)
            records = query.order_by(MemoryRecord.created_at.desc()).limit(limit).all()
            return [MemoryRecordResponse.model_validate(r) for r in records]
        finally:
            db.close()

    async def check_health(self) -> Dict[str, Any]:
        return {
            "status": "Demo Mode",
            "provider": "DemoMemoryProvider",
            "message": "Operational memory store active with local semantic retrieval",
            "healthy": True
        }
