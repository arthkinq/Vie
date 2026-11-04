import { useState } from 'react'
import { Link } from 'react-router'
import type { Movie } from '../api'
import './FilmCard.css'

// рамка постера со светильником (можно использовать отдельно)
export interface FilmFrameProps {
  poster?: string
  title: string
  alwaysLit?: boolean
  className?: string
}

export function FilmFrame({ poster, title, alwaysLit = false, className = '' }: FilmFrameProps) {
  const [hasError, setHasError] = useState(false)
  const showPoster = Boolean(poster) && !hasError

  return (
    <div
      className={`film-card__frame-wrapper ${alwaysLit ? 'film-card--always-lit' : ''} ${className}`}
    >
      <div className="film-card__lamp" aria-hidden="true" />

      <div className="film-card__frame">
        {showPoster ? (
          <img
            src={poster}
            alt={title}
            className="film-card__poster"
            loading="lazy"
            onError={() => setHasError(true)}
          />
        ) : (
          <div className="film-card__placeholder">
            <span className="film-card__placeholder-text">NO POSTER YET</span>
          </div>
        )}
      </div>
    </div>
  )
}

// табличка с названием, годом и рейтингом (тоже можно использоавть отдельно)
export interface FilmPlaqueProps {
  title: string
  year?: number
  rating?: number
  className?: string
}

export function FilmPlaque({ title, year, rating, className = '' }: FilmPlaqueProps) {
  return (
    <div className={`film-card__plaque ${className}`}>
      <h3 className="film-card__title" title={title}>
        {title}
      </h3>
      {(year !== undefined || rating !== undefined) && (
        <div className="film-card__meta">
          <span className="film-card__year">{year ?? ''}</span>
          <span className="film-card__rating">{rating !== undefined ? `${rating}` : '—'}</span>
        </div>
      )}
    </div>
  )
}

// карточка фильма для каталога
export interface FilmCardProps {
  movie: Movie
  alwaysLit?: boolean
  hidePlaque?: boolean
}

export default function FilmCard({ movie, alwaysLit = false, hidePlaque = false }: FilmCardProps) {
  return (
    <Link
      to={`/film/${movie.id}`}
      className={`film-card ${alwaysLit ? 'film-card--always-lit' : ''}`}
    >
      <FilmFrame poster={movie.poster} title={movie.title} alwaysLit={alwaysLit} />

      {!hidePlaque && <FilmPlaque title={movie.title} year={movie.year} rating={movie.rating} />}
    </Link>
  )
}
