import { useEffect, useState } from 'react'
import { Link } from 'react-router'
import {
  createBooking,
  getUpcomingSessions,
  isLoggedIn,
  joinWaitlist,
} from '../services/api.js'

const activities = [
  {
    slug: 'strength_conditioning',
    name: 'Strength & Conditioning',
    image:
      'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=700&q=85',
  },
  {
    slug: 'hiit',
    name: 'HIIT',
    image:
      'https://images.unsplash.com/photo-1517963879433-6ad2b056d712?auto=format&fit=crop&w=700&q=85',
  },
  {
    slug: 'zumba',
    name: 'Zumba',
    image:
      'https://images.unsplash.com/photo-1504609813442-a8924e83f76e?auto=format&fit=crop&w=700&q=85',
  },
  {
    slug: 'aerobics',
    name: 'Aerobics',
    image:
      'https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=700&q=85',
  },
  {
    slug: 'yoga',
    name: 'Yoga',
    image:
      'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=700&q=85',
  },
  {
    slug: 'pilates',
    name: 'Pilates',
    image:
      'https://images.unsplash.com/photo-1510894347719-f2f2e6a1f3b5?auto=format&fit=crop&w=700&q=85',
  },
  {
    slug: 'swimming',
    name: 'Swimming',
    image:
      'https://images.unsplash.com/photo-1530549387789-4c1017266635?auto=format&fit=crop&w=700&q=85',
  },
  {
    slug: 'sauna',
    name: 'Sauna',
    image:
      'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=700&q=85',
  },
]

function formatSessionTime(value) {
  return new Intl.DateTimeFormat('en-IN', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value))
}

