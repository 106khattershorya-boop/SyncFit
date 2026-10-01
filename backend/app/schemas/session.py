from datetime import datetime

from pydantic import BaseModel, field_validator


class SessionCreateRequest(BaseModel):
    starts_at: datetime

    @field_validator("starts_at")
    @classmethod
    def validate_start_time(cls, value: datetime) -> datetime:
        if value.tzinfo is None or value.utcoffset() is None:
            raise ValueError("Start time must include a timezone.")

        if value.minute != 0 or value.second != 0 or value.microsecond != 0:
            raise ValueError("Sessions must start on the hour.")

        return value


class SessionResponse(BaseModel):
    id: str
    starts_at: datetime
    capacity: int
    seats_remaining: int