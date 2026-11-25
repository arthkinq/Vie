import { combineReducers, configureStore } from '@reduxjs/toolkit'
import { useDispatch, useSelector, useStore } from 'react-redux'
import auth from './authSlice'
import movies from './moviesSlice'
import ratings from './ratingsSlice'
import reviews from './reviewsSlice'

const reducer = combineReducers({ movies, ratings, auth, reviews })

export function setupStore(preloadedState?: Partial<RootState>) {
  return configureStore({ reducer, preloadedState })
}

export const store = setupStore()

export type RootState = ReturnType<typeof reducer>
export type AppDispatch = typeof store.dispatch

export const useAppDispatch = useDispatch.withTypes<AppDispatch>()
export const useAppSelector = useSelector.withTypes<RootState>()
export const useAppStore = useStore.withTypes<typeof store>()
