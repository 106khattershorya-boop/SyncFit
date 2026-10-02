from datetime import datetime, timezone

from bson import ObjectId
from pymongo import ReturnDocument
from pymongo.asynchronous.client_session import AsyncClientSession
from pymongo.asynchronous.database import AsyncDatabase

from app.core.errors import ApiError
from app.services.checkin_service import generate_checkin_code
from app.db.transactions import run_transaction
from app.schemas.booking import BookingCreateRequest, BookingResponse
from app.services.waitlist_service import promote_next_waitlist_entry


async def create_booking(
    data: BookingCreateRequest,
    member_id: ObjectId,
    database: AsyncDatabase,
) -> BookingResponse:
    session_id = ObjectId(data.session_id)

    async def reserve_seat(_: AsyncClientSession) -> BookingResponse:
        now = datetime.now(timezone.utc)

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
            existing_session = await database.sessions.find_one(
                {"_id": session_id}
            )

            if existing_session is None:
                raise ApiError(
                    404,
                    "SESSION_NOT_FOUND",
                    "The requested session was not found.",
                )

            if existing_session["starts_at"] <= now:
                raise ApiError(
                    409,
                    "SESSION_ALREADY_STARTED",
                    "Bookings are closed for this session.",
                )

            raise ApiError(
                409,
                "SESSION_FULL",
                "The session has no seats remaining.",
            )

        checkin_code = generate_checkin_code()
        booking = {
            "member_id": member_id,
            "session_id": session_id,
            "status": "confirmed",
            "checkin_code": checkin_code,
            "booked_at": now,
        }

        result = await database.bookings.insert_one(booking)

        await database.waitlist_entries.update_one(
            {
                "session_id": session_id,
                "member_id": member_id,
                "status": "waiting",
            },
            {
                "$set": {
                    "status": "cancelled",
                    "left_at": now,
                }
            },
        )

        return BookingResponse(
            id=str(result.inserted_id),
            session_id=str(session_id),
            session_starts_at=session["starts_at"],
            status="confirmed",
            checkin_code=checkin_code,
            booked_at=now,
        )

    return await run_transaction(database.client, reserve_seat)


async def list_member_bookings(
    member_id: ObjectId,
    database: AsyncDatabase,
) -> list[BookingResponse]:
    cursor = await database.bookings.aggregate(
        [
            {"$match": {"member_id": member_id}},
            {"$sort": {"booked_at": -1}},
            {
                "$lookup": {
                    "from": "sessions",
                    "localField": "session_id",
                    "foreignField": "_id",
                    "as": "session",
                }
            },
            {"$unwind": "$session"},
            {
                "$project": {
                    "_id": 1,
                    "session_id": 1,
                    "session_starts_at": "$session.starts_at",
                    "status": 1,
                    "checkin_code": 1,
                    "booked_at": 1,
                    "cancelled_at": 1,
                }
            },
        ]
    )

    bookings: list[BookingResponse] = []

    async for booking in cursor:
        bookings.append(
            BookingResponse(
                id=str(booking["_id"]),
                session_id=str(booking["session_id"]),
                session_starts_at=booking["session_starts_at"],
                status=booking["status"],
                checkin_code=booking.get("checkin_code"),
                booked_at=booking["booked_at"],
                cancelled_at=booking.get("cancelled_at"),
            )
        )

    return bookings


async def cancel_booking(
    booking_id: ObjectId,
    member_id: ObjectId,
    database: AsyncDatabase,
) -> BookingResponse:
    async def cancel(_: AsyncClientSession) -> BookingResponse:
        now = datetime.now(timezone.utc)

        booking = await database.bookings.find_one(
            {
                "_id": booking_id,
                "member_id": member_id,
                "status": "confirmed",
            }
        )

        if booking is None:
            existing_booking = await database.bookings.find_one(
                {"_id": booking_id, "member_id": member_id}
            )

            if existing_booking is None:
                raise ApiError(
                    404,
                    "BOOKING_NOT_FOUND",
                    "The booking was not found.",
                )

            raise ApiError(
                409,
                "BOOKING_ALREADY_CANCELLED",
                "This booking is not active.",
            )

        session = await database.sessions.find_one(
            {"_id": booking["session_id"]}
        )

        if session is None:
            raise ApiError(
                404,
                "SESSION_NOT_FOUND",
                "The session for this booking was not found.",
            )

        if session["starts_at"] <= now:
            raise ApiError(
                409,
                "SESSION_ALREADY_STARTED",
                "This booking can no longer be cancelled.",
            )

        await database.bookings.update_one(
            {"_id": booking_id, "status": "confirmed"},
            {
                "$set": {
                    "status": "cancelled",
                    "cancelled_at": now,
                }
            },
        )

        seat_update = await database.sessions.update_one(
            {
                "_id": booking["session_id"],
                "booked_count": {"$gt": 0},
            },
            {"$inc": {"booked_count": -1}},
        )

        if seat_update.matched_count != 1:
            raise ApiError(
                409,
                "SESSION_CAPACITY_MISMATCH",
                "The session booking count could not be updated.",
            )

        await promote_next_waitlist_entry(
            booking["session_id"],
            database,
            now,
        )

        return BookingResponse(
            id=str(booking_id),
            session_id=str(booking["session_id"]),
            session_starts_at=session["starts_at"],
            status="cancelled",
            checkin_code=booking.get("checkin_code"),
            booked_at=booking["booked_at"],
            cancelled_at=now,
        )

    return await run_transaction(database.client, cancel)