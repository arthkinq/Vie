import { afterEach, describe, expect, it, vi } from 'vitest'
import { deleteRating, getRatings, login, register, saveRating } from './api'

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('api', () => {
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
