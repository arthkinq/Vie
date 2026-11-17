import { useEffect, useRef, useState } from 'react'
import { Link, useParams } from 'react-router'
import { Alert, Button, Spin } from 'antd'
import { drawTicket, TICKET_HEIGHT, TICKET_WIDTH } from '../lib/drawTicket'
import { useAppSelector } from '../store'
import './TicketEditor.css'

const SHAPE_W = 36
const SHAPE_H = 78

type CornerMode = 'sharp' | 'concave' | 'round'

interface ShapeOptions {
  corners: CornerMode
  cornerSize?: number
  scallops?: 'horizontal' | 'vertical'
  scallopCount?: number
  notches?: 'sides' | 'topBottom'
  notchRadius?: number
}

function ticketShapePath(
  w: number,
  h: number,
  {
    corners,
    cornerSize = 0,
    scallops,
    scallopCount = 10,
    notches,
    notchRadius = 3.5,
  }: ShapeOptions,
) {
  const k = corners === 'sharp' ? 0 : cornerSize
  const cornerSweep = corners === 'concave' ? 0 : 1
  const n = notchRadius
  const notchX = w / 3
  const sideNotchY = h / 3

  const run = (axis: 'h' | 'v', from: number, to: number, fixed: number) => {
    const step = (to - from) / scallopCount
    const r = Math.abs(step) / 2
    const parts: string[] = []
    for (let i = 1; i <= scallopCount; i += 1) {
      const pos = from + step * i
      parts.push(
        axis === 'h' ? `A ${r} ${r} 0 0 0 ${pos} ${fixed}` : `A ${r} ${r} 0 0 0 ${fixed} ${pos}`,
      )
    }
    return parts
  }

  const corner = (x: number, y: number) =>
    k === 0 ? `L ${x} ${y}` : `A ${k} ${k} 0 0 ${cornerSweep} ${x} ${y}`

  const d: string[] = [`M ${k} 0`]

  // верх
  if (scallops === 'horizontal') d.push(...run('h', k, w - k, 0))
  else {
    if (notches === 'topBottom') d.push(`H ${notchX - n}`, `A ${n} ${n} 0 0 0 ${notchX + n} 0`)
    d.push(`H ${w - k}`)
  }
  d.push(corner(w, k))

  // правая сторона
  if (scallops === 'vertical') d.push(...run('v', k, h - k, w))
  else {
    if (notches === 'sides') {
      d.push(`V ${sideNotchY - n}`, `A ${n} ${n} 0 0 0 ${w} ${sideNotchY + n}`)
    }
    d.push(`V ${h - k}`)
  }
  d.push(corner(w - k, h))

  // низ
  if (scallops === 'horizontal') d.push(...run('h', w - k, k, h))
  else {
    if (notches === 'topBottom') d.push(`H ${notchX + n}`, `A ${n} ${n} 0 0 0 ${notchX - n} ${h}`)
    d.push(`H ${k}`)
  }
  d.push(corner(0, h - k))

  // левая сторона
  if (scallops === 'vertical') d.push(...run('v', h - k, k, 0))
  else {
    if (notches === 'sides') {
      d.push(`V ${sideNotchY + n}`, `A ${n} ${n} 0 0 0 0 ${sideNotchY - n}`)
    }
    d.push(`V ${k}`)
  }
  d.push(corner(k, 0))

  d.push('Z')
  return d.join(' ')
}

const SHAPE_PATH_W = SHAPE_W - 2
const SHAPE_PATH_H = SHAPE_H - 2

const SHAPES: { title: string; path: string }[] = [
  {
    title: 'Прямоугольный билет',
    path: ticketShapePath(SHAPE_PATH_W, SHAPE_PATH_H, { corners: 'sharp' }),
  },
  {
    title: 'Билет с вырезами по бокам',
    path: ticketShapePath(SHAPE_PATH_W, SHAPE_PATH_H, {
      corners: 'concave',
      cornerSize: 6,
      scallops: 'horizontal',
      notches: 'sides',
    }),
  },
  {
    title: 'Билет с вогнутыми углами',
    path: ticketShapePath(SHAPE_PATH_W, SHAPE_PATH_H, {
      corners: 'concave',
      cornerSize: 6,
      scallops: 'horizontal',
    }),
  },
  {
    title: 'Скруглённый билет с вырезами по бокам',
    path: ticketShapePath(SHAPE_PATH_W, SHAPE_PATH_H, {
      corners: 'round',
      cornerSize: 3,
      notches: 'sides',
    }),
  },
]

