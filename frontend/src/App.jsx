import { Link, Route, Routes } from 'react-router'
import ActivitiesPage from './pages/ActivitiesPage.jsx'
import HomePage from './pages/HomePage.jsx'
import './App.css'

function PagePlaceholder({ title }) {
  return (
    <main>
      <h1>{title}</h1>
    </main>
  )
}

function NotFound() {
  return (
    <main>
      <h1>Page not found</h1>
      <Link to="/">Go home</Link>
    </main>
  )
}

function App() {
  return (
    <>
      <header>
        <Link to="/">SyncFit</Link>

        <nav aria-label="Main navigation">
          <Link to="/activities">Activities</Link>
          <Link to="/bookings">My bookings</Link>
          <Link to="/login">Log in</Link>
        </nav>
      </header>

      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/activities" element={<ActivitiesPage />} />
        <Route path="/login" element={<PagePlaceholder title="Log in" />} />
        <Route path="/register" element={<PagePlaceholder title="Create an account" />} />
        <Route path="/bookings" element={<PagePlaceholder title="My bookings" />} />
        <Route path="/admin" element={<PagePlaceholder title="Admin" />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  )
}

export default App