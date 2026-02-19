import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { apiFetch, API_BASE } from '../../api/client'

export const TOKEN_KEY = 'gallery_token'
export const EMAIL_KEY = 'gallery_email'
export const LAST_ACTIVITY_KEY = 'gallery_last_activity'

export const INACTIVITY_MS = 24 * 60 * 60 * 1000 // 1 day

function getStoredLastActivity() {
  if (typeof window === 'undefined') return null
  const s = localStorage.getItem(LAST_ACTIVITY_KEY)
  return s ? parseInt(s, 10) : null
}

function isInactiveTooLong() {
  const last = getStoredLastActivity()
  if (last == null) return true
  return Date.now() - last > INACTIVITY_MS
}

const getInitialAuth = () => {
  if (typeof window === 'undefined') {
    return { isAuthenticated: false, email: null }
  }
  const token = localStorage.getItem(TOKEN_KEY)
  const email = localStorage.getItem(EMAIL_KEY)
  if (!token || !email) return { isAuthenticated: false, email: null }
  if (isInactiveTooLong()) {
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(EMAIL_KEY)
    localStorage.removeItem(LAST_ACTIVITY_KEY)
    return { isAuthenticated: false, email: null }
  }
  return { isAuthenticated: true, email }
}

const initial = getInitialAuth()
const initialState = {
  isAuthenticated: initial.isAuthenticated,
  email: initial.email,
  isReady: true,
  loginLoading: false,
  loginError: null,
}

export const loginUser = createAsyncThunk(
  'auth/login',
  async ({ email, password }, { rejectWithValue }) => {
    const res = await fetch(`${API_BASE}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })
    const data = await res.json().catch(() => ({}))
    if (!res.ok) return rejectWithValue(data.error || 'Login failed')
    return data
  }
)

export const registerUser = createAsyncThunk(
  'auth/register',
  async ({ email, password }, { rejectWithValue }) => {
    const res = await fetch(`${API_BASE}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })
    const data = await res.json().catch(() => ({}))
    if (!res.ok) return rejectWithValue(data.error || 'Registration failed')
    return data
  }
)

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setAuth(state, action) {
      const { token, user } = action.payload
      if (typeof window !== 'undefined') {
        localStorage.setItem(TOKEN_KEY, token)
        localStorage.setItem(EMAIL_KEY, user?.email || '')
        localStorage.setItem(LAST_ACTIVITY_KEY, String(Date.now()))
      }
      state.isAuthenticated = true
      state.email = user?.email || null
      state.loginError = null
    },
    logout(state) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem(TOKEN_KEY)
        localStorage.removeItem(EMAIL_KEY)
        localStorage.removeItem(LAST_ACTIVITY_KEY)
      }
      state.isAuthenticated = false
      state.email = null
      state.loginError = null
    },
    updateLastActivity(state) {
      if (typeof window !== 'undefined') {
        localStorage.setItem(LAST_ACTIVITY_KEY, String(Date.now()))
      }
    },
    checkInactivity(state) {
      if (typeof window === 'undefined') return
      const token = localStorage.getItem(TOKEN_KEY)
      if (!token) return
      if (isInactiveTooLong()) {
        localStorage.removeItem(TOKEN_KEY)
        localStorage.removeItem(EMAIL_KEY)
        localStorage.removeItem(LAST_ACTIVITY_KEY)
        state.isAuthenticated = false
        state.email = null
      }
    },
    clearLoginError(state) {
      state.loginError = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => {
        state.loginLoading = true
        state.loginError = null
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loginLoading = false
        state.loginError = null
        const { token, user } = action.payload
        if (typeof window !== 'undefined') {
          localStorage.setItem(TOKEN_KEY, token)
          localStorage.setItem(EMAIL_KEY, user?.email || '')
          localStorage.setItem(LAST_ACTIVITY_KEY, String(Date.now()))
        }
        state.isAuthenticated = true
        state.email = user?.email || null
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loginLoading = false
        state.loginError = action.payload || 'Login failed'
      })
      .addCase(registerUser.pending, (state) => {
        state.loginLoading = true
        state.loginError = null
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.loginLoading = false
        state.loginError = null
        const { token, user } = action.payload
        if (typeof window !== 'undefined') {
          localStorage.setItem(TOKEN_KEY, token)
          localStorage.setItem(EMAIL_KEY, user?.email || '')
          localStorage.setItem(LAST_ACTIVITY_KEY, String(Date.now()))
        }
        state.isAuthenticated = true
        state.email = user?.email || null
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loginLoading = false
        state.loginError = action.payload || 'Registration failed'
      })
  },
})

export const { logout, updateLastActivity, checkInactivity, clearLoginError } = authSlice.actions
export default authSlice.reducer
