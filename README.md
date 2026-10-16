# SyncFit

A gym session booking app. Members can register, browse upcoming activities, book or cancel sessions, and join or leave waitlists. Admins can create sessions and check members in.

## Tech stack

- Backend: Python, FastAPI, PyMongo
- Database: MongoDB
- Frontend: React

## Design note

SyncFit uses React for the frontend, FastAPI for the API, and MongoDB for storage.
The database has users, sessions, bookings, and waitlist entries.
Users have member or admin roles.
MongoDB transactions keep booking counts and waitlist promotions consistent.
Indexes help prevent duplicate sessions, bookings, waitlist entries, and check-in codes.

## Project structure

    SyncFit/
    backend/
      app/
      .env.example
      pyproject.toml
    frontend/

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

| Method | Route | Description |
|---|---|---|
| POST | `/api/auth/register` | Register a member |
| POST | `/api/auth/login` | Log in |
| GET | `/api/auth/me` | Get the current account |
| GET | `/api/sessions` | List upcoming sessions; supports activity and date filters |
| POST | `/api/sessions` | Create a session (admin) |
| GET | `/api/sessions/admin` | List sessions for admin tools (admin) |
| GET | `/api/sessions/{session_id}/bookings` | List a session’s bookings (admin) |
| POST | `/api/bookings` | Book a session (member) |
| GET | `/api/bookings/me` | List the current account’s bookings |
| DELETE | `/api/bookings/{booking_id}` | Cancel a booking (member) |
| POST | `/api/waitlist` | Join a waitlist (member) |
| GET | `/api/waitlist` | List the current member’s waitlists |
| DELETE | `/api/waitlist/{session_id}` | Leave a waitlist (member) |
| POST | `/api/checkins` | Check in a member (admin) |
| GET | `/health` | Check API health |

Protected routes require a bearer token from the login response. In Postman, select **Authorization → Bearer Token** and paste the token.

## Activities and prices

Prices are per one-hour session. Each session has 20 slots.

| Activity | Price |
|---|---:|
| Strength | ₹300 |
| HIIT | ₹250 |
| Zumba | ₹250 |
| Aerobics | ₹200 |
| Yoga | ₹250 |
| Pilates | ₹350 |
| Swimming | ₹400 |
| Sauna | ₹300 |

## Mock payment

Checkout offers mock card, UPI, and cash-at-gym options. Card and UPI simulate payment for the demo; no payment processor is connected, no real money is charged, and no card details are stored. Cash-at-gym bookings are paid in person.

## Frontend

Requirements: Node.js and npm.

From the project root:

```powershell
cd frontend
npm install
npm run dev
```

The frontend runs at http://localhost:5173. Start the backend separately; it runs at http://127.0.0.1:8000 by default. The frontend uses `http://127.0.0.1:8000/api` as its API URL unless `VITE_API_URL` is set.

## Demo credentials

- Admin email: `test.admin@example.com`
- Admin password: `GymFit123!`
- Member1 email: `test.member1@example.com`
- Member1 password: `12345678`
- Member2 email: `test.member2@example.com`
- Member2 password: `87654321`

## Assumptions

- New accounts have the `member` role. For this challenge, admin access is assigned manually to a user in MongoDB.
- Passwords are stored as hashes, not plain text.
- Session dates and times are stored as timezone-aware datetimes.
- Sessions start on the hour (Eg : 4:00 pm); the listed activity prices and 20-slot capacity apply to each one-hour session.
- When a booking is cancelled, the earliest waiting member is promoted if a waitlist entry exists.
- Only admins can create sessions, view session bookings, and check members in.
- Only member accounts can create or cancel bookings and join, view, or leave waitlists.
- Check-in is allowed only during the session’s check-in window.
- Related booking and session updates use MongoDB transactions; the MongoDB deployment must support transactions.
- The mock checkout is for demonstration only; payment is handled at the gym.
- API behavior is checked manually with Postman, and database records can be inspected with MongoDB Compass. No seed script is included.