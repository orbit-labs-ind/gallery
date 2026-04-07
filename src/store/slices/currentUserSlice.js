import { createSlice } from '@reduxjs/toolkit'
import { logout } from './authSlice'

const initialState = {
  profile: null,
}

const currentUserSlice = createSlice({
  name: 'currentUser',
  initialState,
  reducers: {
    setProfile(state, action) {
      state.profile = action.payload || null
    },
  },
  extraReducers: (builder) => {
    builder.addCase(logout, (state) => {
      state.profile = null
    })
  },
})

export const { setProfile } = currentUserSlice.actions
export default currentUserSlice.reducer
