import { useState } from 'react'
import { Button, message, Rate, Spin } from 'antd'
import { useParams } from 'react-router'
import { deleteBookmark, deleteRating, saveBookmark, saveRating } from '../api'
import { useAppDispatch, useAppSelector, useAppStore } from '../store'
import { setRating } from '../store/ratingsSlice'
import { setReview } from '../store/reviewsSlice'
import { changeBookmark } from '../store/bookmarksSlice'
import NotFound from './NotFound'
import './Film.css'

export default function Film() {
  const id = Number(useParams().id)

  return <FilmContent key={id} id={id} />
}

function FilmContent({ id }: { id: number }) {
  const dispatch = useAppDispatch()
  const appStore = useAppStore()
  const [messageApi, contextHolder] = message.useMessage()

  const status = useAppSelector((state) => state.movies.status)
  const movie = useAppSelector((state) => state.movies.items.find((m) => m.id === id))
  const rating = useAppSelector((state) => state.ratings[id] ?? 0)
  const savedReview = useAppSelector((state) => state.reviews[id])
  const username = useAppSelector((state) => state.auth.username)
  const token = useAppSelector((state) => state.auth.token)
  const isBookmarked = useAppSelector((state) => state.bookmarks.bookmarks.includes(id))

  const [reviewText, setReviewText] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSavingRating, setIsSavingRating] = useState(false)

  if (status === 'idle' || status === 'loading') {
    return <Spin />
  }

  if (!movie) {
    return <NotFound />
  }

  const handleRate = async (value: number) => {
    if (isSavingRating || isSubmitting) {
      return
    }

    setIsSavingRating(true)

    try {
      if (token) {
        if (value === 0) {
          await deleteRating(token, id)
        } else {
          await saveRating(token, id, value, savedReview)
        }
      }
      if (appStore.getState().auth.token !== token) {
        return
      }
      dispatch(setRating({ filmId: id, value }))
    } catch (error) {
      messageApi.error(error instanceof Error ? error.message : 'Не удалось сохранить оценку')
    } finally {
      setIsSavingRating(false)
    }
  }

  const handleSubmit = async () => {
    if (isSubmitting || isSavingRating) {
      return
    }

    if (!token) {
      messageApi.warning('Для отправки отзыва необходимо войти в аккаунт')
      return
    }

    if (rating === 0) {
      messageApi.warning('Сначала поставьте оценку фильму')
      return
    }

    const text = reviewText.trim()

    if (!text) {
      messageApi.warning('Напишите текст отзыва')
      return
    }

    setIsSubmitting(true)

    try {
      const result = await saveRating(token, id, rating, text)
      if (appStore.getState().auth.token !== token) {
        return
      }

      dispatch(setRating({ filmId: id, value: result.value }))
      dispatch(setReview({ filmId: id, review: result.review }))

      setReviewText('')

      messageApi.success('Ваш отзыв успешно сохранён!')
    } catch (error) {
      messageApi.error(error instanceof Error ? error.message : 'Не удалось сохранить отзыв')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleBookmark = async () => {
    dispatch(changeBookmark(id))
    if (token) {
      try {
        if (isBookmarked) {
          await deleteBookmark(token, id)
        } else {
          await saveBookmark(token, id)
        }
      } catch {
        dispatch(changeBookmark(id))
        messageApi.error('Не удалось изменить закладку. Попробуйте ещё раз.')
      }
    }
  }

  return (
    <div className="film-page">
      {contextHolder}

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

            <Button
              type="text"
              className="film-bookmark"
              onClick={handleBookmark}
              aria-label={isBookmarked ? 'Удалить из закладок' : 'Добавить в закладки'}
              icon={
                <svg
                  viewBox="0 0 24 24"
                  width="24"
                  height="24"
                  fill={isBookmarked ? 'currentColor' : 'none'}
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M6 3h12v18l-6-4-6 4V3Z" />
                </svg>
              }
            />
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
            allowClear
            disabled={isSubmitting || isSavingRating}
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
          disabled={isSubmitting}
        />

        <Button
          className="film-review-button"
          type="primary"
          htmlType="button"
          loading={isSubmitting}
          disabled={isSubmitting || isSavingRating}
          onClick={handleSubmit}
        >
          Отправить
        </Button>
      </section>

      <section className="film-reviews" aria-label="Отзывы зрителей">
        {token && savedReview && (
          <article className="film-review">
            <div className="film-review-content">
              <h3>{username || 'Ваш отзыв'}</h3>
              <p>{savedReview}</p>
            </div>

            <Rate disabled allowHalf count={5} value={rating / 2} />
          </article>
        )}
      </section>
    </div>
  )
}
