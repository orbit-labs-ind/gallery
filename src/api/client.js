import { store } from '../store/store'
import {
  TOKEN_KEY,
  syncAuthFromStorage,
  logout,
} from '../store/slices/authSlice'

export const API_BASE =
  import.meta.env.VITE_API_URL || 'http://localhost:3001/api'

const base = API_BASE.replace(/\/$/, '')

export async function parseJsonResponse(res) {
  const text = await res.text()
  if (!text) return {}
  try {
    return JSON.parse(text)
  } catch {
    return {}
  }
}

/**
 * Authenticated API calls: sends Bearer token, applies sliding JWT from
 * X-Renewed-Token, logs out on 401 when a token was sent.
 */
export async function apiFetch(path, options = {}) {
  const token = localStorage.getItem(TOKEN_KEY)
  const { headers: initHeaders, ...rest } = options
  const headers = new Headers(initHeaders)

  if (token) {
    headers.set('Authorization', `Bearer ${token}`)
  }

  const url = path.startsWith('/') ? `${base}${path}` : `${base}/${path}`
  const res = await fetch(url, { ...rest, headers })

  const renewed = res.headers.get('x-renewed-token')
  if (renewed) {
    localStorage.setItem(TOKEN_KEY, renewed)
    store.dispatch(syncAuthFromStorage())
  }

  if (res.status === 401 && token) {
    store.dispatch(logout())
  }

  return res
}
