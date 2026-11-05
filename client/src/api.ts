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

export type Rating = {
  movieId: number
  value: number
  review: string | null
}

async function checkError(response: Response) {
  if (!response.ok) {
    const data = await response.json()
    throw new Error(data.error)
  }
}

export async function getMovies(): Promise<Movie[]> {
  const response = await fetch('/api/movies')
  if (!response.ok) {
    throw new Error(`Failed to load movies: ${response.status}`)
  }
  return response.json()
}

export async function login(body: { login: string; password: string }) {
  const response = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  await checkError(response)
  return response.json() as Promise<{ token: string; username: string }>
}

export async function register(body: { username: string; mail: string; password: string }) {
  const response = await fetch('/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  await checkError(response)
  return response.json() as Promise<{ token: string; username: string }>
}

export async function getRatings(token: string): Promise<Rating[]> {
  const response = await fetch('/api/ratings', {
    headers: { Authorization: `Bearer ${token}` },
  })
  await checkError(response)
  return response.json()
}

export async function saveRating(
  token: string,
  movieId: number,
  value: number,
  review?: string,
): Promise<Rating> {
  const response = await fetch(`/api/ratings/${movieId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ value, review }),
  })
  await checkError(response)
  return response.json()
}

export async function deleteRating(token: string, movieId: number) {
  const response = await fetch(`/api/ratings/${movieId}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  })
  await checkError(response)
}
