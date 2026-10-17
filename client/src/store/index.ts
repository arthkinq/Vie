import { combineReducers, configureStore } from '@reduxjs/toolkit'
import { useDispatch, useSelector } from 'react-redux'
import movies from './moviesSlice'
import ratings from './ratingsSlice'

const reducer = combineReducers({ movies, ratings })

export function setupStore(preloadedState?: Partial<RootState>) {
  return configureStore({ reducer, preloadedState })
}

export const store = setupStore()

export type RootState = ReturnType<typeof reducer>
export type AppDispatch = typeof store.dispatch

export const useAppDispatch = useDispatch.withTypes<AppDispatch>()
export const useAppSelector = useSelector.withTypes<RootState>()
