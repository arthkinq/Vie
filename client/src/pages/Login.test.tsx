import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { Provider } from 'react-redux'
import { MemoryRouter, Route, Routes } from 'react-router'
import { afterEach, describe, expect, it, vi } from 'vitest'
import * as api from '../api'
import { setupStore } from '../store'
import Login from './Login'

function renderLogin() {
  const store = setupStore()
  render(
    <Provider store={store}>
      <MemoryRouter initialEntries={['/login']}>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/profile" element={<div>Страница профиля</div>} />
        </Routes>
      </MemoryRouter>
    </Provider>,
  )
  return { store }
}

afterEach(() => {
  cleanup()
  vi.restoreAllMocks()
  localStorage.clear()
  sessionStorage.clear()
})

describe('Login page', () => {
  it('renders login form', () => {
    renderLogin()
    expect(screen.getByRole('heading', { level: 1, name: 'Вход' })).toBeInTheDocument()
    expect(screen.getByPlaceholderText('username or mail')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'ВОЙТИ' })).toBeInTheDocument()
  })

  it('successfully logs in and navigates to /profile', async () => {
    vi.spyOn(api, 'login').mockResolvedValue({ token: 'test-token', username: 'viktoria' })
    const { store } = renderLogin()

    fireEvent.change(screen.getByPlaceholderText('username or mail'), {
      target: { value: 'viktoria' },
    })
    fireEvent.change(screen.getByPlaceholderText('password'), {
      target: { value: 'Password123' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'ВОЙТИ' }))

    await waitFor(() => {
      expect(screen.getByText('Страница профиля')).toBeInTheDocument()
    })

    expect(store.getState().auth).toEqual({
      token: 'test-token',
      username: 'viktoria',
    })
  })

  it('displays error message from server when login fails', async () => {
    vi.spyOn(api, 'login').mockRejectedValue(new Error('Неверный логин или пароль'))
    renderLogin()

    fireEvent.change(screen.getByPlaceholderText('username or mail'), {
      target: { value: 'viktoria' },
    })
    fireEvent.change(screen.getByPlaceholderText('password'), {
      target: { value: 'WrongPass' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'ВОЙТИ' }))

    expect(await screen.findByText('Неверный логин или пароль')).toBeInTheDocument()
  })

  it('successfully registers and navigates to /profile', async () => {
    vi.spyOn(api, 'register').mockResolvedValue({ token: 'reg-token', username: 'newuser' })
    const { store } = renderLogin()

    fireEvent.click(screen.getByRole('tab', { name: 'Создать' }))
    fireEvent.change(await screen.findByPlaceholderText('username'), {
      target: { value: 'newuser' },
    })
    fireEvent.change(screen.getByPlaceholderText('example@mail.com'), {
      target: { value: 'user@example.com' },
    })
    fireEvent.change(screen.getByPlaceholderText('password'), {
      target: { value: 'Password1' },
    })
    fireEvent.change(screen.getByPlaceholderText('repeat password'), {
      target: { value: 'Password1' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'СОЗДАТЬ' }))

    await waitFor(() => {
      expect(screen.getByText('Страница профиля')).toBeInTheDocument()
    })

    expect(store.getState().auth).toEqual({
      token: 'reg-token',
      username: 'newuser',
    })
  })
})
