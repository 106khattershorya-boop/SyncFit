const API_BASE_URL =
  import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api'

async function request(path) {
  const response = await fetch(`${API_BASE_URL}${path}`)
  const data = await response.json()

  if (!response.ok) {
    const message =
      data.error?.message || data.detail || 'The request could not be completed.'
    throw new Error(message)
  }

  return data
}

export function getUpcomingSessions(activityType) {
  const query = activityType
    ? `?activity_type=${encodeURIComponent(activityType)}`
    : ''

  return request(`/sessions${query}`)
}