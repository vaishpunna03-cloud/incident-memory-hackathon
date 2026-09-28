import logging
import httpx
from typing import List, Optional, Dict, Any
from app.config import settings
from app.memory.base import MemoryProvider
from app.memory.demo_provider import DemoMemoryProvider
from app.schemas.memory import (
    HistoricalMatch, MemoryRecordCreate,
    MemoryRecordResponse, MemoryStats
)

logger = logging.getLogger(__name__)

class HindsightMemoryProvider(MemoryProvider):
    """
    Live Hindsight Memory Provider.
    Interfaces with the Hindsight API / Vector Store when configured.
    Falls back safely to DemoMemoryProvider if connection fails or API key is absent.
    """
    def __init__(self):
        self.endpoint = settings.HINDSIGHT_ENDPOINT.rstrip("/")
        self.api_key = settings.HINDSIGHT_API_KEY
        self.tenant_id = settings.HINDSIGHT_TENANT_ID
        self.fallback = DemoMemoryProvider()

    def _headers(self) -> Dict[str, str]:
        return {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json",
            "X-Tenant-ID": self.tenant_id
        }

    async def search(
        self,
        query: str,
        service_id: Optional[str] = None,
        top_k: int = 5,
        context: Optional[Dict[str, Any]] = None
    ) -> List[HistoricalMatch]:
        if not self.api_key:
            return await self.fallback.search(query, service_id, top_k, context)

        try:
            async with httpx.AsyncClient(timeout=4.0) as client:
                res = await client.post(
                    f"{self.endpoint}/v1/memories/search",
                    headers=self._headers(),
                    json={
                        "query": query,
                        "filter": {"service_id": service_id} if service_id else {},
                        "top_k": top_k,
                        "context": context or {}
                    }
                )
                if res.status_code == 200:
                    data = res.json()
                    # Parse matches or fallback if empty
                    matches = [HistoricalMatch(**item) for item in data.get("matches", [])]
                    if matches:
                        return matches
        except Exception as e:
            logger.warning(f"Live Hindsight search failed: {e}. Falling back to DemoMemoryProvider.")

        return await self.fallback.search(query, service_id, top_k, context)

    async def retain(self, record: MemoryRecordCreate) -> MemoryRecordResponse:
        # Save locally in DB via fallback first to ensure local durability
        local_res = await self.fallback.retain(record)

        if self.api_key:
            try:
                async with httpx.AsyncClient(timeout=4.0) as client:
                    await client.post(
                        f"{self.endpoint}/v1/memories/retain",
                        headers=self._headers(),
                        json=record.model_dump()
                    )
            except Exception as e:
                logger.warning(f"Live Hindsight retain failed: {e}. Local retention preserved.")

        return local_res

    async def get_stats(self) -> MemoryStats:
        stats = await self.fallback.get_stats()
        if self.api_key:
            stats.provider_status = "Connected (Live)"
            stats.provider_name = "Live Hindsight"
        return stats

    async def list_memories(
        self,
        limit: int = 50,
        service_id: Optional[str] = None
    ) -> List[MemoryRecordResponse]:
        return await self.fallback.list_memories(limit, service_id)

    async def check_health(self) -> Dict[str, Any]:
        if not self.api_key:
            return {
                "status": "Demo Mode",
                "provider": "Hindsight (Demo Mode - No API Key)",
                "healthy": True
            }
        try:
            async with httpx.AsyncClient(timeout=2.0) as client:
                res = await client.get(f"{self.endpoint}/health", headers=self._headers())
                if res.status_code == 200:
                    return {
                        "status": "Connected",
                        "provider": "Live Hindsight",
                        "healthy": True
                    }
        except Exception:
            pass

        return {
            "status": "Demo Mode (Offline Fallback)",
            "provider": "Live Hindsight configured, active fallback",
            "healthy": True
        }
