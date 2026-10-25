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

export async function getMovies(): Promise<Movie[]> {
  const response = await fetch('/api/movies')
  if (!response.ok) {
    throw new Error(`Failed to load movies: ${response.status}`)
  }
  return response.json()
}
