import { describe, expect, it } from 'vitest'
import reducer, { setRating, setRatings } from './ratingsSlice'

describe('ratingsSlice', () => {
  it('saves a rating', () => {
    const state = reducer({}, setRating({ filmId: 1, value: 8 }))
    expect(state).toEqual({ 1: 8 })
  })

  it('removes a rating when value is 0', () => {
    const state = reducer({ 1: 8 }, setRating({ filmId: 1, value: 0 }))
    expect(state).toEqual({})
  })

  it('loads ratings from server', () => {
    const state = reducer({}, setRatings([{ movieId: 2, value: 9, review: null }]))
    expect(state).toEqual({ 2: 9 })
  })
})
