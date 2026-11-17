import { render, screen, fireEvent, cleanup } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { describe, it, expect, afterEach } from 'vitest'
import FilmCard from './FilmCard'
import type { Movie } from '../api'

const mockMovie: Movie = {
  id: 1,
  title: 'Великий Гэтсби',
  year: 2013,
  genres: ['драма', 'мелодрама'],
  countries: ['Австралия', 'США'],
  director: 'Баз Лурман',
  rating: 7.2,
  description: 'Описание фильма...',
  poster: 'the-great-gatsby.jpg',
}

describe('FilmCard component', () => {
  afterEach(() => {
    cleanup()
  })

  it('renders title, year and rating correctly', () => {
    const { container } = render(
      <MemoryRouter>
        <FilmCard movie={mockMovie} />
      </MemoryRouter>,
    )

    const titleEl = container.querySelector('.film-card-title')
    const yearEl = container.querySelector('.film-card-year')
    const ratingEl = container.querySelector('.film-card-rating')

    expect(titleEl).toHaveTextContent('Великий Гэтсби')
    expect(yearEl).toHaveTextContent('2013')
    expect(ratingEl).toHaveTextContent('7.2/10')
  })

  it('links to /film/:id', () => {
    render(
      <MemoryRouter>
        <FilmCard movie={mockMovie} />
      </MemoryRouter>,
    )

    const linkElement = screen.getByRole('link')
    expect(linkElement).toHaveAttribute('href', '/film/1')
  })

  it('shows poster image when poster prop is provided', () => {
    const { container } = render(
      <MemoryRouter>
        <FilmCard movie={mockMovie} />
      </MemoryRouter>,
    )

    const image = container.querySelector('img.film-card-poster')
    expect(image).toBeInTheDocument()
    expect(image?.getAttribute('src')).toContain('/api/posters/the-great-gatsby.jpg')
    expect(image).toHaveAttribute('alt', 'Великий Гэтсби')
  })

  it('shows placeholder when poster is missing', () => {
    const movieWithoutPoster: Movie = {
      ...mockMovie,
      poster: '',
    }

    const { container } = render(
      <MemoryRouter>
        <FilmCard movie={movieWithoutPoster} />
      </MemoryRouter>,
    )

    expect(container.querySelector('.film-card-placeholder')).toBeInTheDocument()
    expect(container.querySelector('img.film-card-poster')).not.toBeInTheDocument()
  })

  it('switches to placeholder when poster fails to load', () => {
    const { container } = render(
      <MemoryRouter>
        <FilmCard movie={mockMovie} />
      </MemoryRouter>,
    )

    const img = container.querySelector('img.film-card-poster')
    expect(img).toBeInTheDocument()

    if (img) {
      fireEvent.error(img)
    }

    expect(container.querySelector('.film-card-placeholder')).toBeInTheDocument()
  })

  it('renders fallback dash when rating is missing', () => {
    const movieWithoutRating: Movie = {
      ...mockMovie,
      rating: undefined as unknown as number,
    }

    const { container } = render(
      <MemoryRouter>
        <FilmCard movie={movieWithoutRating} />
      </MemoryRouter>,
    )

    const ratingEl = container.querySelector('.film-card-rating')
    expect(ratingEl).toHaveTextContent('—')
  })

  it('applies always-lit modifier class when alwaysLit prop is true', () => {
    render(
      <MemoryRouter>
        <FilmCard movie={mockMovie} alwaysLit={true} />
      </MemoryRouter>,
    )

    const linkElement = screen.getByRole('link')
    expect(linkElement).toHaveClass('film-card-always-lit')
  })
})
