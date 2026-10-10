import { useEffect, useState } from 'react'
import { Link } from 'react-router'
import { getUpcomingSessions } from '../services/api.js'

const activities = [
  { slug: 'strength_conditioning', name: 'Strength & Conditioning' },
  { slug: 'hiit', name: 'HIIT' },
  { slug: 'zumba', name: 'Zumba' },
  { slug: 'aerobics', name: 'Aerobics' },
  { slug: 'yoga', name: 'Yoga' },
  { slug: 'pilates', name: 'Pilates' },
  { slug: 'swimming', name: 'Swimming' },
  { slug: 'sauna', name: 'Sauna' },
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
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

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

  return (
    <main className="home-page">
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
            Couldn’t load sessions: {error}
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

              return (
                <article className="session-card" key={session.id}>
                  <div>
                    <p className="eyebrow">
                      {activity?.name ?? session.activity_type}
                    </p>
                    <h2>{formatSessionTime(session.starts_at)}</h2>
                    <p className="session-detail">
                      ₹{session.price_rupees} ·{' '}
                      {isFull
                        ? 'Fully booked'
                        : `${session.seats_remaining} spots available`}
                    </p>
                  </div>

                  <Link className="button button-dark" to="/login">
                    {isFull ? 'Log in to join waitlist' : 'Log in to book'}
                  </Link>
                </article>
              )
            })}
          </div>
        )}
      </section>
    </main>
  )
}

export default ActivitiesPage