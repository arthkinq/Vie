import { useEffect, useRef, useState } from 'react'
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

  const [selectedShape, setSelectedShape] = useState<number>(0)
  const [selectedPattern, setSelectedPattern] = useState<number>(0)
  const [selectedColor, setSelectedColor] = useState<number>(0)
  const [selectedFont, setSelectedFont] = useState<number>(0)

  const movieId = id ? Number(id) : NaN
  const movie = items.find((m) => m.id === movieId)
  const userRating = movie ? ratings[movie.id] : undefined

  useEffect(() => {
    if (!movie || !canvasRef.current) return

    const render = () => {
      const canvas = canvasRef.current
      const ctx = canvas?.getContext('2d')
      if (!ctx) return

      drawTicket(ctx, {
        title: movie.title,
        year: movie.year,
        genres: movie.genres,
        rating: userRating ?? movie.rating,
      })
    }

    render()
    document.fonts?.ready.then(render)
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
      <div className="ticket-editor-layout">
        {/* Левая панель */}
        <aside className="ticket-customizer-panel">
          {/* Секция: Форма */}
          <div className="customizer-section">
            <h4 className="customizer-title">Форма</h4>
            <div className="customizer-row shapes-row">
              {/* Форма 1: Прямой прямоугольник с рамкой */}
              <button
                type="button"
                className={`shape-btn ${selectedShape === 0 ? 'active' : ''}`}
                onClick={() => setSelectedShape(0)}
                title="Прямоугольный билет"
              >
                <svg viewBox="0 0 28 56" className="shape-svg">
                  <rect x="2" y="2" width="24" height="52" rx="1" />
                </svg>
              </button>

              {/* Форма 2: Зубчатые верх/низ + боковые вырезы */}
              <button
                type="button"
                className={`shape-btn ${selectedShape === 1 ? 'active' : ''}`}
                onClick={() => setSelectedShape(1)}
                title="Зубчатый билет с вырезами"
              >
                <svg viewBox="0 0 28 56" className="shape-svg">
                  <path d="M 2 8 A 4 4 0 0 0 6 2 H 8 A 2 2 0 0 0 10 2 H 12 A 2 2 0 0 0 14 2 H 16 A 2 2 0 0 0 18 2 H 20 A 2 2 0 0 0 22 2 H 22 A 4 4 0 0 0 26 8 V 23 A 5 5 0 0 0 26 33 V 48 A 4 4 0 0 0 22 54 H 20 A 2 2 0 0 0 18 54 H 16 A 2 2 0 0 0 14 54 H 12 A 2 2 0 0 0 10 54 H 8 A 2 2 0 0 0 6 54 A 4 4 0 0 0 2 48 V 33 A 5 5 0 0 0 2 23 Z" />
                </svg>
              </button>

              {/* Форма 3: Зубчатые верх/низ без боковых вырезов */}
              <button
                type="button"
                className={`shape-btn ${selectedShape === 2 ? 'active' : ''}`}
                onClick={() => setSelectedShape(2)}
                title="Зубчатый билет"
              >
                <svg viewBox="0 0 28 56" className="shape-svg">
                  <path d="M 2 8 A 4 4 0 0 0 6 2 H 8 A 2 2 0 0 0 10 2 H 12 A 2 2 0 0 0 14 2 H 16 A 2 2 0 0 0 18 2 H 20 A 2 2 0 0 0 22 2 H 22 A 4 4 0 0 0 26 8 V 48 A 4 4 0 0 0 22 54 H 20 A 2 2 0 0 0 18 54 H 16 A 2 2 0 0 0 14 54 H 12 A 2 2 0 0 0 10 54 H 8 A 2 2 0 0 0 6 54 A 4 4 0 0 0 2 48 Z" />
                </svg>
              </button>

              {/* Форма 4: Скругленный со средними вырезами */}
              <button
                type="button"
                className={`shape-btn ${selectedShape === 3 ? 'active' : ''}`}
                onClick={() => setSelectedShape(3)}
                title="Скругленный билет с вырезами"
              >
                <svg viewBox="0 0 28 56" className="shape-svg">
                  <path d="M 2 6 Q 2 2 6 2 H 22 Q 26 2 26 6 V 23 A 5 5 0 0 0 26 33 V 50 Q 26 54 22 54 H 6 Q 2 54 2 50 V 33 A 5 5 0 0 0 2 23 Z" />
                </svg>
              </button>
            </div>
          </div>

          {/* Секция: Узор */}
          <div className="customizer-section">
            <h4 className="customizer-title">Узор</h4>
            <div className="customizer-row">
              <button
                type="button"
                className={`square-tool-btn ${selectedPattern === 0 ? 'active' : ''}`}
                onClick={() => setSelectedPattern(0)}
              >
                <svg viewBox="0 0 24 24" className="pattern-svg">
                  <polygon points="12,2 15,9 22,9 17,14 19,21 12,17 5,21 7,14 2,9 9,9" />
                </svg>
              </button>
              <button
                type="button"
                className={`square-tool-btn ${selectedPattern === 1 ? 'active' : ''}`}
                onClick={() => setSelectedPattern(1)}
              >
                <svg viewBox="0 0 24 24" className="pattern-svg">
                  <line x1="2" y1="22" x2="22" y2="2" stroke="currentColor" strokeWidth="3" />
                  <line x1="0" y1="12" x2="12" y2="0" stroke="currentColor" strokeWidth="3" />
                  <line x1="12" y1="24" x2="24" y2="12" stroke="currentColor" strokeWidth="3" />
                </svg>
              </button>
              <button
                type="button"
                className={`square-tool-btn ${selectedPattern === 2 ? 'active' : ''}`}
                onClick={() => setSelectedPattern(2)}
              >
                <svg viewBox="0 0 24 24" className="pattern-svg">
                  <polygon points="12,4 21,20 3,20" />
                </svg>
              </button>
              <button
                type="button"
                className={`square-tool-btn ${selectedPattern === 3 ? 'active' : ''}`}
                onClick={() => setSelectedPattern(3)}
              >
                <div className="solid-pattern-box" />
              </button>
            </div>
          </div>

          {/* Секция: Цвет */}
          <div className="customizer-section">
            <h4 className="customizer-title">Цвет</h4>
            <div className="customizer-row">
              <button
                type="button"
                className={`square-tool-btn palette-btn ${selectedColor === 0 ? 'active' : ''}`}
                onClick={() => setSelectedColor(0)}
              >
                <div className="palette-grid">
                  <span style={{ backgroundColor: '#FCF1D1' }} />
                  <span style={{ backgroundColor: '#0D382B' }} />
                  <span style={{ backgroundColor: '#8B1E19' }} />
                  <span style={{ backgroundColor: '#0D382B' }} />
                </div>
              </button>
              <button
                type="button"
                className={`square-tool-btn palette-btn ${selectedColor === 1 ? 'active' : ''}`}
                onClick={() => setSelectedColor(1)}
              >
                <div className="palette-grid">
                  <span style={{ backgroundColor: '#0D382B' }} />
                  <span style={{ backgroundColor: '#FCF1D1' }} />
                  <span style={{ backgroundColor: '#FCF1D1' }} />
                  <span style={{ backgroundColor: '#8B1E19' }} />
                </div>
              </button>
              <button
                type="button"
                className={`square-tool-btn palette-btn ${selectedColor === 2 ? 'active' : ''}`}
                onClick={() => setSelectedColor(2)}
              >
                <div className="palette-grid">
                  <span style={{ backgroundColor: '#FCF1D1' }} />
                  <span style={{ backgroundColor: '#8B1E19' }} />
                  <span style={{ backgroundColor: '#8B1E19' }} />
                  <span style={{ backgroundColor: '#FCF1D1' }} />
                </div>
              </button>
              <button
                type="button"
                className={`square-tool-btn palette-btn ${selectedColor === 3 ? 'active' : ''}`}
                onClick={() => setSelectedColor(3)}
              >
                <div className="palette-grid">
                  <span style={{ backgroundColor: '#8B1E19' }} />
                  <span style={{ backgroundColor: '#0D382B' }} />
                  <span style={{ backgroundColor: '#0D382B' }} />
                  <span style={{ backgroundColor: '#FCF1D1' }} />
                </div>
              </button>
            </div>
          </div>

          {/* Секция: Шрифт */}
          <div className="customizer-section">
            <h4 className="customizer-title">Шрифт</h4>
            <div className="customizer-row">
              <button
                type="button"
                className={`square-tool-btn font-btn font-style-1 ${selectedFont === 0 ? 'active' : ''}`}
                onClick={() => setSelectedFont(0)}
              >
                Å
              </button>
              <button
                type="button"
                className={`square-tool-btn font-btn font-style-2 ${selectedFont === 1 ? 'active' : ''}`}
                onClick={() => setSelectedFont(1)}
              >
                A
              </button>
              <button
                type="button"
                className={`square-tool-btn font-btn font-style-3 ${selectedFont === 2 ? 'active' : ''}`}
                onClick={() => setSelectedFont(2)}
              >
                A
              </button>
              <button
                type="button"
                className={`square-tool-btn font-btn font-style-4 ${selectedFont === 3 ? 'active' : ''}`}
                onClick={() => setSelectedFont(3)}
              >
                A
              </button>
            </div>
          </div>
        </aside>

        {/* Правая часть */}
        <section className="ticket-display-container">
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

            <button
              type="button"
              onClick={handleDownload}
              className="ticket-btn-download"
              title="Скачать билет"
            >
              <svg className="ticket-btn-download-svg" viewBox="0 0 200 70">
                <path
                  d="
                    M 0 12
                    A 12 12 0 0 0 12 0
                    H 88
                    A 12 12 0 0 0 112 0
                    H 188
                    A 12 12 0 0 0 200 12
                    A 4.5 4.5 0 0 0 200 21
                    A 4.5 4.5 0 0 0 200 30
                    A 4.5 4.5 0 0 0 200 39
                    A 4.5 4.5 0 0 0 200 48
                    A 4.5 4.5 0 0 0 200 58
                    L 200 58
                    A 12 12 0 0 0 188 70
                    H 112
                    A 12 12 0 0 0 88 70
                    H 12
                    A 12 12 0 0 0 0 58
                    A 4.5 4.5 0 0 0 0 49
                    A 4.5 4.5 0 0 0 0 40
                    A 4.5 4.5 0 0 0 0 31
                    A 4.5 4.5 0 0 0 0 22
                    A 4.5 4.5 0 0 0 0 12
                    Z
                  "
                  fill="#FFFAB3"
                  stroke="#8B0000"
                  strokeWidth="3"
                />
              </svg>
              <span className="ticket-btn-download-label">СКАЧАТЬ</span>
            </button>
          </div>
        </section>
      </div>
    </div>
  )
}
