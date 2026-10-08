import { createSlice, type PayloadAction } from '@reduxjs/toolkit'

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
  },
})

export const { setRating } = ratingsSlice.actions
export default ratingsSlice.reducer
