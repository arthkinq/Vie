import { createSlice, type PayloadAction } from '@reduxjs/toolkit'

export type AuthState = {
  token: string | null
  username: string | null
}

export type LoggedInPayload = {
  token: string
  username: string
  remember?: boolean
}

const initialState: AuthState = {
  token: localStorage.getItem('token') || sessionStorage.getItem('token'),
  username: localStorage.getItem('username') || sessionStorage.getItem('username'),
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loggedIn(state, action: PayloadAction<LoggedInPayload>) {
      const { token, username, remember } = action.payload
      state.token = token
      state.username = username

      if (remember) {
        localStorage.setItem('token', token)
        localStorage.setItem('username', username)
        sessionStorage.removeItem('token')
        sessionStorage.removeItem('username')
      } else {
        sessionStorage.setItem('token', token)
        sessionStorage.setItem('username', username)
        localStorage.removeItem('token')
        localStorage.removeItem('username')
      }
    },
    logout(state) {
      state.token = null
      state.username = null

      localStorage.removeItem('token')
      localStorage.removeItem('username')
      sessionStorage.removeItem('token')
      sessionStorage.removeItem('username')
    },
  },
})

export const { loggedIn, logout } = authSlice.actions
export default authSlice.reducer
