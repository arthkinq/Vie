import type { Movie } from '../api'
import FilmCard from './FilmCard'
import './FilmRow.css'

export interface FilmRowProps {
  title: string
  movies?: Movie[]
  minCount?: number
  className?: string
}

export default function FilmRow({
  title,
  movies = [],
  minCount = 5,
  className = '',
}: FilmRowProps) {
  if (!movies || movies.length < minCount) {
    return null
  }

  return (
    <section className={`film-row ${className}`}>
      <div className="film-row-header">
        <h2 className="film-row-title">{title}</h2>
      </div>
      <div className="film-row-track">
        {movies.map((movie) => (
          <div key={movie.id} className="film-row-item">
            <FilmCard movie={movie} />
          </div>
        ))}
      </div>
    </section>
  )
}
