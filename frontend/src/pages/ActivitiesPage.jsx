import { useEffect, useState } from 'react'
import { Link } from 'react-router'
import {
  createBooking,
  getMyBookings,
  getMyWaitlist,
  getUpcomingSessions,
  isLoggedIn,
  joinWaitlist,
  leaveWaitlist,
} from '../services/api.js'

const activities = [
  {
    slug: 'strength_conditioning',
    name: 'Strength & Conditioning',
    image:
      'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=900&q=85',
  },
  {
    slug: 'hiit',
    name: 'HIIT',
    image:
      'https://images.unsplash.com/photo-1599058917212-d750089bc07e?auto=format&fit=crop&w=900&q=85',
  },
  {
    slug: 'zumba',
    name: 'Zumba',
    image:
      'https://images.unsplash.com/photo-1524594152303-9fd13543fe6e?auto=format&fit=crop&w=900&q=85',
  },
  {
    slug: 'aerobics',
    name: 'Aerobics',
    image:
      'https://images.unsplash.com/photo-1549576490-b0b4831ef60a?auto=format&fit=crop&w=900&q=85',
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
      'https://images.unsplash.com/photo-1747238415033-b74eec07eb59?auto=format&fit=crop&w=900&q=85',
  },
  {
    slug: 'swimming',
    name: 'Swimming',
    image:
      'https://images.unsplash.com/photo-1530549387789-4c1017266635?auto=format&fit=crop&w=900&q=85',
  },
  {
    slug: 'sauna',
    name: 'Sauna',
    image:
      'https://images.unsplash.com/photo-1717356495389-6ab1e5ff9d84?auto=format&fit=crop&w=900&q=85',
  },
]

function formatSessionTime(value) {
  return new Intl.DateTimeFormat('en-IN', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value))
}

