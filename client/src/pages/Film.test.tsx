import { cleanup, render, screen } from '@testing-library/react'
import { Provider } from 'react-redux'
import { MemoryRouter, Route, Routes } from 'react-router'
import { afterEach, describe, expect, it, vi } from 'vitest'
import type { Movie } from '../api'
import { setupStore } from '../store'
import { fetchMovies } from '../store/moviesSlice'
import Film from './Film'

const movie: Movie = {
  id: 1,
  title: 'Великий Гэтсби',
  year: 2013,
  genres: ['драма', 'мелодрама'],
  countries: ['Австралия', 'США'],
  director: 'Баз Лурман',
  rating: 7.2,
  description: 'История Джея Гэтсби.',
}

async function renderFilm() {
  vi.stubGlobal(
    'fetch',
    vi.fn().mockResolvedValue({
      ok: true,
      json: async () => [movie],
    }),
  )

  const store = setupStore()
  await store.dispatch(fetchMovies())

  render(
    <Provider store={store}>
      <MemoryRouter initialEntries={['/film/1']}>
        <Routes>
          <Route path="/film/:id" element={<Film />} />
        </Routes>
      </MemoryRouter>
    </Provider>,
  )
}

describe('Film page', () => {
  afterEach(() => {
    cleanup()
    vi.unstubAllGlobals()
  })

  it('renders movie title', async () => {
    await renderFilm()

    expect(
      screen.getByRole('heading', { name: 'Великий Гэтсби' }),
    ).toBeInTheDocument()
  })

  it('renders movie director', async () => {
    await renderFilm()

    expect(
      screen.getByText('Режиссёр: Баз Лурман'),
    ).toBeInTheDocument()
  })

  it('renders rating section', async () => {
    await renderFilm()

    expect(
      screen.getByRole('heading', { name: 'Оставьте оценку' }),
    ).toBeInTheDocument()
  })
})
