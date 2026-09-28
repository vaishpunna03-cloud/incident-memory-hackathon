from app.config import settings
from app.memory.base import MemoryProvider
from app.memory.demo_provider import DemoMemoryProvider
from app.memory.hindsight_provider import HindsightMemoryProvider

_memory_provider_instance = None

def get_memory_provider() -> MemoryProvider:
    global _memory_provider_instance
    if _memory_provider_instance is None:
        if settings.is_hindsight_live:
            _memory_provider_instance = HindsightMemoryProvider()
        else:
            _memory_provider_instance = DemoMemoryProvider()
    return _memory_provider_instance

__all__ = ["MemoryProvider", "DemoMemoryProvider", "HindsightMemoryProvider", "get_memory_provider"]
