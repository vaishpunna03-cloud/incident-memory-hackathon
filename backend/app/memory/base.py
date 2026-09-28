from abc import ABC, abstractmethod
from typing import List, Optional, Dict, Any
from app.schemas.memory import HistoricalMatch, MemoryRecordCreate, MemoryRecordResponse, MemoryStats

class MemoryProvider(ABC):
    @abstractmethod
    async def search(
        self,
        query: str,
        service_id: Optional[str] = None,
        top_k: int = 5,
        context: Optional[Dict[str, Any]] = None
    ) -> List[HistoricalMatch]:
        """Search historical memories using query and context."""
        pass

    @abstractmethod
    async def retain(self, record: MemoryRecordCreate) -> MemoryRecordResponse:
        """Store newly extracted incident knowledge into memory."""
        pass

    @abstractmethod
    async def get_stats(self) -> MemoryStats:
        """Get statistics of the memory store."""
        pass

    @abstractmethod
    async def list_memories(
        self,
        limit: int = 50,
        service_id: Optional[str] = None
    ) -> List[MemoryRecordResponse]:
        """List historical memories."""
        pass

    @abstractmethod
    async def check_health(self) -> Dict[str, Any]:
        """Return health status of memory provider."""
        pass
