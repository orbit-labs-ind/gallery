

import { configureStore } from '@reduxjs/toolkit'
import authReducer from './slices/authSlice'
import currentUserReducer from './slices/currentUserSlice'

export const store = configureStore({
  reducer: {
    auth: authReducer,
    currentUser: currentUserReducer,
  },
})