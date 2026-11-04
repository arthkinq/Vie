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

  // карточка показывает название, год и рейтинг
  it('renders title, year and rating correctly', () => {
    const { container } = render(
      <MemoryRouter>
        <FilmCard movie={mockMovie} />
      </MemoryRouter>,
    )

    const titleEl = container.querySelector('.film-card__title')
    const yearEl = container.querySelector('.film-card__year')
    const ratingEl = container.querySelector('.film-card__rating')

    expect(titleEl).toHaveTextContent('Великий Гэтсби')
    expect(yearEl).toHaveTextContent('2013')
    expect(ratingEl).toHaveTextContent('7.2')
  })

  //ссылка ведет на /film/:id
  it('links to /film/:id', () => {
    render(
      <MemoryRouter>
        <FilmCard movie={mockMovie} />
      </MemoryRouter>,
    )

    const linkElement = screen.getByRole('link')
    expect(linkElement).toHaveAttribute('href', '/film/1')
  })

  //отображение постера
  it('shows poster image when poster prop is provided', () => {
    const { container } = render(
      <MemoryRouter>
        <FilmCard movie={mockMovie} />
      </MemoryRouter>,
    )

    const image = container.querySelector('img.film-card__poster')
    expect(image).toBeInTheDocument()
    expect(image).toHaveAttribute('src', 'the-great-gatsby.jpg')
    expect(image).toHaveAttribute('alt', 'Великий Гэтсби')
  })

  //заглушка, если постера нет
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

    expect(screen.getByText('NO POSTER YET')).toBeInTheDocument()
    expect(container.querySelector('img.film-card__poster')).not.toBeInTheDocument()
  })

  //переход на заглушку при ошибке загрузки картинки
  it('switches to placeholder when poster fails to load', () => {
    const { container } = render(
      <MemoryRouter>
        <FilmCard movie={mockMovie} />
      </MemoryRouter>,
    )

    const img = container.querySelector('img.film-card__poster')
    expect(img).toBeInTheDocument()

    if (img) {
      fireEvent.error(img)
    }

    expect(screen.getByText('NO POSTER YET')).toBeInTheDocument()
    expect(container.querySelector('img.film-card__poster')).not.toBeInTheDocument()
  })

  //дефис, если рейтинг не указан
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

    const ratingEl = container.querySelector('.film-card__rating')
    expect(ratingEl).toHaveTextContent('—')
  })

  //класс постоянной подсветки лампы
  it('applies always-lit modifier class when alwaysLit prop is true', () => {
    render(
      <MemoryRouter>
        <FilmCard movie={mockMovie} alwaysLit={true} />
      </MemoryRouter>,
    )

    const linkElement = screen.getByRole('link')
    expect(linkElement).toHaveClass('film-card--always-lit')
  })
})
