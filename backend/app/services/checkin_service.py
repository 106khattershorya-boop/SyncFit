from datetime import datetime, timedelta, timezone
import secrets

from pymongo.asynchronous.client_session import AsyncClientSession
from pymongo.asynchronous.database import AsyncDatabase

from app.core.errors import ApiError
from app.db.transactions import run_transaction
from app.schemas.checkin import CheckInRequest, CheckInResponse


def generate_checkin_code() -> str:
    alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
    return "".join(secrets.choice(alphabet) for _ in range(6))


async def check_in_member(
    data: CheckInRequest,
    database: AsyncDatabase,
) -> CheckInResponse:
    code = data.code.strip().upper()

    async def check_in(_: AsyncClientSession) -> CheckInResponse:
        booking = await database.bookings.find_one(
            {"checkin_code": code, "status": "confirmed"}
        )

        if booking is None:
            raise ApiError(
                404,
                "INVALID_CHECKIN_CODE",
                "The check-in code is invalid or has already been used.",
            )

        session = await database.sessions.find_one(
            {"_id": booking["session_id"]}
        )
        if session is None:
            raise ApiError(
                404,
                "SESSION_NOT_FOUND",
                "The session for this check-in code was not found.",
            )

        now = datetime.now(timezone.utc)
        session_ends_at = session["starts_at"] + timedelta(hours=1)

        if now < session["starts_at"] or now >= session_ends_at:
            raise ApiError(
                409,
                "CHECKIN_WINDOW_CLOSED",
                "This code can only be used during the session hour.",
            )

        user = await database.users.find_one({"_id": booking["member_id"]})
        if user is None:
            raise ApiError(
                404,
                "MEMBER_NOT_FOUND",
                "The member for this check-in code was not found.",
            )

        result = await database.bookings.update_one(
            {
                "_id": booking["_id"],
                "status": "confirmed",
                "checkin_code": code,
            },
            {
                "$set": {
                    "checked_in_at": now,
                    "checkin_code": None,
                }
            },
        )

        if result.matched_count != 1:
            raise ApiError(
                409,
                "CHECKIN_CODE_ALREADY_USED",
                "This check-in code has already been used.",
            )

        return CheckInResponse(
            member_id=str(user["_id"]),
            member_name=user["name"],
            member_email=user["email"],
            session_starts_at=session["starts_at"],
            checked_in_at=now,
        )

    return await run_transaction(database.client, check_in)