/**
 * API client: adds Bearer token, handles X-Renewed-Token and inactivity tracking.
 */
import { TOKEN_KEY, LAST_ACTIVITY_KEY } from '../store/slices/authSlice'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001'

function getToken() {
  return typeof window !== 'undefined' ? localStorage.getItem(TOKEN_KEY) : null
}

function updateActivity() {
  if (typeof window !== 'undefined') {
    localStorage.setItem(LAST_ACTIVITY_KEY, String(Date.now()))
  }
}

function updateTokenFromResponse(response) {
  const newToken = response.headers.get('X-Renewed-Token')
  if (newToken && typeof window !== 'undefined') {
    localStorage.setItem(TOKEN_KEY, newToken)
  }
}

export async function apiFetch(path, options = {}) {
  const token = getToken()
  const url = path.startsWith('http') ? path : `${API_BASE}${path}`
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  }
  if (token) {
    headers.Authorization = `Bearer ${token}`
  }

  const res = await fetch(url, { ...options, headers })
  updateTokenFromResponse(res)
  updateActivity()
  return res
}

export { API_BASE }
