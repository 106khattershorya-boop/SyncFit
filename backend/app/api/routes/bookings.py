from typing import Any

from bson import ObjectId
from fastapi import APIRouter, Depends, Path, status
from pymongo.asynchronous.database import AsyncDatabase

from app.api.dependencies import get_current_user, require_member
from app.db.mongo import get_database
from app.schemas.booking import BookingCreateRequest, BookingResponse
from app.services.booking_service import (
    cancel_booking,
    create_booking,
    list_member_bookings,
)


router = APIRouter(prefix="/bookings", tags=["bookings"])


@router.post(
    "",
    response_model=BookingResponse,
    status_code=status.HTTP_201_CREATED,
)
async def create(
    data: BookingCreateRequest,
    database: AsyncDatabase = Depends(get_database),
    current_user: dict[str, Any] = Depends(require_member),
) -> BookingResponse:
    return await create_booking(data, current_user["_id"], database)


@router.get("/me", response_model=list[BookingResponse])
async def list_mine(
    database: AsyncDatabase = Depends(get_database),
    current_user: dict[str, Any] = Depends(get_current_user),
) -> list[BookingResponse]:
    return await list_member_bookings(current_user["_id"], database)


@router.delete(
    "/{booking_id}",
    response_model=BookingResponse,
)
async def cancel(
    booking_id: str = Path(pattern=r"^[0-9a-fA-F]{24}$"),
    database: AsyncDatabase = Depends(get_database),
    current_user: dict[str, Any] = Depends(require_member),
) -> BookingResponse:
    return await cancel_booking(
        ObjectId(booking_id),
        current_user["_id"],
        database,
    )