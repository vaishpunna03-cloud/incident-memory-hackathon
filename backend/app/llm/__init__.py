from app.config import settings
from app.llm.base import LLMProvider
from app.llm.demo_provider import DemoLLMProvider
from app.llm.real_provider import RealLLMProvider

_llm_provider_instance = None

def get_llm_provider() -> LLMProvider:
    global _llm_provider_instance
    if _llm_provider_instance is None:
        if settings.is_llm_live:
            _llm_provider_instance = RealLLMProvider()
        else:
            _llm_provider_instance = DemoLLMProvider()
    return _llm_provider_instance

__all__ = ["LLMProvider", "DemoLLMProvider", "RealLLMProvider", "get_llm_provider"]
