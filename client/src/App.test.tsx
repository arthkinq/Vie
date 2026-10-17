import { render, screen } from '@testing-library/react'
import { Provider } from 'react-redux'
import { MemoryRouter } from 'react-router'
import { afterEach, describe, expect, it, vi } from 'vitest'
import App from './App'
import type { Movie } from './api'
import { setupStore } from './store'

const movies: Movie[] = [
  {
    id: 1,
    title: 'Касабланка',
    year: 1942,
    genres: ['драма'],
    country: 'США',
    director: 'Майкл Кёртис',
    description: 'История любви во время войны.',
  },
]

function renderAt(path: string) {
  render(
    <Provider store={setupStore()}>
      <MemoryRouter initialEntries={[path]}>
        <App />
      </MemoryRouter>
    </Provider>,
  )
}

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('App', () => {
  it.each([
    ['/', 'Популярное'],
    ['/film/1', 'Касабланка'],
    ['/search', 'Найти фильм'],
    ['/ticket', 'Выберите фильм для создания билета'],
    ['/profile', 'Профиль зрителя'],
    ['/login', 'Вход'],
    ['/about', 'О нашем кинотеатре'],
    ['/unknown', 'Страница не найдена'],
  ])('renders %s', async (path, heading) => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, json: async () => movies }))
    renderAt(path)
    expect(await screen.findByRole('heading', { name: heading })).toBeInTheDocument()
  })

  it('shows an error if the server is unavailable', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, status: 500 }))
    renderAt('/')
    expect(await screen.findByText('Не удалось загрузить фильмы')).toBeInTheDocument()
  })
})
