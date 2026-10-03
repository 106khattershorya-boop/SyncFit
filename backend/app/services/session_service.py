from datetime import datetime, timezone
from typing import Any

from pymongo.asynchronous.database import AsyncDatabase

from app.core.errors import ApiError
from app.schemas.session import ActivityType, SessionCreateRequest, SessionResponse


ACTIVITY_PRICES_RUPEES: dict[ActivityType, int] = {
    "strength_conditioning": 300,
    "hiit": 250,
    "zumba": 250,
    "aerobics": 200,
    "yoga": 250,
    "pilates": 350,
    "swimming": 400,
    "sauna": 300,
}

SESSION_CAPACITY = 20


async def create_session(
    data: SessionCreateRequest,
    database: AsyncDatabase,
) -> SessionResponse:
    starts_at = data.starts_at.astimezone(timezone.utc)

    if starts_at <= datetime.now(timezone.utc):
        raise ApiError(
            status_code=422,
            code="SESSION_STARTS_IN_PAST",
            message="A session must start in the future.",
        )

    session = {
        "starts_at": starts_at,
        "activity_type": data.activity_type,
        "price_rupees": ACTIVITY_PRICES_RUPEES[data.activity_type],
        "capacity": SESSION_CAPACITY,
        "booked_count": 0,
        "created_at": datetime.now(timezone.utc),
    }

    result = await database.sessions.insert_one(session)

    return SessionResponse(
        id=str(result.inserted_id),
        starts_at=starts_at,
        activity_type=session["activity_type"],
        price_rupees=session["price_rupees"],
        capacity=session["capacity"],
        seats_remaining=session["capacity"],
    )


async def list_sessions(
    database: AsyncDatabase,
    activity_type: ActivityType | None = None,
) -> list[SessionResponse]:
    now = datetime.now(timezone.utc)
    query: dict[str, Any] = {"starts_at": {"$gte": now}}

    if activity_type is not None:
        query["activity_type"] = activity_type

    cursor = database.sessions.find(query).sort("starts_at", 1)

    sessions: list[SessionResponse] = []

    async for session in cursor:
        sessions.append(
            SessionResponse(
                id=str(session["_id"]),
                starts_at=session["starts_at"],
                activity_type=session["activity_type"],
                price_rupees=session["price_rupees"],
                capacity=session["capacity"],
                seats_remaining=session["capacity"] - session["booked_count"],
            )
        )

    return sessions