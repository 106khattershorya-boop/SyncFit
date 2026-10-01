from datetime import datetime, timezone

from pymongo.asynchronous.database import AsyncDatabase

from app.core.errors import ApiError
from app.core.security import (
    create_access_token,
    hash_password,
    verify_password,
)
from app.schemas.auth import LoginRequest, RegisterRequest, TokenResponse
from app.schemas.user import UserResponse


async def register_member(
    data: RegisterRequest,
    database: AsyncDatabase,
) -> UserResponse:
    email = str(data.email).lower()
    created_at = datetime.now(timezone.utc)

    user = {
        "name": data.name,
        "email": email,
        "phone": data.phone,
        "password_hash": hash_password(data.password),
        "role": "member",
        "created_at": created_at,
    }

    result = await database.users.insert_one(user)

    return UserResponse(
        id=str(result.inserted_id),
        name=user["name"],
        email=email,
        phone=user["phone"],
        role="member",
        created_at=created_at,
    )


async def login_member(
    data: LoginRequest,
    database: AsyncDatabase,
) -> TokenResponse:
    email = str(data.email).lower()
    user = await database.users.find_one({"email": email})

    if user is None or not verify_password(data.password, user["password_hash"]):
        raise ApiError(
            status_code=401,
            code="INVALID_CREDENTIALS",
            message="Email or password is incorrect.",
        )

    token = create_access_token(str(user["_id"]))
    return TokenResponse(access_token=token)