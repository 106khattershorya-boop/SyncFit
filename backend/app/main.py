from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.routes.auth import router as auth_router
from app.api.routes.bookings import router as bookings_router
from app.api.routes.checkins import router as checkins_router
from app.api.routes.sessions import router as sessions_router
from app.api.routes.waitlist import router as waitlist_router
from app.core.config import get_settings
from app.core.errors import register_error_handlers
from app.db.mongo import lifespan


settings = get_settings()

app = FastAPI(
    title="Gym Slot Booking API",
    lifespan=lifespan,
)

register_error_handlers(app)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router, prefix="/api")
app.include_router(sessions_router, prefix="/api")
app.include_router(bookings_router, prefix="/api")
app.include_router(waitlist_router, prefix="/api")
app.include_router(checkins_router, prefix="/api")


@app.get("/health")
async def health_check() -> dict[str, str]:
    return {"status": "ok"}