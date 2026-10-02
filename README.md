# SyncFit

A gym session booking app. Members can create accounts, browse upcoming sessions, book or cancel sessions, and join or leave waitlists. Admins can create sessions and check members in.

## Tech stack

- Backend: Python, FastAPI, PyMongo
- Database: MongoDB
- Frontend: React (planned)

## Project structure

    SyncFit/
    backend/
      app/
      .env.example
      pyproject.toml
    frontend/ (planned)

## Backend setup

Requirements: Python 3.11 or newer and a MongoDB connection string.

From the `backend` directory, create and activate a virtual environment, then install the project:

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -e .
```

Copy `.env.example` to `.env` and set the values for your environment:

```env
MONGODB_URI=your-mongodb-connection-string
MONGODB_DATABASE=gym_slot_booking

JWT_SECRET=replace-with-a-long-random-secret
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=60

CORS_ORIGINS=http://localhost:5173
```

Keep `.env` private and out of Git.

Start the API from the `backend` directory:

```powershell
uvicorn app.main:app --reload
```

- API documentation: http://127.0.0.1:8000/docs
- Health check: http://127.0.0.1:8000/health

The API creates its MongoDB indexes when it starts.

## API routes

| Method | Route | Description |
|---|---|---|
| POST | `/api/auth/register` | Register |
| POST | `/api/auth/login` | Login |
| GET | `/api/sessions` | List upcoming sessions |
| POST | `/api/sessions` | Create a session (admin) |
| POST | `/api/bookings` | Book a session |
| GET | `/api/bookings/me` | List my bookings |
| DELETE | `/api/bookings/{booking_id}` | Cancel a booking |
| POST | `/api/waitlist` | Join a waitlist |
| DELETE | `/api/waitlist/{session_id}` | Leave a waitlist |
| POST | `/api/checkins` | Check in a member (admin) |
| GET | `/health` | Check API health |

Protected routes require a bearer token from the login response. In Postman, select **Authorization → Bearer Token** and paste the token.

## Frontend

The React frontend has not been started yet. Frontend setup and run instructions will be added when it is created.

## Assumptions

- New accounts have the `member` role. For this challenge, admin access is assigned manually to a user in MongoDB.
- Passwords are stored as hashes, not plain text.
- Session dates and times are stored as timezone-aware datetimes.
- When a booking is cancelled, the earliest waiting member is promoted if a waitlist entry exists.
- Only admins can create sessions and check members in.
- Check-in is allowed only during the session’s check-in window.
- Related booking and session updates use MongoDB transactions; the MongoDB deployment must support transactions.
- API behavior is checked manually with Postman, and database records can be inspected with MongoDB Compass. No seed script is included.