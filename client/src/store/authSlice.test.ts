import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { login, register } from '../api'
import { setupStore } from './index'
import reducer, { loggedIn, logout, type AuthState } from './authSlice'

describe('authSlice', () => {
  beforeEach(() => {
    localStorage.clear()
    sessionStorage.clear()
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    localStorage.clear()
    sessionStorage.clear()
  })

  it('updates state and stores token in localStorage when remember is true', () => {
    const initialState: AuthState = { token: null, username: null }
    const state = reducer(
      initialState,
      loggedIn({ token: 'local-token', username: 'viktoria', remember: true }),
    )

    expect(state).toEqual({ token: 'local-token', username: 'viktoria' })
    expect(localStorage.getItem('token')).toBe('local-token')
    expect(localStorage.getItem('username')).toBe('viktoria')
    expect(sessionStorage.getItem('token')).toBeNull()
  })

  it('updates state and stores token in sessionStorage when remember is false', () => {
    const initialState: AuthState = { token: null, username: null }
    const state = reducer(
      initialState,
      loggedIn({ token: 'session-token', username: 'viktoria', remember: false }),
    )

    expect(state).toEqual({ token: 'session-token', username: 'viktoria' })
    expect(sessionStorage.getItem('token')).toBe('session-token')
    expect(sessionStorage.getItem('username')).toBe('viktoria')
    expect(localStorage.getItem('token')).toBeNull()
  })

  it('clears state and removes tokens from both storages on logout', () => {
    localStorage.setItem('token', 'old-token')
    localStorage.setItem('username', 'old-user')
    sessionStorage.setItem('token', 'old-token')
    sessionStorage.setItem('username', 'old-user')

    const state = reducer({ token: 'old-token', username: 'old-user' }, logout())

    expect(state).toEqual({ token: null, username: null })
    expect(localStorage.getItem('token')).toBeNull()
    expect(localStorage.getItem('username')).toBeNull()
    expect(sessionStorage.getItem('token')).toBeNull()
    expect(sessionStorage.getItem('username')).toBeNull()
  })

  it('successfully logs in with mocked fetch and updates store and storage', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ token: 'mocked-jwt-token', username: 'arthur' }),
      }),
    )

    const response = await login({ login: 'arthur', password: 'password123' })
    expect(response).toEqual({ token: 'mocked-jwt-token', username: 'arthur' })

    const store = setupStore()
    store.dispatch(
      loggedIn({
        token: response.token,
        username: response.username,
        remember: true,
      }),
    )

    expect(store.getState().auth).toEqual({
      token: 'mocked-jwt-token',
      username: 'arthur',
    })
    expect(localStorage.getItem('token')).toBe('mocked-jwt-token')
    expect(localStorage.getItem('username')).toBe('arthur')
  })

  it('successfully registers with mocked fetch and updates store and storage', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ token: 'mocked-reg-token', username: 'newuser' }),
      }),
    )

    const response = await register({
      username: 'newuser',
      mail: 'user@example.com',
      password: 'Password1',
    })
    expect(response).toEqual({ token: 'mocked-reg-token', username: 'newuser' })

    const store = setupStore()
    store.dispatch(
      loggedIn({
        token: response.token,
        username: response.username,
        remember: false,
      }),
    )

    expect(store.getState().auth).toEqual({
      token: 'mocked-reg-token',
      username: 'newuser',
    })
    expect(sessionStorage.getItem('token')).toBe('mocked-reg-token')
    expect(sessionStorage.getItem('username')).toBe('newuser')
  })

  it('throws an error on failed login or register', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: false,
        status: 401,
        json: async () => ({ error: 'Неверный логин или пароль' }),
      }),
    )

    await expect(login({ login: 'wrong', password: 'bad' })).rejects.toThrow(
      'Неверный логин или пароль',
    )
  })
})
