import { configureStore } from '@reduxjs/toolkit'
import authReducer from './slices/authSlice'
import { AUTH_KEY } from './slices/authSlice'

const authPersistMiddleware = (store) => (next) => (action) => {
  const result = next(action)
  if (action.type === 'auth/login') {
    localStorage.setItem(AUTH_KEY, 'true')
  }
  if (action.type === 'auth/logout') {
    localStorage.removeItem(AUTH_KEY)
  }
  return result
}

export const store = configureStore({
  reducer: {
    auth: authReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(authPersistMiddleware),
})
