from typing import Dict, Any, List, Optional
from app.llm.base import LLMProvider
from app.schemas.memory import HistoricalMatch
from app.utils import now_utc

class DemoLLMProvider(LLMProvider):
    """
    Deterministic enterprise SRE reasoning provider.
    Synthesizes current evidence with historical Hindsight memories.
    Produces rigorous, non-hallucinatory investigations adhering to SRE safety rules.
    """
    def __init__(self):
        self.provider_name = "Demo SRE Agent"

    async def generate_investigation(
        self,
        incident_data: Dict[str, Any],
        current_evidence: List[str],
        historical_matches: List[HistoricalMatch],
        use_memory: bool = True
    ) -> Dict[str, Any]:
        service = incident_data.get("service_id", "service")
        error = incident_data.get("error_message", "Unknown error")
        version = incident_data.get("deployment_version", "unknown")
        env = incident_data.get("environment", "Production")
        inc_id = incident_data.get("id", "INC-NEW")

        # CASE 1: WITHOUT MEMORY
        if not use_memory or not historical_matches:
            return {
                "incident_id": inc_id,
                "summary": f"Detected operational anomaly in {service} ({env}) throwing: '{error}'. Deployment version is {version}.",
                "likely_root_cause": "Generic service failure or unexpected infrastructure pressure. Service requires standard triaging.",
                "confidence": "Low",
                "relevance_score": 0.0,
                "current_evidence": current_evidence,
                "historical_matches": [],
                "evidence_chain": [
                    {
                        "step_id": 1,
                        "title": "Error Detected",
                        "description": f"Service {service} threw error: {error}",
                        "evidence_type": "current",
                        "icon": "alert-circle",
                        "details": f"Environment: {env}, Version: {version}"
                    },
                    {
                        "step_id": 2,
                        "title": "Deployment Identified",
                        "description": f"Recent deployment {version} recorded",
                        "evidence_type": "current",
                        "icon": "git-commit",
                        "details": "No historical context available for comparison"
                    },
                    {
                        "step_id": 3,
                        "title": "Generic Hypothesis",
                        "description": "Transient database network issue or container failure",
                        "evidence_type": "conclusion",
                        "icon": "help-circle",
                        "details": "Standard SRE runbook step: restart service and observe"
                    }
                ],
                "why_factors": [
                    {
                        "factor": "No Historical Memory Available",
                        "explanation": "Agent is operating in memory-isolated mode. Cannot compare previous failure modes or past fixes.",
                        "weight": "Primary Factor"
                    },
                    {
                        "factor": "Current Error Telemetry Only",
                        "explanation": f"Evaluation is strictly constrained to the raw error string '{error}'.",
                        "weight": "Secondary Factor"
                    }
                ],
                "what_worked_before": [],
                "what_failed_before": [],
                "recommended_steps": [
                    "Check service logs in central logging cluster (e.g. Datadog/Kibana)",
                    "Restart the application pod/service to clear transient locks",
                    "Verify downstream database connectivity manually",
                    "Escalate to on-call database administrator if restarts fail"
                ],
                "verification_steps": [
                    "Monitor error rate for 10 minutes post-restart",
                    "Ping database host from container terminal"
                ],
                "risk_unknowns": [
                    "Restarting may temporarily mask the root cause without fixing configuration",
                    "High risk of recurring outage once connections saturate again",
                    "Uncertainty regarding recent deployment configuration changes"
                ],
                "prevention_recommendations": [
                    "Enable long-term operational incident memory (Hindsight) to capture resolution patterns"
                ],
                "memory_used": False,
                "is_contextual": False,
                "created_at": now_utc()
            }

        # CASE 2: WITH HINDSIGHT MEMORY (The core product differentiator)
        top_match = historical_matches[0]
        
        # Build synthesis
        summary = (
            f"Active incident in {service} exhibiting '{error}' shortly after deployment {version}. "
            f"Operational memory recalled historical incident {top_match.incident_id} with {top_match.relevance_score}% historical relevance. "
            f"Current evidence indicates a pattern similar to previous resource saturation."
        )

        likely_root_cause = (
            f"Historical evidence suggests a connection configuration mismatch following deployment {version}, "
            f"resembling {top_match.incident_id} where {top_match.root_cause.lower()}. "
            f"Note: Historical memory is advisory context—verify active pool metrics before applying changes."
        )

        evidence_chain = [
            {
                "step_id": 1,
                "title": "Error Detected",
                "description": f"Service {service} threw error: {error}",
                "evidence_type": "current",
                "icon": "alert-circle",
                "details": f"Active in {env} under version {version}"
            },
            {
                "step_id": 2,
                "title": "Deployment Identified",
                "description": f"Deployment {version} introduced parameter modifications",
                "evidence_type": "current",
                "icon": "git-commit",
                "details": f"Commit hash tagged with recent configuration update"
            },
            {
                "step_id": 3,
                "title": "Relevant Metrics Extracted",
                "description": "Connection pool utilization reached 100% saturation threshold",
                "evidence_type": "current",
                "icon": "activity",
                "details": "Connections acquired steadily without release, latency spike detected"
            },
            {
                "step_id": 4,
                "title": f"Historical Memory Recalled: {top_match.incident_id}",
                "description": f"Retrieved prior resolution with {top_match.relevance_score}% historical relevance",
                "evidence_type": "historical",
                "icon": "brain",
                "details": f"Original failure: {top_match.original_error}"
            },
            {
                "step_id": 5,
                "title": "Similarity Factors Evaluated",
                "description": f"Service match: {top_match.factors.service_match}%, Error similarity: {top_match.factors.error_similarity}%, Failure pattern: {top_match.factors.failure_pattern}%",
                "evidence_type": "historical",
                "icon": "sliders",
                "details": top_match.retrieval_reason
            },
            {
                "step_id": 6,
                "title": "Previous Failed Attempt Avoided",
                "description": f"Prior incident showed that: '{top_match.failed_attempt or 'Restarting alone'}' failed",
                "evidence_type": "historical",
                "icon": "x-circle",
                "details": "Agent prevents wasting 15-30 minutes on ineffective pod restarts"
            },
            {
                "step_id": 7,
                "title": "Evidence Synthesis & Root Cause",
                "description": "Current metrics align with historical configuration issue; verified diff required",
                "evidence_type": "synthesis",
                "icon": "check-circle",
                "details": "Contextual recommendation generated prioritizing config inspection over trial-and-error"
            }
        ]

        why_factors = [
            {
                "factor": f"Historical Incident {top_match.incident_id} Precedent",
                "explanation": f"In {top_match.incident_id}, the service experienced {top_match.original_error}. Restarting alone failed because root cause was {top_match.root_cause}.",
                "weight": f"High ({top_match.relevance_score}%)"
            },
            {
                "factor": "Current Telemetry Corroboration",
                "explanation": f"Current telemetry in deployment {version} shows saturated connection pools matching the symptom profile from {top_match.incident_id}.",
                "weight": "Corroborated"
            },
            {
                "factor": "Previous Failed Troubleshooting Learned",
                "explanation": f"Historical lesson: '{top_match.lesson_learned}'. Do not attempt naive restarts without inspecting config values first.",
                "weight": "Actionable Avoidance"
            }
        ]

        what_worked = [top_match.successful_fix]
        what_failed = [top_match.failed_attempt or "Restarting the service alone without correcting pool settings"]

        recommended_steps = [
            f"Inspect configuration diff in deployment {version} specifically for pool size, timeout thresholds, and idle connection limits.",
            f"AVOID: Do not rely solely on restarting {service}; historical runbook {top_match.incident_id} confirms exhaustion recurs within minutes.",
            f"If configuration was altered, revert pool configuration to verified baseline (as validated in {top_match.incident_id}).",
            "Verify database max_connections limit has not been exceeded at the PostgreSQL cluster level."
        ]

        verification_steps = [
            f"Execute runbook check: {top_match.runbook_step or 'Run SELECT count(*) FROM pg_stat_activity WHERE application_name = payment-api'}.",
            "Observe connection pool utilization metric drop below 40% after applying config alignment.",
            "Verify p99 API response latency recovers to < 120ms baseline."
        ]

        risk_unknowns = [
            "Current pool exhaustion could be aggravated by an unindexed query introduced in this release rather than purely pool size.",
            "Ensure upstream services (e.g. order-service) are not retrying aggressively and hammering the database."
        ]

        prevention_recommendations = [
            "Validate connection-pool configuration parameters in CI/CD pre-flight checks before deployment.",
            "Add connection pool saturation alerting at 75% warning threshold.",
            "Add automated configuration-diff validation between staging and production environments.",
            "Update runbook with direct link to historical memory record for connection pool exhaustion."
        ]

        return {
            "incident_id": inc_id,
            "summary": summary,
            "likely_root_cause": likely_root_cause,
            "confidence": "High",
            "relevance_score": top_match.relevance_score,
            "current_evidence": current_evidence,
            "historical_matches": historical_matches,
            "evidence_chain": evidence_chain,
            "why_factors": why_factors,
            "what_worked_before": what_worked,
            "what_failed_before": what_failed,
            "recommended_steps": recommended_steps,
            "verification_steps": verification_steps,
            "risk_unknowns": risk_unknowns,
            "prevention_recommendations": prevention_recommendations,
            "memory_used": True,
            "is_contextual": True,
            "created_at": now_utc()
        }

    async def generate_postmortem(
        self,
        incident_data: Dict[str, Any],
        resolution_data: Dict[str, Any],
        investigation_data: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        inc_id = incident_data.get("id", "INC-UNKNOWN")
        service = incident_data.get("service_id", "service")
        title = incident_data.get("title", "Incident Postmortem")
        
        timeline = [
            {"time": "T+00m", "event": f"Incident triggered: {incident_data.get('error_message')}"},
            {"time": "T+02m", "event": "SRE AI Agent initiated investigation and collected telemetry evidence"},
            {"time": "T+03m", "event": "Operational memory recalled prior resolution and warned against naive restarts"},
            {"time": "T+08m", "event": f"Engineer applied fix: {resolution_data.get('fix_applied')}"},
            {"time": "T+12m", "event": f"Incident resolved: {resolution_data.get('result')}"},
            {"time": "T+13m", "event": "Knowledge extracted and permanently retained into Hindsight operational memory"}
        ]

        summary = (
            f"On {now_utc().strftime('%Y-%m-%d')}, service '{service}' experienced an operational degradation "
            f"resulting in: {incident_data.get('error_message')}. Long-term incident memory identified historical patterns "
            f"from prior outages, allowing the team to bypass unproductive trial-and-error and apply targeted remediation."
        )

        impact = f"Degraded transactions for {service} in {incident_data.get('environment', 'Production')}. Estimated recovery time was reduced by 65% due to historical memory guidance."

        evidence = investigation_data.get("current_evidence", []) if investigation_data else [
            f"Error message: {incident_data.get('error_message')}",
            f"Deployment version: {incident_data.get('deployment_version')}"
        ]

        what_worked = [resolution_data.get("fix_applied", "Configuration correction applied")]
        if investigation_data and investigation_data.get("what_worked_before"):
            what_worked.extend(investigation_data["what_worked_before"])

        what_failed = []
        if resolution_data.get("failed_attempts"):
            what_failed.append(resolution_data["failed_attempts"])
        if investigation_data and investigation_data.get("what_failed_before"):
            what_failed.extend(investigation_data["what_failed_before"])
        if not what_failed:
            what_failed = ["Service restart alone without configuration remediation"]

        lessons = [
            resolution_data.get("lessons_learned", "Verify configuration before scaling resources."),
            "Operational memory significantly accelerates Mean Time To Resolution (MTTR).",
            "Always capture failed troubleshooting attempts in postmortems to prevent future engineers from repeating them."
        ]

        prevention = [
            "Implement automated configuration validation in deployment pipelines.",
            "Establish alert rules for early warning signs of resource saturation.",
            "Review runbooks quarterly against retained Hindsight operational memories."
        ]

        return {
            "incident_id": inc_id,
            "title": f"Postmortem: {inc_id} - {title}",
            "summary": summary,
            "impact": impact,
            "timeline": timeline,
            "root_cause": resolution_data.get("root_cause", "Configuration mismatch"),
            "evidence": evidence,
            "what_worked": what_worked,
            "what_failed": what_failed,
            "resolution": resolution_data.get("result", "Successfully Resolved"),
            "lessons_learned": lessons,
            "prevention_recommendations": prevention,
            "author": resolution_data.get("resolved_by", "SRE Lead Investigator"),
            "status": "Published"
        }

    async def check_health(self) -> Dict[str, Any]:
        return {
            "status": "Demo Mode",
            "provider": "DemoLLMProvider (Deterministic SRE Agent)",
            "healthy": True
        }
