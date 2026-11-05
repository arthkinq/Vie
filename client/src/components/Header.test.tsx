import { cleanup, render, screen } from '@testing-library/react'
import { Provider } from 'react-redux'
import { MemoryRouter } from 'react-router'
import { afterEach, describe, expect, it } from 'vitest'
import { setupStore } from '../store'
import Header from './Header'

describe('Header', () => {
  afterEach(() => {
    cleanup()
  })

  it('renders "Войти" when user is not authenticated', () => {
    const store = setupStore({
      auth: { token: null, username: null },
    })

    render(
      <Provider store={store}>
        <MemoryRouter>
          <Header />
        </MemoryRouter>
      </Provider>,
    )

    expect(screen.getByRole('link', { name: 'Войти' })).toBeInTheDocument()
    expect(screen.queryByRole('link', { name: 'Профиль' })).not.toBeInTheDocument()
  })

  it('renders "Профиль" when user is authenticated', () => {
    const store = setupStore({
      auth: { token: 'jwt-sample-token', username: 'viktoria' },
    })

    render(
      <Provider store={store}>
        <MemoryRouter>
          <Header />
        </MemoryRouter>
      </Provider>,
    )

    expect(screen.getByRole('link', { name: 'Профиль' })).toBeInTheDocument()
    expect(screen.queryByRole('link', { name: 'Войти' })).not.toBeInTheDocument()
  })
})
