from collections.abc import Awaitable, Callable
from typing import TypeVar

from pymongo import AsyncMongoClient
from pymongo.asynchronous.client_session import AsyncClientSession


Result = TypeVar("Result")


async def run_transaction(
    client: AsyncMongoClient,
    operation: Callable[[AsyncClientSession], Awaitable[Result]],
) -> Result:
    """Run an async database operation inside a MongoDB transaction."""
    async with client.start_session().bind() as session:
        return await session.with_transaction(operation)