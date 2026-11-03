import { createSlice, type PayloadAction } from '@reduxjs/toolkit'

export type AuthState = {
  token: string | null
  username: string | null
}

function getInitialToken(): string | null {
  try {
    return localStorage.getItem('token') || sessionStorage.getItem('token')
  } catch {
    return null
  }
}

function getInitialUsername(): string | null {
  try {
    return localStorage.getItem('username') || sessionStorage.getItem('username')
  } catch {
    return null
  }
}

const initialState: AuthState = {
  token: getInitialToken(),
  username: getInitialUsername(),
}

export interface LoggedInPayload {
  token: string
  username: string
  remember?: boolean
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loggedIn(state, action: PayloadAction<LoggedInPayload>) {
      const { token, username, remember } = action.payload
      state.token = token
      state.username = username

      try {
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
      } catch {
        // Storage might be disabled or unavailable
      }
    },
    logout(state) {
      state.token = null
      state.username = null

      try {
        localStorage.removeItem('token')
        localStorage.removeItem('username')
        sessionStorage.removeItem('token')
        sessionStorage.removeItem('username')
      } catch {
        // Storage might be disabled or unavailable
      }
    },
  },
})

export const { loggedIn, logout } = authSlice.actions
export default authSlice.reducer
