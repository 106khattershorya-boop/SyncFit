from datetime import datetime

from pydantic import BaseModel, Field


class WaitlistJoinRequest(BaseModel):
    session_id: str = Field(pattern=r"^[0-9a-fA-F]{24}$")


class WaitlistResponse(BaseModel):
    id: str
    session_id: str
    session_starts_at: datetime
    position: int
    joined_at: datetime