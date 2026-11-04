import type { Movie } from '../api'
import { cosineSimilarity } from './cosine'

function getFeatures(movie: Movie): string[] {
  const decade = `${Math.floor(movie.year / 10) * 10}`
  return [...movie.genres, ...movie.countries, movie.director, decade]
}

export function recommendMovies(movies: Movie[], ratings: Record<number, number>): number[] {
  const likedMovies = movies.filter((movie) => ratings[movie.id] >= 5)
  if (likedMovies.length === 0) {
    return []
  }

  const allFeatures = [...new Set(movies.flatMap(getFeatures))]
  const toVector = (movie: Movie) => {
    const features = getFeatures(movie)
    return allFeatures.map((feature) => (features.includes(feature) ? 1 : 0))
  }

  const userVector = allFeatures.map(() => 0)
  for (const movie of likedMovies) {
    const vector = toVector(movie)
    for (let i = 0; i < allFeatures.length; i++) {
      userVector[i] += vector[i] * ratings[movie.id]
    }
  }

  const newIds = movies
    .filter((movie) => ratings[movie.id] === undefined)
    .map((movie) => ({
      id: movie.id,
      score: cosineSimilarity(userVector, toVector(movie)),
    }))
    .filter((item) => item.score >= 0.5)
    .sort((a, b) => b.score - a.score)
    .map((item) => item.id)

  const likedIds = [...likedMovies]
    .sort((a, b) => ratings[b.id] - ratings[a.id])
    .map((movie) => movie.id)

  return [...newIds, ...likedIds]
}
