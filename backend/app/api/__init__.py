from fastapi import APIRouter
from app.api.health import router as health_router
from app.api.incidents import router as incidents_router
from app.api.memory import router as memory_router
from app.api.services import router as services_router
from app.api.dashboard import router as dashboard_router
from app.api.postmortems import router as postmortems_router
from app.api.demo import router as demo_router

api_router = APIRouter(prefix="/api")
api_router.include_router(health_router)
api_router.include_router(incidents_router)
api_router.include_router(memory_router)
api_router.include_router(services_router)
api_router.include_router(dashboard_router)
api_router.include_router(postmortems_router)
api_router.include_router(demo_router)

__all__ = ["api_router"]
