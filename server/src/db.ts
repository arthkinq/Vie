import { DatabaseSync } from 'node:sqlite'
import movies from '../data/movies.json' with { type: 'json' }

export type Movie = {
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

export type MovieRow = Omit<Movie, 'genres' | 'countries' | 'poster'> & {
  genres: string
  countries: string
  poster: string | null
}

export type User = {
  id: number
  username: string
  mail: string
  password: string
}

export const db = new DatabaseSync(process.env.DB_PATH || 'vie.db')

db.exec(`
  CREATE TABLE IF NOT EXISTS movies (
    id INTEGER PRIMARY KEY,
    title TEXT NOT NULL,
    year INTEGER NOT NULL,
    genres TEXT NOT NULL,
    countries TEXT NOT NULL,
    director TEXT NOT NULL,
    rating REAL NOT NULL,
    description TEXT NOT NULL,
    poster TEXT
  );

  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY,
    username TEXT NOT NULL UNIQUE,
    mail TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS ratings (
    user_id INTEGER NOT NULL REFERENCES users (id),
    movie_id INTEGER NOT NULL REFERENCES movies (id),
    value INTEGER NOT NULL,
    review TEXT,
    PRIMARY KEY (user_id, movie_id)
  );
`)

const saveMovie = db.prepare('INSERT OR REPLACE INTO movies VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)')

for (const movie of movies as Movie[]) {
  saveMovie.run(
    movie.id,
    movie.title,
    movie.year,
    JSON.stringify(movie.genres),
    JSON.stringify(movie.countries),
    movie.director,
    movie.rating,
    movie.description,
    movie.poster ?? null,
  )
}

export function toMovie(row: MovieRow): Movie {
  return {
    ...row,
    genres: JSON.parse(row.genres),
    countries: JSON.parse(row.countries),
    poster: row.poster ? `/api/posters/${row.poster}` : undefined,
  }
}
