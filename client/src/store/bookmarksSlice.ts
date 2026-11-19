import { createSlice, type PayloadAction } from '@reduxjs/toolkit'

export type BookmarksStorage = {
  bookmarks: number[]
}
const initialState: BookmarksStorage = {
  bookmarks: parseBookmarks(),
}

export function parseBookmarks(): number[] {
  try {
    const bkms = localStorage.getItem('bookmarks')
    return bkms ? JSON.parse(bkms) : []
  } catch {
    return []
  }
}
const bookmarksSlice = createSlice({
  name: 'bookmarks',
  initialState,
  reducers: {
    changeBookmark(state, action: PayloadAction<number>) {
      const movieId = action.payload
      const bookmarkIndex = state.bookmarks.indexOf(movieId)
      if (bookmarkIndex != -1) {
        state.bookmarks.splice(bookmarkIndex, 1)
      } else {
        state.bookmarks.push(movieId)
      }
      localStorage.setItem('bookmarks', JSON.stringify(state.bookmarks))
    },
    setBookmarks(state, action: PayloadAction<number[]>) {
      state.bookmarks = action.payload
      localStorage.setItem('bookmarks', JSON.stringify(state.bookmarks))
    },
  },
})

export const { changeBookmark, setBookmarks } = bookmarksSlice.actions
export default bookmarksSlice.reducer
