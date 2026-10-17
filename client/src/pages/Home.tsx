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

  if (status === 'failed') {
    return <Alert type="error" title="Не удалось загрузить фильмы" />
  }
  if (status !== 'succeeded') {
    return <Spin />
  }

  return (
    <>
      <FilmRow title="Популярное" movies={items} />
      <section>
        <Typography.Title level={2}>Репертуар под ваш вкус</Typography.Title>
        <Typography.Paragraph>
          Оцените несколько фильмов, и здесь появятся рекомендации.
        </Typography.Paragraph>
      </section>
      <FilmRow title="Триллер" movies={items.filter((movie) => movie.genres.includes('триллер'))} />
    </>
  )
}
