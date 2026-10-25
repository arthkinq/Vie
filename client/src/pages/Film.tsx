import { Rate, Spin, Typography } from 'antd'
import { useParams } from 'react-router'
import { useAppDispatch, useAppSelector } from '../store'
import { setRating } from '../store/ratingsSlice'
import NotFound from './NotFound'

export default function Film() {
  const id = Number(useParams().id)
  const dispatch = useAppDispatch()
  const status = useAppSelector((state) => state.movies.status)
  const movie = useAppSelector((state) => state.movies.items.find((m) => m.id === id))
  const rating = useAppSelector((state) => state.ratings[id] ?? 0)

  if (status === 'idle' || status === 'loading') {
    return <Spin />
  }
  if (!movie) {
    return <NotFound />
  }

  return (
    <div>
      <Typography.Title>{movie.title}</Typography.Title>
      <Typography.Paragraph>Год: {movie.year}</Typography.Paragraph>
      <Typography.Paragraph>Жанры: {movie.genres.join(', ')}</Typography.Paragraph>
      <Typography.Paragraph>Страна: {movie.countries.join(', ')}</Typography.Paragraph>
      <Typography.Paragraph>Режиссёр: {movie.director}</Typography.Paragraph>
      <Typography.Paragraph>{movie.description}</Typography.Paragraph>
      <Typography.Title level={3}>Оставьте оценку</Typography.Title>
      <Rate
        count={10}
        value={rating}
        onChange={(value) => dispatch(setRating({ filmId: id, value }))}
      />
    </div>
  )
}
