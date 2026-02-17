
import { createSlice } from '@reduxjs/toolkit'

// LocalStorage keys
const TOKEN_KEY = 'gallery_token'
const EMAIL_KEY = 'gallery_email'
const EXPIRY_KEY = 'gallery_token_expiry'

// Token expiration time: 2 minutes (for testing)
const TOKEN_EXPIRY_MS = 2 * 60 * 1000 // 2 minutes in milliseconds


//Craeted JWT token without signature
const createJWT = (email) => {
  const header = {
    alg: 'none', // No signature algorithm 
    typ: 'JWT'
  }

  const now = Date.now() // now time in ms
  const expiryTime = now + TOKEN_EXPIRY_MS 

  const payload = {
    email: email,
    iat: Math.floor(now / 1000), // Issued at (in seconds)
    exp: Math.floor(expiryTime / 1000) // Expiry (in seconds)
  }

  // Base64 encode (URL safe)
  const base64Header = btoa(JSON.stringify(header))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '')

  const base64Payload = btoa(JSON.stringify(payload))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '')

  // JWT without signature: header.payload.
  return `${base64Header}.${base64Payload}.`
}


// Validate JWT token
// Returns: { valid: boolean, email: string | null, expired: boolean }

const validateJWT = (token) => {
  try {
    if (!token || typeof token !== 'string') {
      return { valid: false, email: null, expired: false }
    }

    const parts = token.split('.')
    if (parts.length !== 3) {
      return { valid: false, email: null, expired: false }
    }

    // Decode payload
    let base64Payload = parts[1]
    // Add padding if needed
    base64Payload = base64Payload.replace(/-/g, '+').replace(/_/g, '/')
    while (base64Payload.length % 4) {
      base64Payload += '='
    }

    const payload = JSON.parse(atob(base64Payload))

    // Check if token is expired
    const now = Math.floor(Date.now() / 1000)
    const isExpired = payload.exp < now

    return {
      valid: true,
      email: payload.email || null,
      expired: isExpired
    }
  } catch (error) {
    console.error('JWT validation error:', error)
    return { valid: false, email: null, expired: false }
  }
}


// Check if user has valid authentication

const getInitialAuth = () => {
  if (typeof window === 'undefined') {
    return { isAuthenticated: false, email: null }
  }

  const token = localStorage.getItem(TOKEN_KEY)
  const email = localStorage.getItem(EMAIL_KEY)

  if (!token || !email) {
    return { isAuthenticated: false, email: null }
  }

  const validation = validateJWT(token)

  // If token is invalid or expired, clear everything
  if (!validation.valid || validation.expired) {
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(EMAIL_KEY)
    localStorage.removeItem(EXPIRY_KEY)
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
      const email = action.payload?.email || 'user@example.com'
      
      // Create JWT token
      const token = createJWT(email)
      const expiryTime = Date.now() + TOKEN_EXPIRY_MS 

      // Store in localStorage
      localStorage.setItem(TOKEN_KEY, token)
      localStorage.setItem(EMAIL_KEY, email)
      localStorage.setItem(EXPIRY_KEY, expiryTime.toString())

      // Update state
      state.isAuthenticated = true
      state.email = email

      console.log('✅ Login successful')
      console.log('📧 Email:', email)
      console.log('🎫 Token:', token)
      console.log('⏰ Expires in: 2 minutes')
    },

    logout(state) {
      // Clear localStorage
      localStorage.removeItem(TOKEN_KEY)
      localStorage.removeItem(EMAIL_KEY)
      localStorage.removeItem(EXPIRY_KEY)

      // Update state
      state.isAuthenticated = false
      state.email = null

      console.log('👋 Logout successful - Token removed')
    },

    checkTokenExpiry(state) {
      const token = localStorage.getItem(TOKEN_KEY)
      const expiryTime = localStorage.getItem(EXPIRY_KEY)

      if (!token || !expiryTime) {
        state.isAuthenticated = false
        state.email = null
        return
      }

      const now = Date.now()
      const expiry = parseInt(expiryTime, 10)

      if (now >= expiry) {
        // Token expired - auto logout
        localStorage.removeItem(TOKEN_KEY)
        localStorage.removeItem(EMAIL_KEY)
        localStorage.removeItem(EXPIRY_KEY)

        state.isAuthenticated = false
        state.email = null

        console.log('⏰ Token expired - Auto logout')
      }
    }
  },
})

export const { login, logout, checkTokenExpiry } = authSlice.actions
export default authSlice.reducer

export { TOKEN_KEY, EMAIL_KEY, EXPIRY_KEY, validateJWT }