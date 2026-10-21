import express from 'express'
import movies from '../data/movies.json' with { type: 'json' }

const app = express()
const port = Number(process.env.PORT) || 3000

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
