from fastapi import APIRouter
from datetime import datetime

router = APIRouter(prefix="/health", tags=["health"])

@router.get("")
def get_health():
    return {
        "status": "Healthy",
        "timestamp": datetime.utcnow().isoformat(),
        "service": "FastAPI Modular Architecture"
    }
