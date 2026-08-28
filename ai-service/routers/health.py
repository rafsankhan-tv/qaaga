from fastapi import APIRouter
from config import settings
from schemas import HealthResponse

router = APIRouter(prefix="/health", tags=["Health"])


@router.get("", response_model=HealthResponse)
async def check_health():
    return HealthResponse(
        status="ok",
        version=settings.APP_VERSION,
        service=settings.APP_NAME,
    )
