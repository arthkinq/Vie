import { afterEach, describe, expect, it, vi } from 'vitest'
import type { Movie } from '../api'
import { recommendMovies } from './recommend'
import '../recommend.worker'

const movies: Movie[] = [
  {
    id: 1,
    title: 'Интерстеллар',
    year: 2014,
    genres: ['фантастика', 'драма'],
    countries: ['США'],
    director: 'Кристофер Нолан',
    rating: 8.6,
    description: 'Космос.',
  },
  {
    id: 2,
    title: 'Начало',
    year: 2010,
    genres: ['фантастика', 'триллер'],
    countries: ['США'],
    director: 'Кристофер Нолан',
    rating: 8.7,
    description: 'Сны.',
  },
  {
    id: 3,
    title: 'Римские каникулы',
    year: 1953,
    genres: ['мелодрама', 'комедия'],
    countries: ['Италия'],
    director: 'Уильям Уайлер',
    rating: 8.3,
    description: 'Рим.',
  },
]

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('recommendMovies', () => {
  it('ranks a movie of the same genre and director higher', () => {
    expect(recommendMovies(movies, { 1: 10 })).toEqual([2, 3])
  })

  it('returns an empty list when there are no ratings', () => {
    expect(recommendMovies(movies, {})).toEqual([])
  })

  it('sends recommended ids from worker onmessage', () => {
    const postMessage = vi.fn()
    vi.stubGlobal('postMessage', postMessage)
    self.onmessage?.(new MessageEvent('message', { data: { movies, ratings: { 1: 10 } } }))
    expect(postMessage).toHaveBeenCalledWith([2, 3])
  })
})
