import { createSlice } from '@reduxjs/toolkit'

const AUTH_KEY = 'gallery_authenticated'

const getInitialAuth = () => {
  if (typeof window === 'undefined') return false
  return localStorage.getItem(AUTH_KEY) === 'true'
}

const initialState = {
  isAuthenticated: getInitialAuth(),
  isReady: true,
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    login(state) {
      state.isAuthenticated = true
    },
    logout(state) {
      state.isAuthenticated = false
    },
  },
})

export const { login, logout } = authSlice.actions
export default authSlice.reducer

export { AUTH_KEY }
