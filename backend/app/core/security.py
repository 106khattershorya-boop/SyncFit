from datetime import datetime, timedelta, timezone
from typing import Any

import jwt
from pwdlib import PasswordHash

from app.core.config import get_settings


password_hasher = PasswordHash.recommended()


def hash_password(password: str) -> str:
    """Turn a plain password into a secure hash for storage."""
    return password_hasher.hash(password)


def verify_password(password: str, stored_hash: str) -> bool:
    """Check a submitted password against the stored hash."""
    return password_hasher.verify(password, stored_hash)


def create_access_token(subject: str) -> str:
    """Create a signed token whose subject is the user's ID."""
    settings = get_settings()
    now = datetime.now(timezone.utc)

    payload: dict[str, Any] = {
        "sub": subject,
        "iat": now,
        "exp": now + timedelta(minutes=settings.access_token_expire_minutes),
    }

    return jwt.encode(
        payload,
        settings.jwt_secret.get_secret_value(),
        algorithm=settings.jwt_algorithm,
    )


def decode_access_token(token: str) -> dict[str, Any]:
    """Verify a token and return its payload, or raise if invalid or expired."""
    settings = get_settings()

    return jwt.decode(
        token,
        settings.jwt_secret.get_secret_value(),
        algorithms=[settings.jwt_algorithm],
    )