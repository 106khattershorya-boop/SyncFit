from datetime import datetime
from typing import Literal

from pydantic import BaseModel, EmailStr


class UserResponse(BaseModel):
    id: str
    name: str
    email: EmailStr
    phone: str | None = None
    role: Literal["member", "admin"]
    created_at: datetime