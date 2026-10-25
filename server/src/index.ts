import { join } from 'node:path'
import express from 'express'
import data from '../data/movies.json' with { type: 'json' }

type Movie = {
  id: number
  title: string
  year: number
  genres: string[]
  countries: string[]
  director: string
  rating: number
  description: string
  poster?: string
}

const movies = (data as Movie[]).map((movie) => ({
  ...movie,
  poster: movie.poster && `/api/posters/${movie.poster}`,
}))

const app = express()
const port = Number(process.env.PORT) || 3000

app.use('/api/posters', express.static(join(import.meta.dirname, '../data/posters')))

app.get('/api/movies', (_req, res) => {
  res.json(movies)
})

app.get('/api/movies/:id', (req, res) => {
  const movie = movies.find((m) => m.id === Number(req.params.id))
  if (!movie) {
    res.status(404).json({ error: 'Movie not found' })
    return
  }
  res.json(movie)
})

app.listen(port, () => {
  console.log(`Server started on http://localhost:${port}`)
})
