import { createSlice } from '@reduxjs/toolkit'

// LocalStorage keys
export const TOKEN_KEY = 'gallery_token'
export const EMAIL_KEY = 'gallery_email'

// Token expiration time: 2 minutes (for testing)
const TOKEN_EXPIRY_MS = 60 * 60 * 1000 // 2 minutes in milliseconds


// Create JWT token without signature
// Expiry is embedded inside the JWT payload (exp field) — no separate key needed
const createJWT = (email) => {
  const header = {
    alg: 'none', //  No signature — client-side only, never validate on a real server
    typ: 'JWT'
  }

  const now = Date.now()
  const expiryTime = now + TOKEN_EXPIRY_MS

  const payload = {
    email: email,
    iat: Math.floor(now / 1000),        // Issued at (in seconds)
    exp: Math.floor(expiryTime / 1000)  //Expiry stored inside JWT payload
  }

  const base64Header = btoa(unescape(encodeURIComponent(JSON.stringify(header))))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '')

  const base64Payload = btoa(unescape(encodeURIComponent(JSON.stringify(payload))))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '')

  return `${base64Header}.${base64Payload}.`
}


// Validate JWT token
// Returns: { valid: boolean, email: string | null, expired: boolean }
export const validateJWT = (token) => {
  try {
    if (!token || typeof token !== 'string') {
      return { valid: false, email: null, expired: false }
    }

    const parts = token.split('.')
    if (parts.length !== 3) {
      return { valid: false, email: null, expired: false }
    }

    let base64Payload = parts[1]
    base64Payload = base64Payload.replace(/-/g, '+').replace(/_/g, '/')
    while (base64Payload.length % 4) {
      base64Payload += '='
    }

    const payload = JSON.parse(atob(base64Payload))

    const now = Math.floor(Date.now() / 1000)
    const isExpired = payload.exp < now

    return {
      valid: true,
      email: payload.email || null,
      expired: isExpired
    }
  } catch (error) {
    return { valid: false, email: null, expired: false }
  }
}


// Check if user has valid authentication on app load
const getInitialAuth = () => {
  if (typeof window === 'undefined') {
    return { isAuthenticated: false, email: null }
  }

  // Clean up legacy key left from older versions
  localStorage.removeItem('gallery_token_expiry')

  const token = localStorage.getItem(TOKEN_KEY)
  const email = localStorage.getItem(EMAIL_KEY)

  if (!token || !email) {
    return { isAuthenticated: false, email: null }
  }

  const validation = validateJWT(token)

  if (!validation.valid || validation.expired) {
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(EMAIL_KEY)
    return { isAuthenticated: false, email: null }
  }

  return { isAuthenticated: true, email: validation.email }
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
      const email = action.payload?.email || 'abc@example.com'

      const token = createJWT(email)

      localStorage.setItem(TOKEN_KEY, token)
      localStorage.setItem(EMAIL_KEY, email)

      state.isAuthenticated = true
      state.email = email
    },

    logout(state) {
      localStorage.removeItem(TOKEN_KEY)
      localStorage.removeItem(EMAIL_KEY)
      localStorage.removeItem('gallery_token_expiry') //clean up legacy key

      state.isAuthenticated = false
      state.email = null
    },

    // Called on user activity — resets expiry by issuing a fresh JWT
    resetExpiry(state) {
      const token = localStorage.getItem(TOKEN_KEY)
      const email = localStorage.getItem(EMAIL_KEY)

      if (!token || !email) return

      const validation = validateJWT(token)

      // Only reset if token is still valid (not already expired)
      if (!validation.valid || validation.expired) return

      const newToken = createJWT(email)
      localStorage.setItem(TOKEN_KEY, newToken)
    },

    checkTokenExpiry(state) {
      const token = localStorage.getItem(TOKEN_KEY)

      if (!token) {
        state.isAuthenticated = false
        state.email = null
        return
      }

      const validation = validateJWT(token)

      if (!validation.valid || validation.expired) {
        localStorage.removeItem(TOKEN_KEY)
        localStorage.removeItem(EMAIL_KEY)
        localStorage.removeItem('gallery_token_expiry') //token expiry

        state.isAuthenticated = false
        state.email = null
      }
    }
  },
})

export const { login, logout, checkTokenExpiry, resetExpiry } = authSlice.actions
export default authSlice.reducer