function ActivitiesPage({isAdmin}) {
  const [sessions, setSessions] = useState([])
  const [selectedActivity, setSelectedActivity] = useState('all')
  const [sessionDate, setSessionDate] = useState('')
  const [checkoutSession, setCheckoutSession] = useState(null)
  const [bookingResult, setBookingResult] = useState(null)
  const [loading, setLoading] = useState(true)
  const [pendingSessionId, setPendingSessionId] = useState('')
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [bookedSessionIds, setBookedSessionIds] = useState(() => new Set())
  const [waitlistedSessionIds, setWaitlistedSessionIds] = useState(() => new Set())
  const [paymentMethod, setPaymentMethod] = useState('card')

  useEffect(() => {
    setLoading(true)
    setError('')
  let isActive = true

  async function loadActivities() {
    try {
      const [sessionData, bookings, waitlistSessionIds] = await Promise.all([
        getUpcomingSessions(undefined, sessionDate),
        isLoggedIn() ? getMyBookings() : Promise.resolve([]),
        isLoggedIn() ? getMyWaitlist() : Promise.resolve([]),
      ])

      if (!isActive) return

      setSessions(sessionData)
      setBookedSessionIds(
        new Set(
          bookings
            .filter((booking) => booking.status === 'confirmed')
            .map((booking) => booking.session_id),
        ),
      )
      setWaitlistedSessionIds(new Set(waitlistSessionIds))
    } catch (requestError) {
      if (isActive) setError(requestError.message)
    } finally {
      if (isActive) setLoading(false)
    }
  }

  loadActivities()

const refreshInterval = window.setInterval(async () => {
  try {
    const latestSessions = await getUpcomingSessions(undefined, sessionDate)
    if (isActive) setSessions(latestSessions)
  } catch (refreshError) {
    console.error('Could not refresh session availability.', refreshError)
  }
}, 30000)

return () => {
  isActive = false
  window.clearInterval(refreshInterval)
}
}, [sessionDate])

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
    setPaymentMethod('card')
  }

  function closeCheckout() {
    setCheckoutSession(null)
    setBookingResult(null)
    setError('')
  }

  async function confirmMockPayment() {
  if (!checkoutSession) return

  const sessionId = checkoutSession.id

  setPendingSessionId(sessionId)
  setError('')

  setBookedSessionIds((current) => {
    const updated = new Set(current)
    updated.add(sessionId)
    return updated
  })

  setSessions((currentSessions) =>
    currentSessions.map((session) =>
      session.id === sessionId
        ? {
            ...session,
            seats_remaining: Math.max(0, session.seats_remaining - 1),
          }
        : session,
    ),
  )

  try {
    const booking = await createBooking(sessionId)
    setBookingResult(booking)
  } catch (requestError) {
    setBookedSessionIds((current) => {
      const updated = new Set(current)
      updated.delete(sessionId)
      return updated
    })

    try {
      const latestSessions = await getUpcomingSessions(undefined, sessionDate)
      setSessions(latestSessions)
    } catch {
      // The next scheduled refresh will fetch the latest seat count.
    }

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

setWaitlistedSessionIds((current) => {
  const updated = new Set(current)
  updated.add(session.id)
  return updated
})

setNotice(`You joined the waitlist for ${getActivityName(session)}.`)
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setPendingSessionId('')
    }
  }

  async function handleLeaveWaitlist(session) {
  setPendingSessionId(session.id)
  setError('')
  setNotice('')

  try {
    await leaveWaitlist(session.id)

    setWaitlistedSessionIds((current) => {
      const updated = new Set(current)
      updated.delete(session.id)
      return updated
    })

    setNotice(`You left the waitlist for ${getActivityName(session)}.`)
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

        <label className="activity-filter">
          <span>Date</span>
          <input
            type="date"
            value={sessionDate}
            onChange={(event) => setSessionDate(event.target.value)}
          />
        </label>

        <div className="activity-discovery">
  <p className="eyebrow">Find your kind of movement</p>
  <div className="activity-discovery-grid">
    {activities.map((activity) => (
      <button
        className={`activity-tile ${
          selectedActivity === activity.slug ? 'is-selected' : ''
        }`}
        key={activity.slug}
        type="button"
        onClick={() => setSelectedActivity(activity.slug)}
      >
        <img src={activity.image} alt="" loading="lazy" />
        <span>{activity.name}</span>
      </button>
    ))}
  </div>
</div>

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
              const isBooked = bookedSessionIds.has(session.id)
              const isWaitlisted = waitlistedSessionIds.has(session.id)

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
) : isAdmin ? (
  <p className="session-detail">Booking is for member accounts.</p>
) : isBooked ? (
  <button className="button button-dark" disabled>
    Booked
  </button>
) : isFull ? (
  isWaitlisted ? (
    <button
      className="button button-outline"
      disabled={isPending}
      onClick={() => handleLeaveWaitlist(session)}
    >
      {isPending ? 'Leaving…' : 'Leave waitlist'}
    </button>
  ) : (
    <button
      className="button button-dark"
      disabled={isPending}
      onClick={() => handleJoinWaitlist(session)}
    >
      {isPending ? 'Joining…' : 'Join waitlist'}
    </button>
  )
) : (
  <button
    className="button button-dark"
    disabled={isPending}
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
                <p className="eyebrow">Choose how to pay</p>
<h2 id="checkout-title">Review your session</h2>
<p>
  {getActivityName(checkoutSession)} ·{' '}
  {formatSessionTime(checkoutSession.starts_at)}
</p>

<p className="checkout-price">
  ₹{checkoutSession.price_rupees}
</p>

<label className="payment-method-field" htmlFor="payment-method">
  Payment method
  <select
    id="payment-method"
    value={paymentMethod}
    onChange={(event) => setPaymentMethod(event.target.value)}
  >
    <option value="card">Card · mock payment</option>
    <option value="upi">UPI · mock payment</option>
    <option value="cash">Cash at Gym</option>
  </select>
</label>

<p className="session-detail">
  {paymentMethod === 'cash'
    ? 'Your spot will be reserved. Pay at the studio.'
    : `This will simulate a ${paymentMethod === 'card' ? 'card' : 'UPI'} payment. No real payment will be taken.`}
</p>

{error && <p className="form-error" role="alert">{error}</p>}

<button
  className="button button-dark"
  disabled={pendingSessionId === checkoutSession.id}
  onClick={confirmMockPayment}
>
  {pendingSessionId === checkoutSession.id
    ? 'Processing…'
    : paymentMethod === 'cash'
      ? `Reserve and pay at Gym · ₹${checkoutSession.price_rupees}`
      : `Pay with ${paymentMethod === 'card' ? 'card' : 'UPI'} · ₹${checkoutSession.price_rupees}`}
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