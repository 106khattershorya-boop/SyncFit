import { useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { loginMember } from '../services/api.js'

function LoginPage() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')
    setIsSubmitting(true)

    try {
      await loginMember({ email, password })
      navigate('/activities')
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
          src="https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=1200&q=85"
          alt="A calm yoga session in a sunlit studio"
        />
        <p className="auth-image-caption">Come as you are. Start where you are.</p>
      </section>

      <section className="auth-card">
        <p className="eyebrow">Welcome back</p>
        <h1>Good to see you again.</h1>
        <p className="auth-intro">
          Log in to find your next session and keep your routine going.
        </p>

        <form className="auth-form" onSubmit={handleSubmit}>
          <label htmlFor="email">Email address</label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />

          <label htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
          />

          {error && <p className="form-error" role="alert">{error}</p>}

          <button className="button button-dark" disabled={isSubmitting}>
            {isSubmitting ? 'Logging in…' : 'Log in'}
          </button>
        </form>

        <p className="auth-switch">
          New to SyncFit? <Link to="/register">Create an account</Link>
        </p>
      </section>
    </main>
  )
}

export default LoginPage