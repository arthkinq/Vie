import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { getMovies, type Movie } from '../api'

type MoviesState = {
  items: Movie[]
  status: 'idle' | 'loading' | 'succeeded' | 'failed'
}

const initialState: MoviesState = {
  items: [],
  status: 'idle',
}

export const fetchMovies = createAsyncThunk('movies/fetch', getMovies)

const moviesSlice = createSlice({
  name: 'movies',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchMovies.pending, (state) => {
        state.status = 'loading'
      })
      .addCase(fetchMovies.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.items = action.payload
      })
      .addCase(fetchMovies.rejected, (state) => {
        state.status = 'failed'
      })
  },
})

export default moviesSlice.reducer
