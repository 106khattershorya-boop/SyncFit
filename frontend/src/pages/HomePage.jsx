import { Link } from 'react-router'
import './HomePage.css'

// Tip: to swap a photo, just replace the `image` URL below.
const activities = [
  {
    name: 'Strength',
    price: 300,
    image:
      'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=900&q=85',
    alt: 'Weights and strength equipment in a gym',
  },
  {
    name: 'HIIT',
    price: 250,
    image:
      'https://images.unsplash.com/photo-1599058917212-d750089bc07e?auto=format&fit=crop&w=900&q=85',
    alt: 'Athlete training in a gym',
  },
  {
    name: 'Zumba',
    price: 250,
    image:
      'https://images.unsplash.com/photo-1524594152303-9fd13543fe6e?auto=format&fit=crop&w=900&q=85',
    alt: 'Group enjoying a dance class',
  },
  {
    name: 'Aerobics',
    price: 200,
    image:
      'https://images.unsplash.com/photo-1549576490-b0b4831ef60a?auto=format&fit=crop&w=900&q=85',
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
      'https://images.unsplash.com/photo-1747238415033-b74eec07eb59?auto=format&fit=crop&w=900&q=85',
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
      'https://images.unsplash.com/photo-1717356495389-6ab1e5ff9d84?auto=format&fit=crop&w=900&q=85',
    alt: 'Warm, peaceful spa room',
  },
]

// If a photo ever fails to load, hide it so the card shows its soft green backdrop.
function hideBrokenImage(event) {
  event.currentTarget.style.visibility = 'hidden'
}

function HomePage() {
  return (
    <main className="sf-home">
      {/* ───────── Hero ───────── */}
      <section className="sf-hero">
        <div className="sf-hero-copy">
          <p className="sf-eyebrow">A little time for yourself</p>
          <h1>
            Move your way.<br />
            <span className="sf-brush">Feel more like you.</span>
          </h1>
          <p className="sf-hero-description">
            Find a class that fits your day, book your place, and make
            movement part of your routine.
          </p>

          <div className="sf-hero-actions">
            <Link className="sf-btn sf-btn-dark" to="/activities">
              Explore activities
            </Link>
            <Link className="sf-btn sf-btn-ghost" to="/register">
              Join SyncFit <span aria-hidden="true">↗</span>
            </Link>
          </div>

          <p className="sf-note">
            Small steps count, too.
          </p>
        </div>

        <div className="sf-hero-art">
          <span className="sf-scrap sf-scrap-green" aria-hidden="true" />
          <span className="sf-scrap sf-scrap-sage" aria-hidden="true" />
          <span className="sf-scrap sf-scrap-paper" aria-hidden="true" />
          <span className="sf-doodle-dumbbell" aria-hidden="true" />
          <img
            className="sf-hero-image"
            src="https://images.unsplash.com/photo-1599058917212-d750089bc07e?auto=format&fit=crop&w=1400&q=90"
            alt="Athlete training in a sunlit gym"
          />
          <div className="sf-hero-caption">
            <span>Find your rhythm</span>
            <span aria-hidden="true">✳</span>
          </div>
        </div>
      </section>

      {/* ───────── Activities ───────── */}
      <section className="sf-activities" id="activities">
        <div className="sf-section-head">
          <div>
            <p className="sf-eyebrow sf-eyebrow-small">Room to try something new</p>
            <h2>
              Find your kind of <span className="sf-brush">movement</span>
            </h2>
          </div>
          <Link className="sf-view-all" to="/activities">
            View all activities <span aria-hidden="true">→</span>
          </Link>
        </div>

        <div className="sf-activity-grid">
          {activities.map((activity) => (
            <article className="sf-activity-card" key={activity.name}>
              <div className="sf-activity-photo">
                <img
                  src={activity.image}
                  alt={activity.alt}
                  loading="lazy"
                  onError={hideBrokenImage}
                />
              </div>
              <div className="sf-activity-info">
                <h3>{activity.name}</h3>
                <p>From ₹{activity.price} <span>/ session</span></p>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* ───────── How it works ───────── */}
      <section className="sf-how" aria-labelledby="how-title">
        <h2 id="how-title">How it works</h2>

        <div className="sf-how-layout">
          <div className="sf-how-handnote">
            <span>3 simple<br />steps</span>
            <svg viewBox="0 0 120 55" aria-hidden="true">
              <path d="M5 12 C35 45 76 45 105 20 M91 15 L106 20 L98 34" />
            </svg>
          </div>

          <div className="sf-how-steps">
            <article className="sf-how-step">
              <span className="sf-step-number">01</span>
              <h3>Choose an activity</h3>
              <p>Pick from the activities that feel right for you.</p>
            </article>

            <article className="sf-how-step">
              <span className="sf-step-number">02</span>
              <h3>Select a session</h3>
              <p>Find a date and time that works with your day.</p>
            </article>

            <article className="sf-how-step">
              <span className="sf-step-number">03</span>
              <h3>Book your spot</h3>
              <p>Confirm your booking and get ready to move.</p>
            </article>
          </div>

          <img
            className="sf-how-cutout"
            src="https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=600&q=85"
            alt="Athlete training at the gym"
            loading="lazy"
            onError={hideBrokenImage}
          />
        </div>
      </section>

      {/* ───────── Booking note / CTA ───────── */}
      <section className="sf-cta">
        <span className="sf-leaf" aria-hidden="true" />
        <div className="sf-cta-copy">
          <p className="sf-eyebrow sf-eyebrow-small">Your next good hour</p>
          <h2>Choose a session. Save your spot.</h2>
          <p>
            Browse upcoming times and book a place in just a few simple steps.
          </p>
        </div>
        <Link className="sf-btn sf-btn-dark sf-cta-button" to="/activities">
          Find a session
        </Link>
      </section>
    </main>
  )
}

export default HomePage
