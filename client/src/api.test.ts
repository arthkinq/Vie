import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  deleteBookmark,
  deleteRating,
  getBookmarks,
  getRatings,
  login,
  register,
  saveBookmark,
  saveRating,
} from './api'

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('api', () => {
  afterEach(() => {
    vi.restoreAllMocks()
    vi.unstubAllGlobals()
  })
  it('saveBookmark sends PUT request with movieId and auth token', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
    })
    vi.stubGlobal('fetch', fetchMock)
    await saveBookmark('test-token', 666)
    expect(fetchMock).toHaveBeenCalledWith('/api/bookmarks/666', {
      method: 'PUT',
      headers: { Authorization: 'Bearer test-token' },
    })
  })
  it('deleteBookmark sends DELETE request with movieId and auth token', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
    })
    vi.stubGlobal('fetch', fetchMock)
    await deleteBookmark('test-token', 666)
    expect(fetchMock).toHaveBeenCalledWith('/api/bookmarks/666', {
      method: 'DELETE',
      headers: { Authorization: 'Bearer test-token' },
    })
  })
  it('getBookmarks sends GET request with auth token and returns array', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => [1, 2, 3],
    })
    vi.stubGlobal('fetch', fetchMock)
    const result = await getBookmarks('test-token')
    expect(result).toEqual([1, 2, 3])
    expect(fetchMock).toHaveBeenCalledWith('/api/bookmarks', {
      headers: { Authorization: 'Bearer test-token' },
    })
  })
  it('throws an error if server responds with error status', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: false,
      json: async () => ({ error: 'Сессия истекла' }),
    })
    vi.stubGlobal('fetch', fetchMock)

    await expect(getBookmarks('bad-token')).rejects.toThrow('Сессия истекла')
  })
  it('sends login and register requests', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ token: 'jwt', username: 'arthur' }),
    })
    vi.stubGlobal('fetch', fetchMock)

    expect(await login({ login: 'arthur', password: '123' })).toEqual({
      token: 'jwt',
      username: 'arthur',
    })
    expect(fetchMock).toHaveBeenCalledWith('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ login: 'arthur', password: '123' }),
    })

    await register({ username: 'arthur', mail: 'a@b.ru', password: '123' })
    expect(fetchMock).toHaveBeenCalledWith('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'arthur', mail: 'a@b.ru', password: '123' }),
    })
  })

  it('sends token in Authorization header for ratings', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => [],
    })
    vi.stubGlobal('fetch', fetchMock)

    await getRatings('t1')
    expect(fetchMock).toHaveBeenCalledWith('/api/ratings', {
      headers: { Authorization: 'Bearer t1' },
    })

    await saveRating('t1', 1, 9, 'Супер')
    expect(fetchMock).toHaveBeenCalledWith('/api/ratings/1', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: 'Bearer t1' },
      body: JSON.stringify({ value: 9, review: 'Супер' }),
    })

    await deleteRating('t1', 1)
    expect(fetchMock).toHaveBeenCalledWith('/api/ratings/1', {
      method: 'DELETE',
      headers: { Authorization: 'Bearer t1' },
    })
  })

  it('throws server error message on 401', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: false,
        status: 401,
        json: async () => ({ error: 'Необходима авторизация' }),
      }),
    )

    await expect(getRatings('bad')).rejects.toThrow('Необходима авторизация')
  })
})
