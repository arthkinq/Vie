import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { Provider } from 'react-redux'
import { MemoryRouter } from 'react-router'
import { afterEach, describe, expect, it } from 'vitest'
import type { Movie } from '../api'
import { setupStore } from '../store'
import Ticket from './Ticket'

const mockMovies: Movie[] = [
  {
    id: 1,
    title: 'Касабланка',
    year: 1942,
    genres: ['драма'],
    countries: ['США'],
    director: 'Майкл Кёртис',
    rating: 8.5,
    description: 'Описание 1',
    poster: 'poster-1.jpg',
  },
  {
    id: 2,
    title: 'Интерстеллар',
    year: 2014,
    genres: ['фантастика'],
    countries: ['США'],
    director: 'Кристофер Нолан',
    rating: 8.7,
    description: 'Описание 2',
    poster: 'poster-2.jpg',
  },
  {
    id: 3,
    title: 'Начало',
    year: 2010,
    genres: ['фантастика'],
    countries: ['США'],
    director: 'Кристофер Нолан',
    rating: 8.8,
    description: 'Описание 3',
    poster: 'poster-3.jpg',
  },
]

function renderTicket(preloadedState?: Parameters<typeof setupStore>[0]) {
  const store = setupStore(preloadedState)
  const renderResult = render(
    <Provider store={store}>
      <MemoryRouter>
        <Ticket />
      </MemoryRouter>
    </Provider>,
  )
  return { store, container: renderResult.container }
}

describe('Ticket page', () => {
  afterEach(() => {
    cleanup()
  })

  it('renders loading spinner when movies are loading', () => {
    const { container } = renderTicket({
      movies: { items: [], status: 'loading' },
    })

    expect(container.querySelector('.ant-spin')).toBeInTheDocument()
  })

  it('renders error alert when loading movies fails', () => {
    renderTicket({
      movies: { items: [], status: 'failed' },
    })

    expect(screen.getByText('Не удалось загрузить фильмы')).toBeInTheDocument()
  })

  it('renders empty placeholder with catalog link when no films are rated', () => {
    renderTicket({
      movies: { items: mockMovies, status: 'succeeded' },
      ratings: {},
    })

    expect(
      screen.getByRole('heading', { name: 'Выберите фильм для создания билета' }),
    ).toBeInTheDocument()
    expect(screen.getByText('У вас пока нет оценённых фильмов.')).toBeInTheDocument()
    expect(
      screen.getByText('Оцените фильмы в каталоге, чтобы оформить памятный билет.'),
    ).toBeInTheDocument()

    const catalogLink = screen.getByRole('link', { name: 'Перейти в каталог' })
    expect(catalogLink).toHaveAttribute('href', '/')
  })

  it('renders only rated movies and links them to /ticket/:id', () => {
    const { container } = renderTicket({
      movies: { items: mockMovies, status: 'succeeded' },
      ratings: { 1: 9, 3: 10 },
    })

    expect(screen.getByText('Касабланка')).toBeInTheDocument()
    expect(screen.getByText('Начало')).toBeInTheDocument()
    expect(screen.queryByText('Интерстеллар')).not.toBeInTheDocument()

    const links = screen.getAllByRole('link')
    const hrefs = links.map((link) => link.getAttribute('href'))
    expect(hrefs).toContain('/ticket/1')
    expect(hrefs).toContain('/ticket/3')
    expect(hrefs).not.toContain('/ticket/2')

    const ratingsElements = container.querySelectorAll('.film-card-rating')
    const ratingTexts = Array.from(ratingsElements).map((el) => el.textContent)
    expect(ratingTexts).toContain('9/10')
    expect(ratingTexts).toContain('10/10')
  })

  it('supports pagination when there are more than 12 rated movies', () => {
    const manyMovies: Movie[] = Array.from({ length: 14 }, (_, i) => ({
      id: i + 1,
      title: `Фильм ${i + 1}`,
      year: 2020 + i,
      genres: ['драма'],
      countries: ['США'],
      director: 'Режиссёр',
      rating: 7,
      description: 'Описание',
    }))

    const ratingsMap: Record<number, number> = {}
    manyMovies.forEach((m) => {
      ratingsMap[m.id] = 8
    })

    renderTicket({
      movies: { items: manyMovies, status: 'succeeded' },
      ratings: ratingsMap,
    })

    expect(screen.getByText('Фильм 1')).toBeInTheDocument()
    expect(screen.getByText('Фильм 12')).toBeInTheDocument()
    expect(screen.queryByText('Фильм 13')).not.toBeInTheDocument()

    const page2Button = screen.getByRole('listitem', { name: '2' })
    fireEvent.click(page2Button)

    expect(screen.queryByText('Фильм 1')).not.toBeInTheDocument()
    expect(screen.getByText('Фильм 13')).toBeInTheDocument()
    expect(screen.getByText('Фильм 14')).toBeInTheDocument()
  })
})
