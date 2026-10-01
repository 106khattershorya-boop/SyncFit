from typing import Any

from fastapi import APIRouter, Depends
from pymongo.asynchronous.database import AsyncDatabase

from app.api.dependencies import require_admin
from app.db.mongo import get_database
from app.schemas.checkin import CheckInRequest, CheckInResponse
from app.services.checkin_service import check_in_member


router = APIRouter(prefix="/checkins", tags=["checkins"])


@router.post("", response_model=CheckInResponse)
async def check_in(
    data: CheckInRequest,
    database: AsyncDatabase = Depends(get_database),
    _: dict[str, Any] = Depends(require_admin),
) -> CheckInResponse:
    return await check_in_member(data, database)