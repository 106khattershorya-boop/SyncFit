from typing import Any

from fastapi import APIRouter, Depends, status
from pymongo.asynchronous.database import AsyncDatabase

from app.api.dependencies import require_admin
from app.db.mongo import get_database
from app.schemas.session import SessionCreateRequest, SessionResponse
from app.services.session_service import create_session, list_sessions


router = APIRouter(prefix="/sessions", tags=["sessions"])


@router.post(
    "",
    response_model=SessionResponse,
    status_code=status.HTTP_201_CREATED,
)
async def create(
    data: SessionCreateRequest,
    database: AsyncDatabase = Depends(get_database),
    _: dict[str, Any] = Depends(require_admin),
) -> SessionResponse:
    return await create_session(data, database)


@router.get("", response_model=list[SessionResponse])
async def list_upcoming(
    database: AsyncDatabase = Depends(get_database),
) -> list[SessionResponse]:
    return await list_sessions(database)