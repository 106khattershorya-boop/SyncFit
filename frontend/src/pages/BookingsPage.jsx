import { useEffect, useState } from 'react'
import { Link } from 'react-router'
import {
  cancelBooking,
  getMyBookings,
  getUpcomingSessions,
  isLoggedIn,
} from '../services/api.js'

const activityNames = {
  strength_conditioning: 'Strength & Conditioning',
  hiit: 'HIIT',
  zumba: 'Zumba',
  aerobics: 'Aerobics',
  yoga: 'Yoga',
  pilates: 'Pilates',
  swimming: 'Swimming',
  sauna: 'Sauna',
}

function formatSessionTime(value) {
  return new Intl.DateTimeFormat('en-IN', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value))
}

function BookingsPage() {
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [cancellingId, setCancellingId] = useState('')
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')

  useEffect(() => {
    if (!isLoggedIn()) {
      setLoading(false)
      return
    }

    let isActive = true

    Promise.all([getMyBookings(), getUpcomingSessions()])
      .then(([myBookings, sessions]) => {
        if (!isActive) return

        const sessionsById = new Map(
          sessions.map((session) => [session.id, session]),
        )

        setBookings(
          myBookings.map((booking) => ({
            ...booking,
            activityName:
              activityNames[
                sessionsById.get(booking.session_id)?.activity_type
              ] || 'Gym session',
          })),
        )
      })
      .catch((requestError) => {
        if (isActive) setError(requestError.message)
      })
      .finally(() => {
        if (isActive) setLoading(false)
      })

    return () => {
      isActive = false
    }
  }, [])

  async function handleCancel(bookingId) {
    setCancellingId(bookingId)
    setError('')
    setNotice('')

    try {
      const updatedBooking = await cancelBooking(bookingId)

      setBookings((currentBookings) =>
        currentBookings.map((booking) =>
          booking.id === bookingId
            ? { ...booking, ...updatedBooking }
            : booking,
        ),
      )
      setNotice('Your booking has been cancelled.')
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setCancellingId('')
    }
  }

  if (!isLoggedIn()) {
    return (
      <main className="home-page">
        <section className="booking-empty">
          <p className="eyebrow">Your sessions, all in one place</p>
          <h1>Log in to see your bookings.</h1>
          <Link className="button button-dark" to="/login">
            Log in
          </Link>
        </section>
      </main>
    )
  }

  return (
    <main className="home-page inner-page">
      <section className="activities-section">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Your sessions, all in one place</p>
            <h1>My bookings</h1>
          </div>
          <Link className="text-link" to="/activities">
            Find a session <span aria-hidden="true">→</span>
          </Link>
        </div>

        {loading && <p>Loading your bookings…</p>}
        {error && <p className="session-message" role="alert">{error}</p>}
        {notice && <p className="session-message" role="status">{notice}</p>}

        {!loading && !error && bookings.length === 0 && (
          <div className="booking-empty">
            <h2>No bookings yet.</h2>
            <p>Your next session is waiting for you.</p>
            <Link className="button button-dark" to="/activities">
              Explore sessions
            </Link>
          </div>
        )}

        {!loading && bookings.length > 0 && (
          <div className="booking-list">
            {bookings.map((booking) => (
              <article className="booking-card" key={booking.id}>
                <div>
                  <p className="eyebrow">{booking.activityName}</p>
                  <h2>{formatSessionTime(booking.session_starts_at)}</h2>
                  <p className={`booking-status status-${booking.status}`}>
                    {booking.status}
                  </p>
                  {booking.status === 'confirmed' && booking.checkin_code && (
                    <p className="session-detail">
                      Check-in code: <strong>{booking.checkin_code}</strong>
                    </p>
                  )}
                </div>

                {booking.status === 'confirmed' && (
                  <button
                    className="button button-outline"
                    disabled={cancellingId === booking.id}
                    onClick={() => handleCancel(booking.id)}
                  >
                    {cancellingId === booking.id ? 'Cancelling…' : 'Cancel booking'}
                  </button>
                )}
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  )
}

export default BookingsPage