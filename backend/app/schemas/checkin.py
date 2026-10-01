from datetime import datetime

from pydantic import BaseModel, Field


class CheckInRequest(BaseModel):
    code: str = Field(pattern=r"^[A-Z0-9]{6}$")


class CheckInResponse(BaseModel):
    member_id: str
    member_name: str
    member_email: str
    session_starts_at: datetime
    checked_in_at: datetime