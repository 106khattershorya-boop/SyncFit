from fastapi import APIRouter, Depends, status
from pymongo.asynchronous.database import AsyncDatabase
from typing import Any

from app.api.dependencies import get_current_user

from app.db.mongo import get_database
from app.schemas.auth import LoginRequest, RegisterRequest, TokenResponse
from app.schemas.user import UserResponse
from app.services.auth_service import login_member, register_member


router = APIRouter(prefix="/auth", tags=["auth"])


@router.post(
    "/register",
    response_model=UserResponse,
    status_code=status.HTTP_201_CREATED,
)
async def register(
    data: RegisterRequest,
    database: AsyncDatabase = Depends(get_database),
) -> UserResponse:
    return await register_member(data, database)


@router.post("/login", response_model=TokenResponse)
async def login(
    data: LoginRequest,
    database: AsyncDatabase = Depends(get_database),
) -> TokenResponse:
    return await login_member(data, database)

@router.get("/me", response_model=UserResponse)
async def get_me(
    current_user: dict[str, Any] = Depends(get_current_user),
) -> UserResponse:
    return UserResponse(
        id=str(current_user["_id"]),
        name=current_user["name"],
        email=current_user["email"],
        phone=current_user.get("phone"),
        role=current_user["role"],
        created_at=current_user["created_at"],
    )