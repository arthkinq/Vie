import { useEffect, useState } from 'react'
import { Alert, Spin, Typography } from 'antd'
import type { Movie } from '../api'
import FilmCard from '../components/FilmCard'
import { useAppSelector } from '../store'

function FilmRow({ title, movies }: { title: string; movies: Movie[] }) {
  return (
    <section>
      <Typography.Title level={2}>{title}</Typography.Title>
      <div className="film-row">
        {movies.map((movie) => (
          <FilmCard key={movie.id} movie={movie} />
        ))}
      </div>
    </section>
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
      : popular

  return (
    <>
      <FilmRow title="Популярное" movies={popular} />
      <FilmRow title="Репертуар под ваш вкус" movies={recommended} />
      <FilmRow title="Триллер" movies={items.filter((movie) => movie.genres.includes('триллер'))} />
    </>
  )
}
