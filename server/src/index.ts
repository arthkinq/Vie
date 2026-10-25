import { join } from 'node:path'
import express from 'express'
import { checkPassword, createToken, hashPassword, requireAuth } from './auth.ts'
import { db, toMovie, type MovieRow, type User } from './db.ts'

const app = express()
const port = Number(process.env.PORT) || 3000

app.use(express.json())
app.use('/api/posters', express.static(join(import.meta.dirname, '../data/posters')))

app.get('/api/movies', (_req, res) => {
  const rows = db.prepare('SELECT * FROM movies').all() as MovieRow[]
  res.json(rows.map(toMovie))
})

app.get('/api/movies/:id', (req, res) => {
  const row = db.prepare('SELECT * FROM movies WHERE id = ?').get(Number(req.params.id))
  if (!row) {
    res.status(404).json({ error: 'Фильм не найден!' })
    return
  }
  res.json(toMovie(row as MovieRow))
})

app.post('/api/auth/register', async (req, res) => {
  const { username, mail, password } = req.body ?? {}
  const filled = [username, mail, password].every(
    (field) => typeof field === 'string' && field.trim(),
  )
  if (!filled || password.length < 8) {
    res.status(400).json({ error: 'Укажите логин, почту и пароль не короче 8 символов' })
    return
  }
  const taken = db
    .prepare('SELECT id FROM users WHERE username = ? OR mail = ?')
    .get(username, mail)
  if (taken) {
    res.status(400).json({ error: 'Логин или почта уже заняты' })
    return
  }
  const { lastInsertRowid } = db
    .prepare('INSERT INTO users (username, mail, password) VALUES (?, ?, ?)')
    .run(username, mail, hashPassword(password))
  res.status(201).json({ token: await createToken(Number(lastInsertRowid)), username })
})

app.post('/api/auth/login', async (req, res) => {
  const { login, password } = req.body ?? {}
  if (typeof login !== 'string' || typeof password !== 'string') {
    res.status(401).json({ error: 'Неверный логин или пароль' })
    return
  }
  const user = db
    .prepare('SELECT * FROM users WHERE username = ? OR mail = ?')
    .get(login, login) as User | undefined
  if (!user || !checkPassword(password, user.password)) {
    res.status(401).json({ error: 'Неверный логин или пароль' })
    return
  }
  res.json({ token: await createToken(user.id), username: user.username })
})

app.get('/api/ratings', requireAuth, (_req, res) => {
  const ratings = db
    .prepare('SELECT movie_id AS movieId, value, review FROM ratings WHERE user_id = ?')
    .all(res.locals.userId)
  res.json(ratings)
})

app.put('/api/ratings/:movieId', requireAuth, (req, res) => {
  const movieId = Number(req.params.movieId)
  const { value } = req.body ?? {}
  const review = typeof req.body?.review === 'string' ? req.body.review : null
  if (!Number.isInteger(value) || value < 1 || value > 10) {
    res.status(400).json({ error: 'Оценка должна быть от 1 до 10' })
    return
  }
  if (!db.prepare('SELECT id FROM movies WHERE id = ?').get(movieId)) {
    res.status(404).json({ error: 'Фильм не найден' })
    return
  }
  db.prepare('INSERT OR REPLACE INTO ratings VALUES (?, ?, ?, ?)').run(
    res.locals.userId,
    movieId,
    value,
    review,
  )
  res.json({ movieId, value, review })
})

app.delete('/api/ratings/:movieId', requireAuth, (req, res) => {
  db.prepare('DELETE FROM ratings WHERE user_id = ? AND movie_id = ?').run(
    res.locals.userId,
    Number(req.params.movieId),
  )
  res.status(204).end()
})

app.listen(port, () => {
  console.log(`Server started on http://localhost:${port}`)
})
