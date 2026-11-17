import { useEffect, useRef } from 'react'
import { Link, useParams } from 'react-router'
import { Alert, Button, Spin } from 'antd'
import { drawTicket, TICKET_HEIGHT, TICKET_WIDTH } from '../lib/drawTicket'
import { useAppSelector } from '../store'
import './TicketEditor.css'

export default function TicketEditor() {
  const { id } = useParams<{ id: string }>()
  const canvasRef = useRef<HTMLCanvasElement | null>(null)

  const { items, status } = useAppSelector((state) => state.movies)
  const ratings = useAppSelector((state) => state.ratings)

  const movieId = id ? Number(id) : NaN
  const movie = items.find((m) => m.id === movieId)
  const userRating = movie ? ratings[movie.id] : undefined

  useEffect(() => {
    if (!movie || !canvasRef.current) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    drawTicket(ctx, {
      title: movie.title,
      year: movie.year,
      genres: movie.genres,
      rating: userRating ?? movie.rating,
    })
  }, [movie, userRating])

  const handleDownload = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    canvas.toBlob((blob) => {
      if (!blob) return
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.download = `ticket-${movie?.id ?? 'custom'}.png`
      link.href = url
      link.click()
      URL.revokeObjectURL(url)
    })
  }

  if (status === 'failed') {
    return <Alert type="error" title="Не удалось загрузить фильм" />
  }

  if (status !== 'succeeded') {
    return <Spin />
  }

  if (!movie) {
    return (
      <div className="ticket-editor-not-found">
        <Alert
          type="warning"
          title="Фильм не найден"
          description="Возможно, он был удалён или ссылка неверна."
          action={
            <Link to="/ticket">
              <Button type="primary">Назад к выбору</Button>
            </Link>
          }
        />
      </div>
    )
  }

  return (
    <div className="ticket-editor-page">
      <div className="ticket-editor-canvas-wrapper">
        <canvas
          ref={canvasRef}
          width={TICKET_WIDTH}
          height={TICKET_HEIGHT}
          className="ticket-editor-canvas"
        />
      </div>

      <div className="ticket-editor-actions">
        <Button type="primary" size="large" className="ticket-btn-publish" disabled>
          ОПУБЛИКОВАТЬ
        </Button>

        <button type="button" onClick={handleDownload} className="ticket-btn-download">
          СКАЧАТЬ
        </button>
      </div>
    </div>
  )
}
