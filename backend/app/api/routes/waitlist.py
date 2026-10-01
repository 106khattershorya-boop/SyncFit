from typing import Any

from bson import ObjectId
from fastapi import APIRouter, Depends, Path
from pymongo.asynchronous.database import AsyncDatabase

from app.api.dependencies import get_current_user
from app.db.mongo import get_database
from app.schemas.waitlist import WaitlistJoinRequest, WaitlistResponse
from app.services.waitlist_service import join_waitlist, leave_waitlist


router = APIRouter(prefix="/waitlist", tags=["waitlist"])


@router.post("", response_model=WaitlistResponse)
async def join(
    data: WaitlistJoinRequest,
    database: AsyncDatabase = Depends(get_database),
    current_user: dict[str, Any] = Depends(get_current_user),
) -> WaitlistResponse:
    return await join_waitlist(data, current_user["_id"], database)


@router.delete("/{session_id}")
async def leave(
    session_id: str = Path(pattern=r"^[0-9a-fA-F]{24}$"),
    database: AsyncDatabase = Depends(get_database),
    current_user: dict[str, Any] = Depends(get_current_user),
) -> dict[str, str]:
    await leave_waitlist(
        ObjectId(session_id),
        current_user["_id"],
        database,
    )
    return {"status": "removed"}