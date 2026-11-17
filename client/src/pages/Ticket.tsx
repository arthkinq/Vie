import { useState } from 'react'
import { Link } from 'react-router'
import { Alert, Button, Empty, Pagination, Spin, Typography } from 'antd'
import { FilmFrame, FilmPlaque } from '../components/FilmCard'
import { useAppSelector } from '../store'
import './Ticket.css'

const PAGE_SIZE = 12

export default function Ticket() {
  const { items, status } = useAppSelector((state) => state.movies)
  const ratings = useAppSelector((state) => state.ratings)
  const [currentPage, setCurrentPage] = useState(1)

  if (status === 'failed') {
    return <Alert type="error" title="Не удалось загрузить фильмы" />
  }

  if (status !== 'succeeded') {
    return <Spin />
  }

  const ratedMovies = items.filter((movie) => {
    const rating = ratings[movie.id]
    return typeof rating === 'number' && rating > 0
  })

  if (ratedMovies.length === 0) {
    return (
      <div className="ticket-page">
        <Typography.Title>Выберите фильм для создания билета</Typography.Title>
        <div className="ticket-empty">
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description={
              <div className="ticket-empty-text">
                <Typography.Paragraph>У вас пока нет оценённых фильмов.</Typography.Paragraph>
                <Typography.Paragraph type="secondary">
                  Оцените фильмы в каталоге, чтобы оформить памятный билет.
                </Typography.Paragraph>
              </div>
            }
          >
            <Link to="/">
              <Button type="primary">Перейти в каталог</Button>
            </Link>
          </Empty>
        </div>
      </div>
    )
  }

  const total = ratedMovies.length
  const maxPage = Math.max(1, Math.ceil(total / PAGE_SIZE))
  const page = Math.min(currentPage, maxPage)
  const startIndex = (page - 1) * PAGE_SIZE
  const currentMovies = ratedMovies.slice(startIndex, startIndex + PAGE_SIZE)

  return (
    <div className="ticket-page">
      <Typography.Title>Выберите фильм для создания билета</Typography.Title>
      <div className="ticket-grid">
        {currentMovies.map((movie) => (
          <Link key={movie.id} to={`/ticket/${movie.id}`} className="film-card">
            <FilmFrame poster={movie.poster} title={movie.title} />
            <FilmPlaque title={movie.title} year={movie.year} rating={ratings[movie.id]} />
          </Link>
        ))}
      </div>
      <div className="ticket-pagination">
        <Pagination
          current={page}
          pageSize={PAGE_SIZE}
          total={total}
          onChange={(newPage) => setCurrentPage(newPage)}
          showSizeChanger={false}
        />
      </div>
    </div>
  )
}
