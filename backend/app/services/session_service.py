from datetime import datetime, timezone

from pymongo.asynchronous.database import AsyncDatabase

from app.core.errors import ApiError
from app.schemas.session import SessionCreateRequest, SessionResponse


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
        "capacity": 20,
        "booked_count": 0,
        "created_at": datetime.now(timezone.utc),
    }

    result = await database.sessions.insert_one(session)

    return SessionResponse(
        id=str(result.inserted_id),
        starts_at=starts_at,
        capacity=session["capacity"],
        seats_remaining=session["capacity"],
    )


async def list_sessions(database: AsyncDatabase) -> list[SessionResponse]:
    now = datetime.now(timezone.utc)
    cursor = database.sessions.find(
        {"starts_at": {"$gte": now}}
    ).sort("starts_at", 1)

    sessions: list[SessionResponse] = []

    async for session in cursor:
        sessions.append(
            SessionResponse(
                id=str(session["_id"]),
                starts_at=session["starts_at"],
                capacity=session["capacity"],
                seats_remaining=session["capacity"] - session["booked_count"],
            )
        )

    return sessions