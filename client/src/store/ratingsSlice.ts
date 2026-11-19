import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type { Rating } from '../api'
import { loggedIn, logout } from './authSlice'

type RatingsState = Record<number, number>

const initialState: RatingsState = {}

const ratingsSlice = createSlice({
  name: 'ratings',
  initialState,
  reducers: {
    setRating(state, action: PayloadAction<{ filmId: number; value: number }>) {
      const { filmId, value } = action.payload
      if (value === 0) {
        delete state[filmId]
      } else {
        state[filmId] = value
      }
    },
    setRatings(_state, action: PayloadAction<Rating[]>) {
      const next: RatingsState = {}
      for (const item of action.payload) {
        next[item.movieId] = item.value
      }
      return next
    },
  },
  extraReducers: (builder) => {
    builder.addCase(logout, () => ({})).addCase(loggedIn, () => ({}))
  },
})

export const { setRating, setRatings } = ratingsSlice.actions
export default ratingsSlice.reducer
