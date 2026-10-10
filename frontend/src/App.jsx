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
        <Link to="/">SyncFit</Link>

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
            <Link to="/login">Log in</Link>
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