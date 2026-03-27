import { createSlice } from '@reduxjs/toolkit'

export const TOKEN_KEY = 'gallery_token'
export const EMAIL_KEY = 'gallery_email'
export const CURRENT_ORG_KEY = 'gallery_current_org_id'

function parseJwtPayload(token) {
  try {
    const parts = token.split('.')
    if (parts.length !== 3) return null
    let b64 = parts[1].replace(/-/g, '+').replace(/_/g, '/')
    const pad = (4 - (b64.length % 4)) % 4
    b64 += '='.repeat(pad)
    const json = atob(b64)
    return JSON.parse(json)
  } catch {
    return null
  }
}

// Client checks expiry only (signature is verified by the API on requests).
export const validateJWT = (token) => {
  if (!token || typeof token !== 'string') {
    return { valid: false, expired: false }
  }

  const payload = parseJwtPayload(token)
  if (!payload || typeof payload.exp !== 'number') {
    return { valid: false, expired: false }
  }

  const now = Math.floor(Date.now() / 1000)
  const isExpired = payload.exp < now

  return {
    valid: true,
    expired: isExpired,
  }
}

/**
 * Dev-only: set `VITE_DEV_FORCE_AUTH=true` in `.env` / `.env.local` and restart Vite.
 * Skips token checks so you can open /dashboard without login (UI testing).
 */
export function isDevForceAuthEnabled() {
  if (!import.meta.env.DEV) return false
  const v = (import.meta.env.VITE_DEV_FORCE_AUTH ?? '').toString().trim().toLowerCase()
  return v === 'true' || v === '1' || v === 'yes'
}

const devForceAuth = isDevForceAuthEnabled()

const getInitialAuth = () => {
  if (typeof window === 'undefined') {
    return { isAuthenticated: false, email: null }
  }

  if (devForceAuth) {
    return { isAuthenticated: true, email: 'dev@local.test' }
  }

  const token = localStorage.getItem(TOKEN_KEY)
  const email = localStorage.getItem(EMAIL_KEY)

  if (!token || !email) {
    return { isAuthenticated: false, email: null }
  }

  const validation = validateJWT(token)

  if (!validation.valid || validation.expired) {
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(EMAIL_KEY)
    localStorage.removeItem(CURRENT_ORG_KEY)
    return { isAuthenticated: false, email: null }
  }

  return { isAuthenticated: true, email }
}

const initialAuthState = getInitialAuth()

const initialState = {
  isAuthenticated: initialAuthState.isAuthenticated,
  email: initialAuthState.email,
  isReady: true,
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    login(state, action) {
      const token = action.payload?.token
      const email = action.payload?.email
      if (!token || !email) return

      localStorage.setItem(TOKEN_KEY, token)
      localStorage.setItem(EMAIL_KEY, email)

      state.isAuthenticated = true
      state.email = email
    },

    logout(state) {
      localStorage.removeItem(TOKEN_KEY)
      localStorage.removeItem(EMAIL_KEY)
      localStorage.removeItem(CURRENT_ORG_KEY)

      state.isAuthenticated = false
      state.email = null
    },

    /** Re-read token from localStorage (e.g. after X-Renewed-Token) and refresh Redux. */
    syncAuthFromStorage(state) {
      if (isDevForceAuthEnabled()) {
        return
      }

      const token = localStorage.getItem(TOKEN_KEY)
      const email = localStorage.getItem(EMAIL_KEY)

      if (!token || !email) {
        state.isAuthenticated = false
        state.email = null
        return
      }

      const validation = validateJWT(token)

      if (!validation.valid || validation.expired) {
        localStorage.removeItem(TOKEN_KEY)
        localStorage.removeItem(EMAIL_KEY)
        localStorage.removeItem(CURRENT_ORG_KEY)
        state.isAuthenticated = false
        state.email = null
        return
      }

      state.isAuthenticated = true
      state.email = email
    },
  },
})

export const { login, logout, syncAuthFromStorage } = authSlice.actions
export default authSlice.reducer
