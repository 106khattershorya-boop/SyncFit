import { useEffect, useState } from 'react'
import { Link } from 'react-router'
import {
  checkInMember,
  createSession,
  getAdminSessions,
  getSessionBookings,
  isLoggedIn,
  getCurrentUser,
} from '../services/api.js'

const activities = [
  { slug: 'strength_conditioning', name: 'Strength' },
  { slug: 'hiit', name: 'HIIT' },
  { slug: 'zumba', name: 'Zumba' },
  { slug: 'aerobics', name: 'Aerobics' },
  { slug: 'yoga', name: 'Yoga' },
  { slug: 'pilates', name: 'Pilates' },
  { slug: 'swimming', name: 'Swimming' },
  { slug: 'sauna', name: 'Sauna' },
]

function AdminPage() {
  const [startsAt, setStartsAt] = useState('')
  const [activityType, setActivityType] = useState('strength_conditioning')
  const [checkinCode, setCheckinCode] = useState('')
  const [creating, setCreating] = useState(false)
  const [checkingIn, setCheckingIn] = useState(false)
  const [sessionMessage, setSessionMessage] = useState('')
  const [checkinMessage, setCheckinMessage] = useState('')
  const [sessionError, setSessionError] = useState('')
  const [checkinError, setCheckinError] = useState('')
  const [sessions, setSessions] = useState([])
  const [selectedSessionId, setSelectedSessionId] = useState('')
  const [sessionBookings, setSessionBookings] = useState([])
  const [bookingsLoading, setBookingsLoading] = useState(false)
  const [bookingsError, setBookingsError] = useState('')
  const [isAdmin, setIsAdmin] = useState(false)
  const [checkingRole, setCheckingRole] = useState(isLoggedIn())

  useEffect(() => {
    if (!isLoggedIn()) {
      setCheckingRole(false)
      return
    }

    let active = true

    getCurrentUser()
      .then((user) => {
        if (active) setIsAdmin(user.role === 'admin')
      })
      .catch((error) => {
        if (active) setBookingsError(error.message)
      })
      .finally(() => {
        if (active) setCheckingRole(false)
      })

    return () => {
      active = false
    }
  }, [])

  useEffect(() => {
    if (!isAdmin) return

  let active = true

  getAdminSessions()
    .then((data) => {
      if (!active) return

      setSessions(data)
      if (data.length > 0) {
        setSelectedSessionId(data[0].id)
      }
    })
    .catch((requestError) => {
      if (active) setBookingsError(requestError.message)
    })

  return () => {
    active = false
  }
}, [isAdmin])

useEffect(() => {
  if (!selectedSessionId || !isLoggedIn()) {
    setSessionBookings([])
    return
  }

  let active = true
  setBookingsLoading(true)
  setBookingsError('')

  getSessionBookings(selectedSessionId)
    .then((data) => {
      if (active) setSessionBookings(data)
    })
    .catch((requestError) => {
      if (active) setBookingsError(requestError.message)
    })
    .finally(() => {
      if (active) setBookingsLoading(false)
    })

  return () => {
    active = false
  }
}, [selectedSessionId])


  async function handleCreateSession(event) {
    event.preventDefault()
    setCreating(true)
    setSessionMessage('')
    setSessionError('')

    try {
      const session = await createSession({
        starts_at: `${startsAt}:00+05:30`,
        activity_type: activityType,
      })
      const activityName =
        activities.find((activity) => activity.slug === session.activity_type)
          ?.name ?? session.activity_type

      setSessionMessage(
        `${activityName} scheduled for ${new Intl.DateTimeFormat('en-IN', {
          dateStyle: 'medium',
          timeStyle: 'short',
        }).format(new Date(session.starts_at))}.`,
      )
      setStartsAt('')
    } catch (requestError) {
      setSessionError(requestError.message)
    } finally {
      setCreating(false)
    }
  }

  async function handleCheckIn(event) {
    event.preventDefault()
    setCheckingIn(true)
    setCheckinMessage('')
    setCheckinError('')

    try {
      await checkInMember(checkinCode.trim().toUpperCase())
      setCheckinMessage('Member checked in successfully.')
      setCheckinCode('')
    } catch (requestError) {
      setCheckinError(requestError.message)
    } finally {
      setCheckingIn(false)
    }
  }

  if (!isLoggedIn()) {
    return (
      <main className="home-page">
        <section className="booking-empty">
          <p className="eyebrow">Studio tools</p>
          <h1>Log in with an admin account.</h1>
          <p>Only an admin can create sessions and check in members.</p>
          <Link className="button button-dark" to="/login">
            Go to log in
          </Link>
        </section>
      </main>
    )
  }

    if (checkingRole) {
    return (
      <main className="home-page">
        <section className="booking-empty">
          <p className="eyebrow">Studio tools</p>
          <h1>Checking access…</h1>
        </section>
      </main>
    )
  }

  if (!isAdmin) {
    return (
      <main className="home-page">
        <section className="booking-empty">
          <p className="eyebrow">Studio tools</p>
          <h1>Admin access required.</h1>
          <p>Only an admin can create sessions and check in members.</p>
          <Link className="button button-dark" to="/activities">
            Back to activities
          </Link>
        </section>
      </main>
    )
  }

  return (
    <main className="home-page">
      <section className="admin-intro">
        <div>
          <p className="eyebrow">Studio tools</p>
          <h1>Care for the details.</h1>
          <p>Schedule a session or welcome a member when they arrive.</p>
        </div>
        <img
          src="https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=1200&q=85"
          alt="Gym staff preparing a training space"
        />
      </section>

      <div className="admin-grid">
        <section className="admin-card">
          <p className="eyebrow">Add to the schedule</p>
          <h2>Create a session</h2>

          <form className="auth-form" onSubmit={handleCreateSession}>
            <label htmlFor="activity-type">Activity</label>
            <select
              id="activity-type"
              value={activityType}
              onChange={(event) => setActivityType(event.target.value)}
            >
              {activities.map((activity) => (
                <option key={activity.slug} value={activity.slug}>
                  {activity.name}
                </option>
              ))}
            </select>

            <label htmlFor="starts-at">Start date and time</label>
            <input
              id="starts-at"
              type="datetime-local"
              step="3600"
              value={startsAt}
              onChange={(event) => setStartsAt(event.target.value)}
              required
            />

            {sessionError && (
              <p className="form-error" role="alert">{sessionError}</p>
            )}
            {sessionMessage && (
              <p className="form-success" role="status">{sessionMessage}</p>
            )}

            <button className="button button-dark" disabled={creating}>
              {creating ? 'Creating…' : 'Create session'}
            </button>
          </form>
        </section>

        <section className="admin-card">
          <p className="eyebrow">Welcome members</p>
          <h2>Check in</h2>
          <p className="admin-card-copy">
            Enter the check-in code from the member’s booking.
          </p>

          <form className="auth-form" onSubmit={handleCheckIn}>
            <label htmlFor="checkin-code">Check-in code</label>
            <input
              id="checkin-code"
              type="text"
              value={checkinCode}
              onChange={(event) => setCheckinCode(event.target.value)}
              autoComplete="off"
              required
            />

            {checkinError && (
              <p className="form-error" role="alert">{checkinError}</p>
            )}
            {checkinMessage && (
              <p className="form-success" role="status">{checkinMessage}</p>
            )}

            <button className="button button-dark" disabled={checkingIn}>
              {checkingIn ? 'Checking in…' : 'Check in member'}
            </button>
          </form>
        </section>
      </div>
      <section className="admin-card admin-session-bookings">
  <p className="eyebrow">Session attendance</p>
  <h2>Bookings and check-ins</h2>

  <label htmlFor="booking-session">Choose a session</label>
  <select
    id="booking-session"
    value={selectedSessionId}
    onChange={(event) => setSelectedSessionId(event.target.value)}
    disabled={sessions.length === 0}
  >
    {sessions.length === 0 ? (
      <option value="">No sessions available</option>
    ) : (
      sessions.map((session) => {
  const activityName =
    activities.find((activity) => activity.slug === session.activity_type)
      ?.name ?? session.activity_type

  const shortActivityName =
    activityName === 'Strength' ? 'Strength' : activityName

  const sessionTime = new Intl.DateTimeFormat('en-IN', {
  day: 'numeric',
  month: 'short',
  hour: 'numeric',
}).format(new Date(session.starts_at))

  return (
    <option key={session.id} value={session.id}>
      {shortActivityName} · {sessionTime}
    </option>
  )
})
    )}
  </select>

  {bookingsLoading && <p>Loading bookings…</p>}

  {bookingsError && (
    <p className="form-error" role="alert">
      {bookingsError}
    </p>
  )}

  {!bookingsLoading && !bookingsError && sessionBookings.length === 0 && (
    <p>No bookings for this session yet.</p>
  )}

  {!bookingsLoading && sessionBookings.length > 0 && (
    <ul className="admin-booking-list">
      {sessionBookings.map((booking) => (
        <li key={booking.id}>
          <strong>{booking.member_name || 'Member'}</strong>
          <span>{booking.member_email || 'Email unavailable'}</span>
          <span>
            {booking.status === 'cancelled'
              ? 'Cancelled'
              : booking.checked_in_at
                ? 'Checked in'
                : 'Not checked in'}
          </span>
        </li>
      ))}
    </ul>
  )}
</section>
    </main>
  )
}

export default AdminPage