import { useEffect, useState } from 'react'
import { Alert, Spin } from 'antd'
import FilmRow from '../components/FilmRow'
import { useAppSelector } from '../store'
import './Home.css'

const GENRES = [
  'триллер',
  'драма',
  'комедия',
  'детектив',
  'фантастика',
  'боевик',
  'мелодрама',
  'криминал',
  'фэнтези',
  'приключения',
  'ужасы',
  'мультфильм',
  'военный',
  'биография',
  'мюзикл',
  'семейный',
]

// верхний край
function TicketTopEdge() {
  return (
    <div className="ticket-edge ticket-edge-top" aria-hidden="true">
      <svg className="ticket-svg" viewBox="0 0 1920 18" preserveAspectRatio="none">
        <defs>
          <pattern id="figma-tooth-top" width="54.6" height="18" patternUnits="userSpaceOnUse">
            {/* вырез фона */}
            <path
              d="M 9 0 V 1.5 C 9 9 17.2 15.1 27.3 15.1 C 37.4 15.1 45.6 9 45.6 1.5 V 0 Z"
              fill="#2D1014"
            />
            <path
              d="M 0 1.5 H 9 C 9 9 17.2 15.1 27.3 15.1 C 37.4 15.1 45.6 9 45.6 1.5 H 54.6"
              fill="none"
              stroke="#FFFBAA"
              strokeWidth="2.5"
            />
          </pattern>
        </defs>
        <rect width="100%" height="18" fill="url(#figma-tooth-top)" />
      </svg>
    </div>
  )
}

// нижний край
function TicketBottomEdge() {
  return (
    <div className="ticket-edge ticket-edge-bottom" aria-hidden="true">
      <svg className="ticket-svg ticket-flipped" viewBox="0 0 1920 18" preserveAspectRatio="none">
        <rect width="100%" height="18" fill="url(#figma-tooth-top)" />
      </svg>
    </div>
  )
}

export default function Home() {
  const { items, status } = useAppSelector((state) => state.movies)
  const ratings = useAppSelector((state) => state.ratings)
  const [recommendedIds, setRecommendedIds] = useState<number[]>([])

  useEffect(() => {
    if (items.length === 0 || Object.keys(ratings).length === 0) {
      return
    }
    const worker = new Worker(new URL('../recommend.worker.ts', import.meta.url), {
      type: 'module',
    })
    worker.onmessage = (event: MessageEvent<number[]>) => setRecommendedIds(event.data)
    worker.postMessage({ movies: items, ratings })
    return () => worker.terminate()
  }, [items, ratings])

  if (status === 'failed') {
    return <Alert type="error" title="Не удалось загрузить фильмы" />
  }
  if (status !== 'succeeded') {
    return <Spin />
  }

  const popular = [...items].sort((a, b) => b.rating - a.rating).slice(0, 10)
  const recommended =
    Object.keys(ratings).length > 0 && recommendedIds.length > 0
      ? items
          .filter((movie) => recommendedIds.includes(movie.id))
          .sort((a, b) => recommendedIds.indexOf(a.id) - recommendedIds.indexOf(b.id))
          .slice(0, 10)
      : popular.filter((movie) => (ratings[movie.id] ?? 10) >= 5)

  return (
    <div className="home-container">
      {/* популярное */}
      <FilmRow title="Популярное" movies={popular} minCount={1} />
      {/* рекомендации */}
      {recommended.length >= 5 && (
        <section className="home-ticket-strip">
          <TicketTopEdge />
          <div className="home-ticket-body">
            <FilmRow
              className="film-row-ticket"
              title={'РЕПЕРТУАР ПОД\nВАШ ВКУС'}
              movies={recommended}
            />
          </div>
          <TicketBottomEdge />
        </section>
      )}

      {/* остальные жанры */}
      {GENRES.map((genre) => (
        <FilmRow
          key={genre}
          title={genre.charAt(0).toUpperCase() + genre.slice(1)}
          movies={items.filter((movie) => movie.genres.includes(genre))}
        />
      ))}
    </div>
  )
}
