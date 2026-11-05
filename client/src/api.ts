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

export type AuthResponse = {
  token: string
  username: string
}

export type LoginCredentials = {
  login: string
  password: string
}

export type RegisterCredentials = {
  username: string
  mail: string
  password: string
}

export async function getMovies(): Promise<Movie[]> {
  const response = await fetch('/api/movies')
  if (!response.ok) {
    throw new Error(`Failed to load movies: ${response.status}`)
  }
  return response.json()
}

export async function login(credentials: LoginCredentials): Promise<AuthResponse> {
  const response = await fetch('/api/auth/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(credentials),
  })
  if (!response.ok) {
    const data = await response.json().catch(() => null)
    throw new Error(data?.error || `Ошибка входа: ${response.status}`)
  }
  return response.json()
}

export async function register(credentials: RegisterCredentials): Promise<AuthResponse> {
  const response = await fetch('/api/auth/register', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(credentials),
  })
  if (!response.ok) {
    const data = await response.json().catch(() => null)
    throw new Error(data?.error || `Ошибка регистрации: ${response.status}`)
  }
  return response.json()
}
