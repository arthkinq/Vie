import { Link } from 'react-router'
import type { Movie } from '../api'

export default function FilmCard({ movie }: { movie: Movie }) {
  return (
    <Link to={`/film/${movie.id}`} className="film-card">
      {movie.poster && <img src={movie.poster} alt={movie.title} />}
      <div>{movie.title}</div>
      <div>{movie.year}</div>
    </Link>
  )
}
