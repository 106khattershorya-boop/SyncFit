from typing import Any

from bson import ObjectId
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jwt.exceptions import InvalidTokenError
from pymongo.asynchronous.database import AsyncDatabase

from app.core.security import decode_access_token
from app.db.mongo import get_database
from app.core.errors import ApiError


bearer_scheme = HTTPBearer(auto_error=False)


async def get_current_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(bearer_scheme),
    database: AsyncDatabase = Depends(get_database),
) -> dict[str, Any]:
    if credentials is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication is required.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    try:
        payload = decode_access_token(credentials.credentials)
    except InvalidTokenError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="The token is invalid or expired.",
            headers={"WWW-Authenticate": "Bearer"},
        ) from None

    user_id = payload.get("sub")
    if not isinstance(user_id, str) or not ObjectId.is_valid(user_id):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="The token does not identify a valid user.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    user = await database.users.find_one({"_id": ObjectId(user_id)})
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="The account for this token no longer exists.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    return user


async def require_admin(
    current_user: dict[str, Any] = Depends(get_current_user),
) -> dict[str, Any]:
    if current_user.get("role") != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access is required.",
        )

    return current_user

async def require_member(
    current_user: dict[str, Any] = Depends(get_current_user),
) -> dict[str, Any]:
    if current_user.get("role") != "member":
        raise ApiError(
            status_code=403,
            code="MEMBER_ACCESS_REQUIRED",
            message="This action is only available to member accounts.",
        )

    return current_user