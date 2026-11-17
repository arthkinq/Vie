import type { Movie } from './api'
import { recommendMovies } from './lib/recommend'

self.onmessage = (event: MessageEvent<{ movies: Movie[]; ratings: Record<number, number> }>) => {
  self.postMessage(recommendMovies(event.data.movies, event.data.ratings))
}
