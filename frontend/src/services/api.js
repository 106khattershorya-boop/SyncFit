const API_BASE_URL =
  import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api'

const TOKEN_KEY = 'syncfit_access_token'

async function request(path, options = {}) {
  const headers = { ...options.headers }

  if (options.body) {
    headers['Content-Type'] = 'application/json'
  }

  const token = sessionStorage.getItem(TOKEN_KEY)

  if (token) {
    headers.Authorization = `Bearer ${token}`
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
  })

  const data = await response.json()

  if (!response.ok) {
  const apiDetails = Array.isArray(data.error?.details)
    ? data.error.details
        .map((detail) => `${detail.field}: ${detail.message}`)
        .join(' ')
    : ''

  const validationDetails = Array.isArray(data.detail)
    ? data.detail.map((detail) => detail.msg).join(' ')
    : typeof data.detail === 'string'
      ? data.detail
      : ''

  const message =
    [data.error?.message, apiDetails, validationDetails]
      .filter(Boolean)
      .join(' ') || 'The request could not be completed.'

  throw new Error(message)
}

  return data
}

export function getUpcomingSessions(activityType, sessionDate) {
  const params = new URLSearchParams()

  if (activityType) {
    params.set('activity_type', activityType)
  }

  if (sessionDate) {
    params.set('session_date', sessionDate)
  }

  const query = params.toString()
  return request(`/sessions${query ? `?${query}` : ''}`)
}

export async function loginMember(credentials) {
  const data = await request('/auth/login', {
    method: 'POST',
    body: JSON.stringify(credentials),
  })

  sessionStorage.setItem(TOKEN_KEY, data.access_token)
  return data
}

export function registerMember(details) {
  return request('/auth/register', {
    method: 'POST',
    body: JSON.stringify(details),
  })
}

export function isLoggedIn() {
  return Boolean(sessionStorage.getItem(TOKEN_KEY))
}

export function logoutMember() {
  sessionStorage.removeItem(TOKEN_KEY)
}

export function createBooking(sessionId) {
  return request('/bookings', {
    method: 'POST',
    body: JSON.stringify({ session_id: sessionId }),
  })
}

export function getMyBookings() {
  return request('/bookings/me')
}

export function cancelBooking(bookingId) {
  return request(`/bookings/${encodeURIComponent(bookingId)}`, {
    method: 'DELETE',
  })
}

export function joinWaitlist(sessionId) {
  return request('/waitlist', {
    method: 'POST',
    body: JSON.stringify({ session_id: sessionId }),
  })
}

export function createSession(details) {
  return request('/sessions', {
    method: 'POST',
    body: JSON.stringify(details),
  })
}

export function checkInMember(code) {
  return request('/checkins', {
    method: 'POST',
    body: JSON.stringify({ code }),
  })
}

export function getMyWaitlist() {
  return request('/waitlist')
}

export function getAdminSessions() {
  return request('/sessions/admin')
}

export function getSessionBookings(sessionId) {
  return request(`/sessions/${encodeURIComponent(sessionId)}/bookings`)
}

export function leaveWaitlist(sessionId) {
  return request(`/waitlist/${encodeURIComponent(sessionId)}`, {
    method: 'DELETE',
  })
}

export function getCurrentUser() {
  return request('/auth/me')
}