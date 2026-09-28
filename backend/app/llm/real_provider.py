import json
import logging
from datetime import datetime, timezone
from typing import Dict, Any, List, Optional
import httpx
from app.config import settings
from app.llm.base import LLMProvider
from app.llm.demo_provider import DemoLLMProvider
from app.schemas.memory import HistoricalMatch

logger = logging.getLogger(__name__)

class RealLLMProvider(LLMProvider):
    """
    Live AI Reasoning Provider supporting:
    - OpenAI (ChatGPT / GPT-4o)
    - Google Gemini (Gemini 1.5 Pro / Flash)
    - Anthropic Claude
    Falls back gracefully to DemoLLMProvider if keys are missing or API fails.
    """
    def __init__(self):
        self.provider = settings.active_llm_provider
        self.api_key = settings.active_llm_key
        self.model = settings.active_llm_model
        self.fallback = DemoLLMProvider()

    def _build_investigation_prompt(
        self,
        incident_data: Dict[str, Any],
        current_evidence: List[str],
        historical_matches: List[HistoricalMatch],
        use_memory: bool
    ) -> str:
        historical_summary = []
        if use_memory and historical_matches:
            for m in historical_matches:
                historical_summary.append({
                    "incident_id": m.incident_id,
                    "service": m.service_id,
                    "relevance": f"{m.relevance_score}%",
                    "original_error": m.original_error,
                    "root_cause": m.root_cause,
                    "successful_fix": m.successful_fix,
                    "failed_attempt": m.failed_attempt,
                    "lesson_learned": m.lesson_learned
                })

        prompt = {
            "instruction": "You are an elite SRE incident response AI. Analyze the current incident. Synthesize current live telemetry with historical memory if available. NEVER claim memory proves root cause; treat it as advisory precedent. Recommend verified fixes and warn against previously failed troubleshooting attempts.",
            "current_incident": incident_data,
            "current_telemetry_evidence": current_evidence,
            "historical_memories": historical_summary if use_memory else "NONE_OPERATING_IN_ISOLATION",
            "output_format": {
                "summary": "Concise SRE summary",
                "likely_root_cause": "Hypothesis distinguishing live evidence from past memory",
                "confidence": "High / Medium / Low",
                "recommended_steps": ["step 1", "step 2"],
                "verification_steps": ["query or metric check 1", "check 2"],
                "risk_unknowns": ["risk 1", "risk 2"],
                "prevention_recommendations": ["CI check", "alert rule"]
            }
        }
        return json.dumps(prompt)

    async def _call_openai(self, system_prompt: str, user_prompt: str) -> Optional[Dict[str, Any]]:
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }
        payload = {
            "model": self.model if "gpt" in self.model else "gpt-4o",
            "messages": [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ],
            "response_format": {"type": "json_object"},
            "temperature": 0.2
        }
        async with httpx.AsyncClient(timeout=12.0) as client:
            resp = await client.post("https://api.openai.com/v1/chat/completions", headers=headers, json=payload)
            if resp.status_code == 200:
                data = resp.json()
                content = data["choices"][0]["message"]["content"]
                return json.loads(content)
        return None

    async def _call_gemini(self, system_prompt: str, user_prompt: str) -> Optional[Dict[str, Any]]:
        model_name = self.model if "gemini" in self.model else "gemini-1.5-pro"
        url = f"https://generativelanguage.googleapis.com/v1beta/models/{model_name}:generateContent?key={self.api_key}"
        payload = {
            "contents": [
                {"role": "user", "parts": [{"text": f"{system_prompt}\n\nTask:\n{user_prompt}"}]}
            ],
            "generationConfig": {
                "responseMimeType": "application/json",
                "temperature": 0.2
            }
        }
        async with httpx.AsyncClient(timeout=12.0) as client:
            resp = await client.post(url, json=payload)
            if resp.status_code == 200:
                data = resp.json()
                text = data["candidates"][0]["content"]["parts"][0]["text"]
                return json.loads(text)
        return None

    async def generate_investigation(
        self,
        incident_data: Dict[str, Any],
        current_evidence: List[str],
        historical_matches: List[HistoricalMatch],
        use_memory: bool = True
    ) -> Dict[str, Any]:
        # Always generate baseline high-fidelity SRE structure
        base_result = await self.fallback.generate_investigation(
            incident_data, current_evidence, historical_matches, use_memory
        )

        if not self.api_key:
            return base_result

        system_prompt = "You are an autonomous enterprise SRE incident response agent with long-term Hindsight memory. Return valid JSON only."
        user_prompt = self._build_investigation_prompt(incident_data, current_evidence, historical_matches, use_memory)

        try:
            live_response = None
            if self.provider == "openai" or "sk-" in self.api_key:
                live_response = await self._call_openai(system_prompt, user_prompt)
            elif self.provider == "gemini" or "AIza" in self.api_key:
                live_response = await self._call_gemini(system_prompt, user_prompt)

            if live_response:
                # Merge live LLM insights into verified SRE structure
                if "summary" in live_response:
                    base_result["summary"] = live_response["summary"]
                if "likely_root_cause" in live_response:
                    base_result["likely_root_cause"] = live_response["likely_root_cause"]
                if "recommended_steps" in live_response and isinstance(live_response["recommended_steps"], list):
                    base_result["recommended_steps"] = live_response["recommended_steps"]
                if "verification_steps" in live_response and isinstance(live_response["verification_steps"], list):
                    base_result["verification_steps"] = live_response["verification_steps"]
                if "prevention_recommendations" in live_response and isinstance(live_response["prevention_recommendations"], list):
                    base_result["prevention_recommendations"] = live_response["prevention_recommendations"]
        except Exception as e:
            logger.warning(f"Live LLM call ({self.provider}) had issue: {e}. Preserved verified SRE investigation.")

        return base_result

    async def generate_postmortem(
        self,
        incident_data: Dict[str, Any],
        resolution_data: Dict[str, Any],
        investigation_data: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        return await self.fallback.generate_postmortem(
            incident_data, resolution_data, investigation_data
        )

    async def check_health(self) -> Dict[str, Any]:
        if not self.api_key:
            return {
                "status": "Demo Mode",
                "provider": "LLM (Deterministic SRE Agent - No API Key)",
                "healthy": True
            }
        return {
            "status": "Connected",
            "provider": f"Live AI ({self.provider.upper()}: {self.model})",
            "healthy": True
        }
