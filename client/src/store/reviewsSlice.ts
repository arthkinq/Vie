import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import { loggedIn, logout } from './authSlice'
import { setRating, setRatings } from './ratingsSlice'

type ReviewsState = Record<number, string>

const initialState: ReviewsState = {}

const reviewsSlice = createSlice({
  name: 'reviews',
  initialState,
  reducers: {
    setReview(
      state,
      action: PayloadAction<{
        filmId: number
        review: string | null
      }>,
    ) {
      const { filmId, review } = action.payload

      if (review) {
        state[filmId] = review
      } else {
        delete state[filmId]
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(setRatings, (_state, action) => {
        const next: ReviewsState = {}

        for (const item of action.payload) {
          if (item.review) {
            next[item.movieId] = item.review
          }
        }

        return next
      })
      .addCase(setRating, (state, action) => {
        if (action.payload.value === 0) {
          delete state[action.payload.filmId]
        }
      })
      .addCase(logout, () => ({}))
      .addCase(loggedIn, () => ({}))
  },
})

export const { setReview } = reviewsSlice.actions
export default reviewsSlice.reducer
