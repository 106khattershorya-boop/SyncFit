from pymongo import ASCENDING, IndexModel
from pymongo.asynchronous.database import AsyncDatabase


async def create_indexes(database: AsyncDatabase) -> None:
    """Create indexes used by the gym booking collections."""

    await database.users.create_indexes(
        [
            IndexModel(
                [("email", ASCENDING)],
                unique=True,
                name="unique_user_email",
            ),
        ]
    )

    await database.sessions.create_indexes(
        [
            IndexModel(
                [("starts_at", ASCENDING)],
                unique=True,
                name="unique_session_start_time",
            ),
        ]
    )

    await database.bookings.create_indexes(
        [
            IndexModel(
                [("member_id", ASCENDING), ("session_id", ASCENDING)],
                unique=True,
                partialFilterExpression={"status": "confirmed"},
                name="one_active_booking_per_member_session",
            ),
            IndexModel(
                [("checkin_code", ASCENDING)],
                unique=True,
                partialFilterExpression={"checkin_code": {"$type": "string"}},
                name="unique_checkin_code",
            ),
            IndexModel(
                [("session_id", ASCENDING), ("status", ASCENDING)],
                name="bookings_for_session",
            ),
        ]
    )

    await database.waitlist_entries.create_indexes(
        [
            IndexModel(
                [("session_id", ASCENDING), ("member_id", ASCENDING)],
                unique=True,
                name="one_waitlist_entry_per_member_session",
            ),
            IndexModel(
                [
                    ("session_id", ASCENDING),
                    ("joined_at", ASCENDING),
                    ("_id", ASCENDING),
                ],
                name="waitlist_fifo_order",
            ),
        ]
    )