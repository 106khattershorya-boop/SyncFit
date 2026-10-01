from collections.abc import AsyncIterator
from contextlib import asynccontextmanager

from fastapi import FastAPI, Request
from pymongo import AsyncMongoClient
from pymongo.asynchronous.database import AsyncDatabase

from app.core.config import get_settings
from app.db.indexes import create_indexes


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncIterator[None]:
    settings = get_settings()
    client = AsyncMongoClient(settings.mongodb_uri, tz_aware=True)
    database = client[settings.mongodb_database]

    app.state.mongo_client = client
    app.state.database = database

    try:
        await client.admin.command("ping")
        await create_indexes(database)
        yield
    finally:
        await client.close()


def get_database(request: Request) -> AsyncDatabase:
    """Return the database for a FastAPI request."""
    return request.app.state.database