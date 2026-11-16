import { useState } from 'react'
import { Rate, Spin } from 'antd'
import { useParams } from 'react-router'
import { saveRating } from '../api'
import { useAppDispatch, useAppSelector } from '../store'
import { setRating } from '../store/ratingsSlice'
import NotFound from './NotFound'
import './Film.css'

export default function Film() {
  const id = Number(useParams().id)
  const dispatch = useAppDispatch()

  const status = useAppSelector((state) => state.movies.status)
  const movie = useAppSelector((state) => state.movies.items.find((m) => m.id === id))
  const rating = useAppSelector((state) => state.ratings[id] ?? 0)
  const token = useAppSelector((state) => state.auth.token)
  const [reviewText, setReviewText] = useState('')

  if (status === 'idle' || status === 'loading') {
    return <Spin />
  }

  if (!movie) {
    return <NotFound />
  }

  const handleRate = (value: number) => {
    dispatch(setRating({ filmId: id, value }))
  }

  const handleSubmit = async () => {
    if (!token) {
      alert('Для отправки отзыва необходимо войти в аккаунт')
      return
    }

    if (rating === 0) {
      alert('Сначала поставьте оценку фильму')
      return
    }

    try {
      await saveRating(token, id, rating, reviewText)
      alert('Ваш отзыв успешно сохранён!')
    } catch {
      alert('Не удалось сохранить отзыв. Попробуйте ещё раз.')
    }
  }

  return (
    <div className="film-page">
      <section className="film-details">
        <div className="film-poster-container">
          {movie.poster ? (
            <img
              className="film-poster"
              src={movie.poster}
              alt={`Постер фильма «${movie.title}»`}
            />
          ) : (
            <div className="film-poster-placeholder">Постер пока не добавлен</div>
          )}
        </div>

        <div className="film-information">
          <div className="film-title-row">
            <h1 className="film-title">{movie.title}</h1>

            <span className="film-bookmark" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M6 3h12v18l-6-4-6 4V3Z" />
              </svg>
            </span>
          </div>

          <div className="film-overall-rating">
            <Rate
              className="film-overall-stars"
              disabled
              allowHalf
              count={5}
              value={movie.rating / 2}
            />
            <span>{movie.rating} / 10</span>
          </div>

          <p>Год: {movie.year}</p>
          <p>Жанры: {movie.genres.join(', ')}</p>
          <p>Страна: {movie.countries.join(', ')}</p>
          <p>Режиссёр: {movie.director}</p>
        </div>
      </section>

      <p className="film-description">{movie.description}</p>

      <section className="film-rating-section">
        <div className="film-rating-header">
          <h2>Оставьте оценку</h2>

          <Rate
            className="film-user-rating"
            count={5}
            allowHalf
            value={rating / 2}
            onChange={(value) => handleRate(value * 2)}
          />
        </div>

        <textarea
          className="film-review-input"
          placeholder="Напишите свой отзыв о фильме..."
          aria-label="Отзыв о фильме"
          value={reviewText}
          onChange={(event) => setReviewText(event.target.value)}
        />

        <button className="film-review-button" type="button" onClick={handleSubmit}>
          Отправить
        </button>
      </section>

      <section className="film-reviews" aria-label="Отзывы зрителей">
        <article className="film-review">
          <div className="film-review-content">
            <h3>Алексей</h3>
            <p>Отличная ретро-атмосфера, финал шикарный!</p>
          </div>

          <Rate disabled count={5} value={5} />
        </article>

        <article className="film-review">
          <div className="film-review-content">
            <h3>Мария</h3>
            <p>
              Красивая грустная сказка, костюмы потрясающие. Но современный саундтрек местами
              выбивал из атмосферы 20-х.
            </p>
          </div>

          <Rate disabled count={5} value={4} />
        </article>
      </section>
    </div>
  )
}
