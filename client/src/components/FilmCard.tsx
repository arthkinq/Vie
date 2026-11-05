import { useState } from 'react'
import { Link } from 'react-router'
import type { Movie } from '../api'
import './FilmCard.css'

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
      className={`film-card-frame-wrapper ${alwaysLit ? 'film-card-always-lit' : ''} ${className}`}
    >
      <div className="film-card-lamp" aria-hidden="true" />

      <div className="film-card-frame">
        {showPoster ? (
          <img
            src={poster}
            alt={title}
            className="film-card-poster"
            loading="lazy"
            onError={() => setHasError(true)}
          />
        ) : (
          <div className="film-card-placeholder">
            <span className="film-card-placeholder-text">NO POSTER YET</span>
          </div>
        )}
      </div>
    </div>
  )
}

export interface FilmPlaqueProps {
  title: string
  year?: number
  rating?: number
  className?: string
}

export function FilmPlaque({ title, year, rating, className = '' }: FilmPlaqueProps) {
  return (
    <div className={`film-card-plaque ${className}`}>
      <h3 className="film-card-title" title={title}>
        {title}
      </h3>
      {(year !== undefined || rating !== undefined) && (
        <div className="film-card-meta">
          <span className="film-card-year">{year ?? ''}</span>
          <span className="film-card-rating">{rating !== undefined ? `${rating}` : '—'}</span>
        </div>
      )}
    </div>
  )
}

export interface FilmCardProps {
  movie: Movie
  alwaysLit?: boolean
  hidePlaque?: boolean
}

export default function FilmCard({ movie, alwaysLit = false, hidePlaque = false }: FilmCardProps) {
  return (
    <Link
      to={`/film/${movie.id}`}
      className={`film-card ${alwaysLit ? 'film-card-always-lit' : ''}`}
    >
      <FilmFrame poster={movie.poster} title={movie.title} alwaysLit={alwaysLit} />

      {!hidePlaque && <FilmPlaque title={movie.title} year={movie.year} rating={movie.rating} />}
    </Link>
  )
}