// Кнопка Скачать
const DOWNLOAD_W = 133
const DOWNLOAD_H = 45
const DOWNLOAD_PATH = ticketShapePath(DOWNLOAD_W - 2, DOWNLOAD_H - 2, {
  corners: 'concave',
  cornerSize: 8,
  scallops: 'vertical',
  notches: 'topBottom',
  notchRadius: 4,
})

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
              {SHAPES.map((shape, index) => (
                <button
                  key={shape.title}
                  type="button"
                  className={`shape-btn ${selectedShape === index ? 'active' : ''}`}
                  onClick={() => setSelectedShape(index)}
                  title={shape.title}
                >
                  <svg viewBox={`0 0 ${SHAPE_W} ${SHAPE_H}`} className="shape-svg">
                    <path d={shape.path} transform="translate(1 1)" />
                  </svg>
                </button>
              ))}
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
                <svg viewBox="0 0 42 45" preserveAspectRatio="none" className="pattern-svg">
                  <defs>
                    <pattern
                      id="ticket-hatch"
                      width="8"
                      height="8"
                      patternUnits="userSpaceOnUse"
                      patternTransform="rotate(45)"
                    >
                      <rect width="4" height="8" fill="#3D2314" />
                    </pattern>
                  </defs>
                  <rect width="42" height="45" fill="url(#ticket-hatch)" />
                </svg>
              </button>
              <button
                type="button"
                className={`square-tool-btn ${selectedPattern === 2 ? 'active' : ''}`}
                onClick={() => setSelectedPattern(2)}
              >
                <svg viewBox="0 0 24 24" className="pattern-svg">
                  <polygon points="12,3 22,21 2,21" />
                </svg>
              </button>
              <button
                type="button"
                className={`square-tool-btn ${selectedPattern === 3 ? 'active' : ''}`}
                onClick={() => setSelectedPattern(3)}
                aria-label="Без узора"
              />
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
                  <span style={{ backgroundColor: '#FFFBAA' }} />
                  <span style={{ backgroundColor: '#103A3A' }} />
                  <span style={{ backgroundColor: '#920003' }} />
                  <span style={{ backgroundColor: '#103A3A' }} />
                </div>
              </button>
              <button
                type="button"
                className={`square-tool-btn palette-btn ${selectedColor === 1 ? 'active' : ''}`}
                onClick={() => setSelectedColor(1)}
              >
                <div className="palette-grid">
                  <span style={{ backgroundColor: '#103A3A' }} />
                  <span style={{ backgroundColor: '#FFFBAA' }} />
                  <span style={{ backgroundColor: '#FFFBAA' }} />
                  <span style={{ backgroundColor: '#920003' }} />
                </div>
              </button>
              <button
                type="button"
                className={`square-tool-btn palette-btn ${selectedColor === 2 ? 'active' : ''}`}
                onClick={() => setSelectedColor(2)}
              >
                <div className="palette-grid">
                  <span style={{ backgroundColor: '#FFFBAA' }} />
                  <span style={{ backgroundColor: '#920003' }} />
                  <span style={{ backgroundColor: '#920003' }} />
                  <span style={{ backgroundColor: '#103A3A' }} />
                </div>
              </button>
              <button
                type="button"
                className={`square-tool-btn palette-btn ${selectedColor === 3 ? 'active' : ''}`}
                onClick={() => setSelectedColor(3)}
              >
                <div className="palette-grid">
                  <span style={{ backgroundColor: '#920003' }} />
                  <span style={{ backgroundColor: '#103A3A' }} />
                  <span style={{ backgroundColor: '#103A3A' }} />
                  <span style={{ backgroundColor: '#FFFBAA' }} />
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
                A
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
            <Button type="primary" size="large" disabled>
              Опубликовать
            </Button>

            <button
              type="button"
              onClick={handleDownload}
              className="ticket-btn-download"
              title="Скачать билет"
            >
              <svg className="ticket-btn-download-svg" viewBox={`0 0 ${DOWNLOAD_W} ${DOWNLOAD_H}`}>
                <path
                  d={DOWNLOAD_PATH}
                  transform="translate(1 1)"
                  className="ticket-btn-download-path"
                />
              </svg>
              <span className="ticket-btn-download-label">Скачать</span>
            </button>
          </div>
        </section>
      </div>
    </div>
  )
}
