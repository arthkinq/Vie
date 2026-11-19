import { describe, expect, it } from 'vitest'
import { loggedIn, logout } from './authSlice'
import ratingsReducer, { setRating, setRatings } from './ratingsSlice'
import reviewsReducer, { setReview } from './reviewsSlice'

describe('reviewsSlice', () => {
  it('saves movie review', () => {
    const state = reviewsReducer(
      {},
      setReview({
        filmId: 5,
        review: 'Отличный фильм!',
      }),
    )

    expect(state[5]).toBe('Отличный фильм!')
  })

  it('loads reviews from server data', () => {
    const state = reviewsReducer(
      {},
      setRatings([
        {
          movieId: 5,
          value: 9,
          review: 'Отличный фильм!',
        },
        {
          movieId: 13,
          value: 8,
          review: null,
        },
      ]),
    )

    expect(state[5]).toBe('Отличный фильм!')
    expect(state[13]).toBeUndefined()
  })

  it('preserves review when rating changes', () => {
    const state = reviewsReducer({ 5: 'Отличный фильм!' }, setRating({ filmId: 5, value: 10 }))

    expect(state[5]).toBe('Отличный фильм!')
  })

  it('removes review when rating is deleted', () => {
    const state = reviewsReducer({ 5: 'Отличный фильм!' }, setRating({ filmId: 5, value: 0 }))

    expect(state[5]).toBeUndefined()
  })

  it('clears ratings and reviews on logout', () => {
    expect(reviewsReducer({ 5: 'Отличный фильм!' }, logout())).toEqual({})
    expect(ratingsReducer({ 5: 9 }, logout())).toEqual({})
  })

  it('clears previous user data on login', () => {
    const action = loggedIn({
      token: 'new-token',
      username: 'new-user',
    })

    expect(reviewsReducer({ 5: 'Отличный фильм!' }, action)).toEqual({})
    expect(ratingsReducer({ 5: 9 }, action)).toEqual({})
  })
})
