from datetime import datetime
from typing import Literal

from pydantic import BaseModel, Field


class BookingCreateRequest(BaseModel):
    session_id: str = Field(pattern=r"^[0-9a-fA-F]{24}$")


class BookingResponse(BaseModel):
    id: str
    session_id: str
    session_starts_at: datetime
    status: Literal["confirmed", "cancelled"]
    checkin_code: str | None = None
    booked_at: datetime
    cancelled_at: datetime | None = None

class AdminSessionBookingResponse(BaseModel):
    id: str
    member_id: str
    member_name: str | None = None
    member_email: str | None = None
    status: Literal["confirmed", "cancelled"]
    booked_at: datetime
    checkin_code: str | None = None
    checked_in_at: datetime | None = None