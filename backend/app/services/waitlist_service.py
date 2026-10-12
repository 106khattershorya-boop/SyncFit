from datetime import datetime, timezone

from bson import ObjectId
from pymongo import ReturnDocument
from pymongo.asynchronous.client_session import AsyncClientSession
from pymongo.asynchronous.database import AsyncDatabase

from app.core.errors import ApiError
from app.db.transactions import run_transaction
from app.schemas.waitlist import WaitlistJoinRequest, WaitlistResponse
from app.services.checkin_service import generate_checkin_code


async def join_waitlist(
    data: WaitlistJoinRequest,
    member_id: ObjectId,
    database: AsyncDatabase,
) -> WaitlistResponse:
    session_id = ObjectId(data.session_id)

    async def add_entry(_: AsyncClientSession) -> WaitlistResponse:
        now = datetime.now(timezone.utc)

        session = await database.sessions.find_one({"_id": session_id})
        if session is None:
            raise ApiError(404, "SESSION_NOT_FOUND", "The session was not found.")

        if session["starts_at"] <= now:
            raise ApiError(
                409,
                "SESSION_ALREADY_STARTED",
                "You cannot join the waitlist for a session that has started.",
            )

        if session["booked_count"] < session["capacity"]:
            raise ApiError(
                409,
                "SESSION_HAS_OPEN_SEATS",
                "The session still has an open seat. Book it directly.",
            )

        active_booking = await database.bookings.find_one(
            {
                "member_id": member_id,
                "session_id": session_id,
                "status": "confirmed",
            }
        )
        if active_booking is not None:
            raise ApiError(
                409,
                "ALREADY_BOOKED",
                "You already have a confirmed booking for this session.",
            )

        entry = await database.waitlist_entries.find_one(
            {"session_id": session_id, "member_id": member_id}
        )

        if entry is not None and entry["status"] == "waiting":
            raise ApiError(
                409,
                "ALREADY_WAITLISTED",
                "You are already on this session's waitlist.",
            )

        if entry is None:
            result = await database.waitlist_entries.insert_one(
                {
                    "session_id": session_id,
                    "member_id": member_id,
                    "status": "waiting",
                    "joined_at": now,
                }
            )
            entry_id = result.inserted_id
        else:
            entry_id = entry["_id"]
            await database.waitlist_entries.update_one(
                {"_id": entry_id},
                {
                    "$set": {"status": "waiting", "joined_at": now},
                    "$unset": {"left_at": ""},
                },
            )

        ahead = await database.waitlist_entries.count_documents(
            {
                "session_id": session_id,
                "status": "waiting",
                "$or": [
                    {"joined_at": {"$lt": now}},
                    {"joined_at": now, "_id": {"$lt": entry_id}},
                ],
            }
        )

        return WaitlistResponse(
            id=str(entry_id),
            session_id=str(session_id),
            session_starts_at=session["starts_at"],
            position=ahead + 1,
            joined_at=now,
        )

    return await run_transaction(database.client, add_entry)


async def leave_waitlist(
    session_id: ObjectId,
    member_id: ObjectId,
    database: AsyncDatabase,
) -> None:
    result = await database.waitlist_entries.update_one(
        {
            "session_id": session_id,
            "member_id": member_id,
            "status": "waiting",
        },
        {
            "$set": {
                "status": "cancelled",
                "left_at": datetime.now(timezone.utc),
            }
        },
    )

    if result.matched_count == 0:
        raise ApiError(
            404,
            "WAITLIST_ENTRY_NOT_FOUND",
            "You are not waiting for this session.",
        )


async def promote_next_waitlist_entry(
    session_id: ObjectId,
    database: AsyncDatabase,
    now: datetime,
) -> bool:
    entry = await database.waitlist_entries.find_one(
        {"session_id": session_id, "status": "waiting"},
        sort=[("joined_at", 1), ("_id", 1)],
    )

    if entry is None:
        return False

    session = await database.sessions.find_one_and_update(
        {
            "_id": session_id,
            "starts_at": {"$gt": now},
            "$expr": {"$lt": ["$booked_count", "$capacity"]},
        },
        {"$inc": {"booked_count": 1}},
        return_document=ReturnDocument.AFTER,
    )

    if session is None:
        return False

    result = await database.waitlist_entries.update_one(
        {"_id": entry["_id"], "status": "waiting"},
        {
            "$set": {
                "status": "promoted",
                "promoted_at": now,
            }
        },
    )

    if result.matched_count != 1:
        raise ApiError(
            409,
            "WAITLIST_ENTRY_CHANGED",
            "The waitlist changed. Please retry the cancellation.",
        )

    await database.bookings.insert_one(
        {
            "member_id": entry["member_id"],
            "session_id": session_id,
            "status": "confirmed",
            "checkin_code": generate_checkin_code(),
            "booked_at": now,
        }
    )

    return True

    await database.bookings.insert_one(
        {
            "member_id": entry["member_id"],
            "session_id": session_id,
            "status": "confirmed",
            "checkin_code": generate_checkin_code(),
            "booked_at": now,
        }
    )

    return True


async def get_member_waitlist(
    member_id: ObjectId,
    database: AsyncDatabase,
) -> list[str]:
    cursor = database.waitlist_entries.find(
        {"member_id": member_id, "status": "waiting"},
        {"_id": 0, "session_id": 1},
    )
    entries = await cursor.to_list(length=None)
    return [str(entry["session_id"]) for entry in entries]