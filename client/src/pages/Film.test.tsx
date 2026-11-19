import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { Provider } from 'react-redux'
import { MemoryRouter, Route, Routes } from 'react-router'
import { afterEach, describe, expect, it, vi } from 'vitest'
import * as api from '../api'
import type { Movie } from '../api'
import { setupStore, type RootState } from '../store'
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

const auth = {
  token: 'test-token',
  username: 'test-user',
}

async function renderFilm(preloadedState?: Partial<RootState>) {
  vi.stubGlobal(
    'fetch',
    vi.fn().mockResolvedValue({
      ok: true,
      json: async () => [movie],
    }),
  )

  const store = setupStore(preloadedState)
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

  return store
}

describe('Film page', () => {
  afterEach(() => {
    cleanup()
    vi.restoreAllMocks()
    vi.unstubAllGlobals()
  })

  it('renders movie title', async () => {
    await renderFilm()

    expect(screen.getByRole('heading', { name: 'Великий Гэтсби' })).toBeInTheDocument()
  })

  it('renders movie director', async () => {
    await renderFilm()

    expect(screen.getByText('Режиссёр: Баз Лурман')).toBeInTheDocument()
  })

  it('renders rating section', async () => {
    await renderFilm()

    expect(screen.getByRole('heading', { name: 'Оставьте оценку' })).toBeInTheDocument()
  })

  it('saves and deletes rating', async () => {
    const save = vi.spyOn(api, 'saveRating').mockResolvedValue({
      movieId: 1,
      value: 8,
      review: 'Старый отзыв',
    })

    const remove = vi.spyOn(api, 'deleteRating').mockResolvedValue(undefined)

    const store = await renderFilm({
      auth,
      ratings: { 1: 6 },
      reviews: { 1: 'Старый отзыв' },
    })

    const stars = document.querySelectorAll<HTMLElement>('.film-user-rating .ant-rate-star-second')

    expect(stars).toHaveLength(5)

    fireEvent.click(stars[3], { clientX: 1000 })

    await waitFor(() => {
      expect(save).toHaveBeenCalledWith('test-token', 1, 8, 'Старый отзыв')
      expect(store.getState().ratings[1]).toBe(8)
      expect(screen.getByRole('button', { name: 'Отправить' })).toBeEnabled()
    })

    fireEvent.click(stars[3], { clientX: 1000 })

    await waitFor(() => {
      expect(remove).toHaveBeenCalledWith('test-token', 1)
      expect(store.getState().ratings[1]).toBeUndefined()
      expect(store.getState().reviews[1]).toBeUndefined()
    })
  })

  it('submits and displays user review', async () => {
    const save = vi.spyOn(api, 'saveRating').mockResolvedValue({
      movieId: 1,
      value: 8,
      review: 'Отличный фильм!',
    })

    const store = await renderFilm({
      auth,
      ratings: { 1: 8 },
    })

    fireEvent.change(screen.getByRole('textbox', { name: 'Отзыв о фильме' }), {
      target: { value: 'Отличный фильм!' },
    })

    fireEvent.click(screen.getByRole('button', { name: 'Отправить' }))

    expect(await screen.findByText('Отличный фильм!')).toBeInTheDocument()

    expect(save).toHaveBeenCalledWith('test-token', 1, 8, 'Отличный фильм!')
    expect(store.getState().reviews[1]).toBe('Отличный фильм!')
    expect(screen.getByRole('textbox')).toHaveValue('')
  })

  it('displays server error', async () => {
    vi.spyOn(api, 'saveRating').mockRejectedValue(new Error('Ошибка сервера'))

    await renderFilm({
      auth,
      ratings: { 1: 8 },
    })

    fireEvent.change(screen.getByRole('textbox'), {
      target: { value: 'Хороший фильм' },
    })

    fireEvent.click(screen.getByRole('button', { name: 'Отправить' }))

    expect(await screen.findByText('Ошибка сервера')).toBeInTheDocument()
    expect(screen.getByRole('textbox')).toHaveValue('Хороший фильм')
  })
  it('toggles bookmark on button click when user is authenticated', async () => {
    const save = vi.spyOn(api, 'saveBookmark').mockResolvedValue(undefined)
    const remove = vi.spyOn(api, 'deleteBookmark').mockResolvedValue(undefined)

    const store = await renderFilm({
      auth,
      bookmarks: { bookmarks: [] },
    })

    const bookmarkBtn = screen.getByRole('button', { name: 'Добавить в закладки' })
    expect(bookmarkBtn).toBeInTheDocument()

    fireEvent.click(bookmarkBtn)

    await waitFor(() => {
      expect(save).toHaveBeenCalledWith('test-token', 1)
      expect(store.getState().bookmarks.bookmarks).toContain(1)
      expect(screen.getByRole('button', { name: 'Удалить из закладок' })).toBeInTheDocument()
    })

    fireEvent.click(bookmarkBtn)

    await waitFor(() => {
      expect(remove).toHaveBeenCalledWith('test-token', 1)
      expect(store.getState().bookmarks.bookmarks).not.toContain(1)
      expect(screen.getByRole('button', { name: 'Добавить в закладки' })).toBeInTheDocument()
    })
  })
  it('saves bookmark only locally when user is not authenticated', async () => {
    const save = vi.spyOn(api, 'saveBookmark')

    const store = await renderFilm({
      auth: { token: null, username: null },
      bookmarks: { bookmarks: [] },
    })

    const bookmarkBtn = screen.getByRole('button', { name: 'Добавить в закладки' })
    fireEvent.click(bookmarkBtn)

    await waitFor(() => {
      expect(store.getState().bookmarks.bookmarks).toContain(1)
      expect(save).not.toHaveBeenCalled()
    })
  })
})
