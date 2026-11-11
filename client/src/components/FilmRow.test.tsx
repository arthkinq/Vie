import { render, screen, cleanup } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { describe, it, expect, afterEach } from 'vitest'
import FilmRow from './FilmRow'
import type { Movie } from '../api'

const createMockMovie = (id: number): Movie =>
  ({
    id,
    title: `Фильм ${id}`,
    poster: `poster-${id}.jpg`,
    year: 2024,
    rating: 8.5,
    genres: ['триллер'],
  }) as unknown as Movie

describe('FilmRow Component', () => {
  afterEach(() => {
    cleanup()
  })

  it('не рендерит ряд, если список фильмов пустой', () => {
    const { container } = render(
      <MemoryRouter>
        <FilmRow title="Пустой ряд" movies={[]} />
      </MemoryRouter>,
    )
    expect(container.firstChild).toBeNull()
  })

  it('не рендерит ряд, если фильмов меньше 5, кроме популярного', () => {
    const movies = [1, 2, 3, 4].map(createMockMovie)
    const { container } = render(
      <MemoryRouter>
        <FilmRow title="Мало фильмов" movies={movies} />
      </MemoryRouter>,
    )
    expect(container.firstChild).toBeNull()
  })

  it('не рендерит ряд, если movies передан как undefined', () => {
    const { container } = render(
      <MemoryRouter>
        <FilmRow title="Без фильмов" movies={undefined} />
      </MemoryRouter>,
    )
    expect(container.firstChild).toBeNull()
  })

  it('рендерит заголовок и карточки, если фильмов 5 или больше', () => {
    const movies = [1, 2, 3, 4, 5].map(createMockMovie)
    const { container } = render(
      <MemoryRouter>
        <FilmRow title="ПОПУЛЯРНОЕ" movies={movies} />
      </MemoryRouter>,
    )

    const titleEl = container.querySelector('.film-row-title')
    expect(titleEl).toHaveTextContent('ПОПУЛЯРНОЕ')
    expect(screen.getByText('Фильм 1')).toBeInTheDocument()
    expect(screen.getByText('Фильм 5')).toBeInTheDocument()
  })

  it('рендерит ряд, если передан кастомный minCount (для популярного)', () => {
    const movies = [1, 2].map(createMockMovie)
    const { container } = render(
      <MemoryRouter>
        <FilmRow title="ТОП РЕЙТИНГ" movies={movies} minCount={1} />
      </MemoryRouter>,
    )

    const titleEl = container.querySelector('.film-row-title')
    expect(titleEl).toHaveTextContent('ТОП РЕЙТИНГ')
    expect(screen.getByText('Фильм 1')).toBeInTheDocument()
  })
})
