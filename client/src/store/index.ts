import { configureStore } from '@reduxjs/toolkit'
import ratings from './ratingsSlice'

export const store = configureStore({
  reducer: { ratings },
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
