from abc import ABC, abstractmethod
from typing import Dict, Any, List, Optional
from app.schemas.memory import HistoricalMatch
from app.schemas.incident import InvestigationResponse

class LLMProvider(ABC):
    @abstractmethod
    async def generate_investigation(
        self,
        incident_data: Dict[str, Any],
        current_evidence: List[str],
        historical_matches: List[HistoricalMatch],
        use_memory: bool = True
    ) -> Dict[str, Any]:
        """Generate structured SRE investigation."""
        pass

    @abstractmethod
    async def generate_postmortem(
        self,
        incident_data: Dict[str, Any],
        resolution_data: Dict[str, Any],
        investigation_data: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """Generate a complete postmortem."""
        pass

    @abstractmethod
    async def check_health(self) -> Dict[str, Any]:
        """Check LLM status."""
        pass
