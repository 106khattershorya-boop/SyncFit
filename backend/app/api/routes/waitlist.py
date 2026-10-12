from typing import Any

from bson import ObjectId
from fastapi import APIRouter, Depends, Path
from pymongo.asynchronous.database import AsyncDatabase

from app.api.dependencies import require_member
from app.db.mongo import get_database
from app.schemas.waitlist import WaitlistJoinRequest, WaitlistResponse
from app.services.waitlist_service import (
    get_member_waitlist,
    join_waitlist,
    leave_waitlist,
)


router = APIRouter(prefix="/waitlist", tags=["waitlist"])


@router.post("", response_model=WaitlistResponse)
async def join(
    data: WaitlistJoinRequest,
    database: AsyncDatabase = Depends(get_database),
    current_user: dict[str, Any] = Depends(require_member),
) -> WaitlistResponse:
    return await join_waitlist(data, current_user["_id"], database)


@router.delete("/{session_id}")
async def leave(
    session_id: str = Path(pattern=r"^[0-9a-fA-F]{24}$"),
    database: AsyncDatabase = Depends(get_database),
    current_user: dict[str, Any] = Depends(require_member),
) -> dict[str, str]:
    await leave_waitlist(
        ObjectId(session_id),
        current_user["_id"],
        database,
    )
    return {"status": "removed"}

@router.get("", response_model=list[str])
async def mine(
    database: AsyncDatabase = Depends(get_database),
    current_user: dict[str, Any] = Depends(require_member),
) -> list[str]:
    return await get_member_waitlist(current_user["_id"], database)