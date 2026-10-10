import { useState } from 'react'
import { Link } from 'react-router'
import { registerMember } from '../services/api.js'

function RegisterPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')
    setIsSubmitting(true)

    try {
      await registerMember({ name, email, phone, password })
      setSuccess(true)
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="auth-page">
      <section className="auth-image-panel">
        <img
          src="https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=1200&q=85"
          alt="A person stretching in a bright studio"
        />
        <p className="auth-image-caption">Your routine can start with one session.</p>
      </section>

      <section className="auth-card">
        {success ? (
          <>
            <p className="eyebrow">You’re all set</p>
            <h1>Welcome to SyncFit.</h1>
            <p className="auth-intro">
              Your account was created. Log in to explore upcoming sessions.
            </p>
            <Link className="button button-dark" to="/login">
              Go to log in
            </Link>
          </>
        ) : (
          <>
            <p className="eyebrow">A good place to begin</p>
            <h1>Create your account.</h1>
            <p className="auth-intro">
              Join SyncFit and find a session that fits your day.
            </p>

            <form className="auth-form" onSubmit={handleSubmit}>
              <label htmlFor="name">Full name</label>
              <input
                id="name"
                type="text"
                autoComplete="name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                required
              />

              <label htmlFor="email">Email address</label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
              />

              <label htmlFor="phone">Contact number</label>
              <input
                id="phone"
                type="tel"
                autoComplete="tel"
                value={phone}
                onChange={(event) => setPhone(event.target.value)}
                required
              />

              <label htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                autoComplete="new-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                minLength={8}
                required
              />

              {error && <p className="form-error" role="alert">{error}</p>}

              <button className="button button-dark" disabled={isSubmitting}>
                {isSubmitting ? 'Creating account…' : 'Create account'}
              </button>
            </form>

            <p className="auth-switch">
              Already a member? <Link to="/login">Log in</Link>
            </p>
          </>
        )}
      </section>
    </main>
  )
}

export default RegisterPage