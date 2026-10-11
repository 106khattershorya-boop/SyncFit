import { Link, Route, Routes, useLocation, useNavigate } from 'react-router'
import ActivitiesPage from './pages/ActivitiesPage.jsx'
import AdminPage from './pages/AdminPage.jsx'
import BookingsPage from './pages/BookingsPage.jsx'
import HomePage from './pages/HomePage.jsx'
import LoginPage from './pages/LoginPage.jsx'
import RegisterPage from './pages/RegisterPage.jsx'
import { isLoggedIn, logoutMember } from './services/api.js'
import './App.css'

function NotFound() {
  return (
    <main>
      <h1>Page not found</h1>
      <Link to="/">Go home</Link>
    </main>
  )
}

function App() {
  const location = useLocation()
  const navigate = useNavigate()
  const authenticated = isLoggedIn()

  function handleLogout() {
    logoutMember()
    navigate('/')
  }

  return (
    <>
      <header data-page={location.pathname}>
        <Link className="brand" to="/" aria-label="SyncFit home">
  <svg className="brand-mark" viewBox="0 0 48 48" aria-hidden="true">
    <circle cx="25" cy="8" r="4" />
    <path d="M23 15c-5 2-8 6-9 12l-2 9m12-20 7 8 8-2M21 27l-8 8m12-8 8 10" />
    <path d="M5 12h10m-7-3v6m5-6v6M33 33h10m-7-3v6m5-6v6" />
  </svg>

  <span className="brand-copy">
  <span className="brand-word">
    SyncF
    <svg className="brand-dumbbell" viewBox="0 0 28 40" aria-hidden="true">
  <rect x="2" y="2" width="24" height="9" rx="3" />
  <rect x="9" y="9" width="10" height="22" rx="4" />
  <rect x="2" y="29" width="24" height="9" rx="3" />
</svg>
    t
  </span>
</span>
    </Link>

        <nav aria-label="Main navigation">
          <Link to="/activities">Activities</Link>
          <Link to="/bookings">My bookings</Link>

          {authenticated ? (
            <>
              <Link to="/admin">Admin</Link>
              <button
                className="nav-button"
                type="button"
                onClick={handleLogout}
              >
                Log out
              </button>
            </>
          ) : (
            <Link className="nav-cta" to="/login">Log in</Link>
          )}
        </nav>
      </header>

      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/activities" element={<ActivitiesPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/bookings" element={<BookingsPage />} />
        <Route path="/admin" element={<AdminPage />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  )
}

export default App