import assert from 'node:assert/strict'
import { once } from 'node:events'
import type { AddressInfo } from 'node:net'
import { after, test } from 'node:test'

process.env.DB_PATH = ':memory:'
const { app } = await import('./index.ts')

const server = app.listen(0)
await once(server, 'listening')
const url = `http://localhost:${(server.address() as AddressInfo).port}/api`

after(() => {
  server.close()
})

function send(method: string, path: string, body?: object, token?: string) {
  return fetch(url + path, {
    method,
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify(body),
  })
}

test('returns movies from the database', async () => {
  const res = await send('GET', '/movies')
  const movies = await res.json()

  assert.equal(res.status, 200)
  assert.ok(movies.length > 0)
  assert.ok(Array.isArray(movies[0].genres))
})

test('registers, logs in by mail and saves a rating', async () => {
  const user = { username: 'vika', mail: 'vika@mail.ru', password: 'Password123' }
  assert.equal((await send('POST', '/auth/register', user)).status, 201)

  const login = await send('POST', '/auth/login', {
    login: 'vika@mail.ru',
    password: 'Password123',
  })
  const { token } = await login.json()
  assert.equal(login.status, 200)

  const rating = { value: 8, review: 'Хороший фильм' }
  assert.equal((await send('PUT', '/ratings/1', rating, token)).status, 200)

  const ratings = await send('GET', '/ratings', undefined, token)
  assert.deepEqual(await ratings.json(), [{ movieId: 1, ...rating }])
})

test('does not register the same user twice', async () => {
  const user = { username: 'julia', mail: 'julia@mail.ru', password: 'Password123' }
  await send('POST', '/auth/register', user)

  assert.equal((await send('POST', '/auth/register', user)).status, 400)
})

test('rejects a wrong password', async () => {
  const user = { username: 'alina', mail: 'alina@mail.ru', password: 'Password123' }
  await send('POST', '/auth/register', user)

  const res = await send('POST', '/auth/login', { login: 'alina', password: 'wrong-password' })
  assert.equal(res.status, 401)
})

test('does not give ratings without a token', async () => {
  const res = await fetch(`${url}/ratings`)
  assert.equal(res.status, 401)
})


test('adds, gets and deletes bookmarks for authorized user', async () => {
  const user = { username: 'arthur', mail: 'arthur@mail.ru', password: 'Password123' }
  await send('POST', '/auth/register', user)

  const login = await send('POST', '/auth/login', {
    login: 'arthur@mail.ru',
    password: 'Password123',
  })
  const { token } = await login.json()

  const addRes = await send('PUT', '/bookmarks/1', undefined, token)
  assert.equal(addRes.status, 204)

  const getRes = await send('GET', '/bookmarks', undefined, token)
  assert.equal(getRes.status, 200)
  assert.deepEqual(await getRes.json(), [1])

  const delRes = await send('DELETE', '/bookmarks/1', undefined, token)
  assert.equal(delRes.status, 204)

  const getEmptyRes = await send('GET', '/bookmarks', undefined, token)
  assert.deepEqual(await getEmptyRes.json(), [])
})

test('does not give bookmarks without a token', async () => {
  const res = await fetch(`${url}/bookmarks`)
  assert.equal(res.status, 401)
})

test('returns 404 when bookmarking non-existent movie', async () => {
  const user = { username: 'arthur', mail: 'arthur@mail.ru', password: 'Password123' }
  await send('POST', '/auth/register', user)
  const login = await send('POST', '/auth/login', { login: 'arthur@mail.ru', password: 'Password123' })
  const { token } = await login.json()

  const res = await send('PUT', '/bookmarks/99999', undefined, token)
  assert.equal(res.status, 404)
  assert.deepEqual(await res.json(), { error: 'Фильм не найден' })
})