function ActivitiesPage() {
  const [sessions, setSessions] = useState([])
  const [selectedActivity, setSelectedActivity] = useState('all')
  const [checkoutSession, setCheckoutSession] = useState(null)
  const [bookingResult, setBookingResult] = useState(null)
  const [loading, setLoading] = useState(true)
  const [pendingSessionId, setPendingSessionId] = useState('')
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')

  useEffect(() => {
    let isActive = true

    getUpcomingSessions()
      .then((data) => {
        if (isActive) setSessions(data)
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

  const visibleSessions =
    selectedActivity === 'all'
      ? sessions
      : sessions.filter(
          (session) => session.activity_type === selectedActivity,
        )

  function startCheckout(session) {
    setCheckoutSession(session)
    setBookingResult(null)
    setError('')
    setNotice('')
  }

  function closeCheckout() {
    setCheckoutSession(null)
    setBookingResult(null)
    setError('')
  }

  async function confirmMockPayment() {
    if (!checkoutSession) return

    setPendingSessionId(checkoutSession.id)
    setError('')

    try {
      const booking = await createBooking(checkoutSession.id)
      setBookingResult(booking)
      setSessions((currentSessions) =>
        currentSessions.map((session) =>
          session.id === checkoutSession.id
            ? {
                ...session,
                seats_remaining: Math.max(0, session.seats_remaining - 1),
              }
            : session,
        ),
      )
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setPendingSessionId('')
    }
  }

  async function handleJoinWaitlist(session) {
    setPendingSessionId(session.id)
    setError('')
    setNotice('')

    try {
      await joinWaitlist(session.id)
      setNotice(`You joined the waitlist for ${getActivityName(session)}.`)
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setPendingSessionId('')
    }
  }

  function getActivityName(session) {
    return (
      activities.find((activity) => activity.slug === session.activity_type)
        ?.name ?? session.activity_type
    )
  }

  return (
    <main className="home-page inner-page">
      <section className="activities-section">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Move in a way that feels right</p>
            <h1>Upcoming sessions</h1>
          </div>
          <Link className="text-link" to="/">
            Back home <span aria-hidden="true">←</span>
          </Link>
        </div>

        <label className="activity-filter">
          <span>Activity</span>
          <select
            value={selectedActivity}
            onChange={(event) => setSelectedActivity(event.target.value)}
          >
            <option value="all">All activities</option>
            {activities.map((activity) => (
              <option key={activity.slug} value={activity.slug}>
                {activity.name}
              </option>
            ))}
          </select>
        </label>

        {loading && <p>Loading upcoming sessions…</p>}

        {error && (
          <p className="session-message" role="alert">
            {error}
          </p>
        )}

        {notice && (
          <p className="session-message" role="status">
            {notice}
          </p>
        )}

        {!loading && !error && visibleSessions.length === 0 && (
          <p className="session-message">
            No upcoming sessions found. Try another activity or check back later.
          </p>
        )}

        {!loading && !error && visibleSessions.length > 0 && (
          <div className="session-list">
            {visibleSessions.map((session) => {
              const activity = activities.find(
                (item) => item.slug === session.activity_type,
              )
              const isFull = session.seats_remaining === 0
              const isPending = pendingSessionId === session.id

              return (
                <article className="session-card" key={session.id}>
                  <img
                    className="session-image"
                    src={activity?.image}
                    alt=""
                    loading="lazy"
                  />

                  <div className="session-info">
                    <p className="eyebrow">{getActivityName(session)}</p>
                    <h2>{formatSessionTime(session.starts_at)}</h2>
                    <p className="session-detail">
                      ₹{session.price_rupees} ·{' '}
                      {isFull
                        ? 'Fully booked'
                        : `${session.seats_remaining} spots available`}
                    </p>
                  </div>

                  {!isLoggedIn() ? (
                    <Link className="button button-dark" to="/login">
                      Log in to continue
                    </Link>
                  ) : isFull ? (
                    <button
                      className="button button-dark"
                      disabled={isPending}
                      onClick={() => handleJoinWaitlist(session)}
                    >
                      {isPending ? 'Joining…' : 'Join waitlist'}
                    </button>
                  ) : (
                    <button
                      className="button button-dark"
                      onClick={() => startCheckout(session)}
                    >
                      Book session
                    </button>
                  )}
                </article>
              )
            })}
          </div>
        )}
      </section>

      {checkoutSession && (
        <div className="checkout-overlay">
          <section
            className="checkout-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="checkout-title"
          >
            {bookingResult ? (
              <>
                <p className="eyebrow">Booking confirmed</p>
                <h2 id="checkout-title">Your spot is saved.</h2>
                <p>
                  {getActivityName(checkoutSession)} ·{' '}
                  {formatSessionTime(checkoutSession.starts_at)}
                </p>
                <p>
                  Check-in code: <strong>{bookingResult.checkin_code}</strong>
                </p>
                <button
                  className="button button-dark"
                  onClick={closeCheckout}
                >
                  Done
                </button>
              </>
            ) : (
              <>
                <p className="eyebrow">Demo checkout</p>
                <h2 id="checkout-title">Review your session</h2>
                <p>
                  {getActivityName(checkoutSession)} ·{' '}
                  {formatSessionTime(checkoutSession.starts_at)}
                </p>
                <p className="checkout-price">
                  ₹{checkoutSession.price_rupees}
                </p>
                <p className="session-detail">
                  This is a mock payment for the project demo. No card details
                  are needed and no real payment will be taken.
                </p>

                {error && <p className="form-error" role="alert">{error}</p>}

                <button
                  className="button button-dark"
                  disabled={pendingSessionId === checkoutSession.id}
                  onClick={confirmMockPayment}
                >
                  {pendingSessionId === checkoutSession.id
                    ? 'Confirming…'
                    : `Confirm demo booking · ₹${checkoutSession.price_rupees}`}
                </button>
                <button className="checkout-cancel" onClick={closeCheckout}>
                  Go back
                </button>
              </>
            )}
          </section>
        </div>
      )}
    </main>
  )
}

export default ActivitiesPage