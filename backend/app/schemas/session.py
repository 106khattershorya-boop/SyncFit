from datetime import datetime
from typing import Literal

from pydantic import BaseModel, field_validator


ActivityType = Literal[
    "strength_conditioning",
    "hiit",
    "zumba",
    "aerobics",
    "yoga",
    "pilates",
    "swimming",
    "sauna",
]


class SessionCreateRequest(BaseModel):
    starts_at: datetime
    activity_type: ActivityType

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
    activity_type: ActivityType
    price_rupees: int
    capacity: int
    seats_remaining: int