import { Link } from 'react-router'

const activities = [
  {
    name: 'Strength & Conditioning',
    price: 300,
    image:
      'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=900&q=85',
    alt: 'Weights and strength equipment in a gym',
  },
  {
    name: 'HIIT',
    price: 250,
    image:
      'https://images.unsplash.com/photo-1517963879433-6ad2b056d712?auto=format&fit=crop&w=900&q=85',
    alt: 'Athlete training in a gym',
  },
  {
    name: 'Zumba',
    price: 250,
    image:
      'https://images.unsplash.com/photo-1504609813442-a8924e83f76e?auto=format&fit=crop&w=900&q=85',
    alt: 'Group enjoying a dance class',
  },
  {
    name: 'Aerobics',
    price: 200,
    image:
      'https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=900&q=85',
    alt: 'Person exercising on a studio mat',
  },
  {
    name: 'Yoga',
    price: 250,
    image:
      'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=900&q=85',
    alt: 'Yoga practice in a calm studio',
  },
  {
    name: 'Pilates',
    price: 350,
    image:
      'https://images.unsplash.com/photo-1510894347719-f2f2e6a1f3b5?auto=format&fit=crop&w=900&q=85',
    alt: 'Pilates class in a bright studio',
  },
  {
    name: 'Swimming',
    price: 400,
    image:
      'https://images.unsplash.com/photo-1530549387789-4c1017266635?auto=format&fit=crop&w=900&q=85',
    alt: 'Swimmer in a clear pool',
  },
  {
    name: 'Sauna',
    price: 300,
    image:
      'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=900&q=85',
    alt: 'Warm, peaceful spa room',
  },
]

function HomePage() {
  return (
    <main className="home-page">
      <section className="hero">
        <div className="hero-copy">
          <p className="eyebrow">A little time for yourself</p>
          <h1>Move your way.<br />Feel more like you.</h1>
          <p className="hero-description">
            Find a class that fits your day, book your place, and make
            movement part of your routine.
          </p>

          <div className="hero-actions">
            <Link className="button button-dark" to="/activities">
              Explore activities
            </Link>
            <Link className="text-link" to="/register">
              Join SyncFit <span aria-hidden="true">↗</span>
            </Link>
          </div>

          <p className="handwritten-note">
            Small steps count, too.
          </p>
        </div>

        <div className="hero-image-wrap">
          <img
            className="hero-image"
            src="https://images.unsplash.com/photo-1576678927484-cc907957088c?auto=format&fit=crop&w=1400&q=90"
            alt="Athlete training in a sunlit gym"
          />
          <div className="image-caption">
            <span>Find your rhythm</span>
            <span aria-hidden="true">✳</span>
          </div>
        </div>
      </section>

      <section className="activities-section" id="activities">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Room to try something new</p>
            <h2>Find your kind of movement</h2>
          </div>
          <Link className="text-link" to="/activities">
            View all activities <span aria-hidden="true">→</span>
          </Link>
        </div>

        <div className="activity-grid">
          {activities.map((activity) => (
            <article className="activity-card" key={activity.name}>
              <img src={activity.image} alt={activity.alt} loading="lazy" />
              <div className="activity-card-info">
                <h3>{activity.name}</h3>
                <p>From ₹{activity.price} <span>/ session</span></p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="booking-note">
        <p className="eyebrow">Your next good hour</p>
        <h2>Choose a session. Save your spot.</h2>
        <p>
          Browse upcoming times and book a place in just a few simple steps.
        </p>
        <Link className="button button-light" to="/activities">
          Find a session
        </Link>
      </section>
    </main>
  )
}

export default HomePage