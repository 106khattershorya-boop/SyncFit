from typing import Any
from datetime import date

from bson import ObjectId
from fastapi import APIRouter, Depends, Path, status
from pymongo.asynchronous.database import AsyncDatabase

from app.api.dependencies import require_admin
from app.db.mongo import get_database
from app.schemas.booking import AdminSessionBookingResponse
from app.schemas.session import ActivityType, SessionCreateRequest, SessionResponse
from app.services.booking_service import list_session_bookings
from app.services.session_service import create_session, list_all_sessions, list_sessions


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


@router.get("/admin", response_model=list[SessionResponse])
async def list_all(
    database: AsyncDatabase = Depends(get_database),
    _: dict[str, Any] = Depends(require_admin),
) -> list[SessionResponse]:
    return await list_all_sessions(database)


@router.get(
    "/{session_id}/bookings",
    response_model=list[AdminSessionBookingResponse],
)
async def list_bookings_for_session(
    session_id: str = Path(pattern=r"^[0-9a-fA-F]{24}$"),
    database: AsyncDatabase = Depends(get_database),
    _: dict[str, Any] = Depends(require_admin),
) -> list[AdminSessionBookingResponse]:
    return await list_session_bookings(ObjectId(session_id), database)


@router.get("", response_model=list[SessionResponse])
async def list_upcoming(
    database: AsyncDatabase = Depends(get_database),
    activity_type: ActivityType | None = None,
    session_date: date | None = None,
) -> list[SessionResponse]:
    return await list_sessions(database, activity_type, session_date)