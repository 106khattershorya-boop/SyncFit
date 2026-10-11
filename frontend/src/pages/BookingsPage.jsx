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

const bookingImages = {
  'Strength & Conditioning':
    'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=900&q=85',
  HIIT:
    'https://images.unsplash.com/photo-1599058917212-d750089bc07e?auto=format&fit=crop&w=900&q=85',
  Zumba:
    'https://images.unsplash.com/photo-1524594152303-9fd13543fe6e?auto=format&fit=crop&w=900&q=85',
  Aerobics:
    'https://images.unsplash.com/photo-1549576490-b0b4831ef60a?auto=format&fit=crop&w=900&q=85',
  Yoga:
    'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=900&q=85',
  Pilates:
    'https://images.unsplash.com/photo-1747238415033-b74eec07eb59?auto=format&fit=crop&w=900&q=85',
  Swimming:
    'https://images.unsplash.com/photo-1530549387789-4c1017266635?auto=format&fit=crop&w=900&q=85',
  Sauna:
    'https://images.unsplash.com/photo-1717356495389-6ab1e5ff9d84?auto=format&fit=crop&w=900&q=85',
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
          <div className="booking-empty booking-empty-feature">
  <div className="booking-empty-copy">
    <h2>No bookings yet.</h2>
    <p>Your next session is waiting for you.</p>
    <Link className="button button-dark" to="/activities">
      Explore sessions
    </Link>
  </div>

  <div className="booking-empty-art">
    <img
      src="https://images.unsplash.com/photo-1447452001602-7090c7ab2db3?auto=format&fit=crop&w=800&q=85"
      alt="A yoga practitioner in silhouette at sunrise"
      loading="lazy"
    />
    <span>Make room for a good hour.</span>
  </div>
</div>
        )}
        {!loading && !error && bookings.length === 0 && (
  <section className="booking-discover">
    <div className="booking-discover-heading">
      <div>
        <p className="eyebrow">A good place to begin</p>
        <h2>Find your kind of movement</h2>
      </div>
      <Link to="/activities">See all sessions →</Link>
    </div>

    <div className="booking-discover-grid">
      <Link className="booking-discover-card" to="/activities">
        <img
          src="https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=900&q=85"
          alt="Weights in a gym"
          loading="lazy"
        />
        <span>Strength</span>
      </Link>

      <Link className="booking-discover-card" to="/activities">
        <img
          src="https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=700&q=85"
          alt="A calm yoga session"
          loading="lazy"
        />
        <span>Yoga</span>
      </Link>

      <Link className="booking-discover-card" to="/activities">
        <img
          src="https://images.unsplash.com/photo-1524594152303-9fd13543fe6e?auto=format&fit=crop&w=900&q=85"
          alt="A group dance class"
          loading="lazy"
        />
        <span>Dance</span>
      </Link>
    </div>
  </section>
)}

        {!loading && bookings.length > 0 && (
          <div className="booking-list">
            {bookings.map((booking) => (
              <article className="booking-card" key={booking.id}>
  <img
    className="booking-card-image"
    src={bookingImages[booking.activityName]}
    alt={`${booking.activityName} session`}
    loading="lazy"
  />

  <div className="booking-card-info">
    <p className="eyebrow">{booking.activityName}</p>
    <h2>{formatSessionTime(booking.session_starts_at)}</h2>

    <div className="booking-card-meta">
      <p className={`booking-status status-${booking.status}`}>
        {booking.status}
      </p>

      {booking.status === 'confirmed' && booking.checkin_code && (
        <p className="session-detail">
          Check-in code: <strong>{booking.checkin_code}</strong>
        </p>
      )}
    </div>
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