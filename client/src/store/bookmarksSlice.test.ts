import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import bookmarksReducer, { changeBookmark, parseBookmarks, setBookmarks } from './bookmarksSlice'

describe('bookmarksSlice', () => {
  beforeEach(() => {
    localStorage.clear()
  })
  afterEach(() => {
    localStorage.clear()
  })
  it('adds movie to bookmarks if not present', () => {
    const initialState = { bookmarks: [] }
    const state = bookmarksReducer(initialState, changeBookmark(37))
    expect(state.bookmarks).toEqual([37])
    expect(localStorage.getItem('bookmarks')).toBe(JSON.stringify([37]))
  })
  it('delete  movie to bookmarks if present', () => {
    const initialState = { bookmarks: [37, 1] }
    const state = bookmarksReducer(initialState, changeBookmark(37))
    expect(state.bookmarks).toEqual([1])
    expect(localStorage.getItem('bookmarks')).toBe(JSON.stringify([1]))
  })
  it('sets bookmarks from server array', () => {
    const initialState = { bookmarks: [] }
    const state = bookmarksReducer(initialState, setBookmarks([1, 2, 3]))
    expect(state.bookmarks).toEqual([1, 2, 3])
    expect(localStorage.getItem('bookmarks')).toBe(JSON.stringify([1, 2, 3]))
  })
  describe('parseBookmarks', () => {
    it('returns empty array when localStorage is empty', () => {
      expect(parseBookmarks()).toEqual([])
    })

    it('parses valid bookmarks from localStorage', () => {
      localStorage.setItem('bookmarks', JSON.stringify([1, 2, 3]))
      expect(parseBookmarks()).toEqual([1, 2, 3])
    })
    it('returns empty array on corrupted JSON in localStorage (covers catch branch)', () => {
      localStorage.setItem('bookmarks', 'dadklacnksnmvlkzo;iskv')
      expect(parseBookmarks()).toEqual([])
    })
  })
})
