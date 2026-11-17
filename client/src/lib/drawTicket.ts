import type { Movie } from '../api'

export type TicketShape = 'classic' | 'serrated' | 'rectangular' | 'notched-serrated'
export type TicketPattern = 'stars' | 'stripes' | 'triangles' | 'none'
export type TicketPalette = 'cream-gold' | 'dark-teal' | 'monochrome' | 'red-vintage'

/*export interface TicketStyleOptions {
  shape: TicketShape
  pattern: TicketPattern
  palette: TicketPalette
  fontFamily: string
}

export interface TicketUserData {
  userRating?: number
  review?: string
  status?: string
  date?: string
  seat?: string
}

export interface PaletteColors {
  ticketBg: string // Цвет бумаги билета
  primary: string // Цвет крупного названия фильма и логотипа
  accent: string // Цвет декоративной рамки, подзаголовка и рамок блоков
}

export const TICKET_WIDTH = 920
export const TICKET_HEIGHT = 380
export const TEAR_X = 665 // Позиция отрывной линии

export const TICKET_STATIC_COLORS = {
  inkText: '#182538', // Текст внутри плашек
  pattern: 'rgba(212, 163, 70, 0.16)', // Узор
  whiteBox: '#FFFFFF', // Белая подложка
}

export const PALETTES: Record<TicketPalette, PaletteColors> = {
  'cream-gold': {
    ticketBg: '#FDF1B8',
    primary: '#103A3A',
    accent: '#8C1818',
  },
  'dark-teal': {
    ticketBg: '#103A3A',
    primary: '#8C1818',
    accent: '#FDF1B8',
  },
  monochrome: {
    ticketBg: '#FFFFFF',
    primary: '#103A3A',
    accent: '#8C1818',
  },
  'red-vintage': {
    ticketBg: '#8A1414',
    primary: '#FDF1B8',
    accent: '#99dfdf',
  },
}*/

export interface TicketDrawData {
  title: string
  year?: number
  genres?: string[]
  ageRating?: string
  rating?: number
  status?: string
  dateTime?: string
  seat?: string
  review?: string
}

export const TICKET_WIDTH = 840
export const TICKET_HEIGHT = 380

/**
 * Отрисовка базовой формы билета со скруглениями и вырезами перфорации
 */
function drawTicketShape(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  tearX: number,
  notchRadius: number,
  cornerRadius: number,
) {
  ctx.beginPath()

  // Верхний левый угол
  ctx.moveTo(cornerRadius, 0)

  // Верхний край до выреза
  ctx.lineTo(tearX - notchRadius, 0)
  // Верхний круглый вырез перфорации
  ctx.arc(tearX, 0, notchRadius, Math.PI, 0, true)
  // Верхний край после выреза
  ctx.lineTo(width - cornerRadius, 0)

  // Верхний правый угол
  ctx.arc(width - cornerRadius, cornerRadius, cornerRadius, -Math.PI / 2, 0)

  // Правый край
  ctx.lineTo(width, height - cornerRadius)

  // Нижний правый угол
  ctx.arc(width - cornerRadius, height - cornerRadius, cornerRadius, 0, Math.PI / 2)

  // Нижний край до выреза
  ctx.lineTo(tearX + notchRadius, height)
  // Нижний круглый вырез перфорации
  ctx.arc(tearX, height, notchRadius, 0, Math.PI, true)
  // Нижний край после выреза
  ctx.lineTo(cornerRadius, height)

  // Нижний левый угол
  ctx.arc(cornerRadius, height - cornerRadius, cornerRadius, Math.PI / 2, Math.PI)

  // Левый край
  ctx.lineTo(0, cornerRadius)

  // Верхний левый угол
  ctx.arc(cornerRadius, cornerRadius, cornerRadius, Math.PI, -Math.PI / 2)

  ctx.closePath()
}

/**
 * Вспомогательная функция для рисования рамочек с полями (Статус, Оценка, Дата, Отзыв)
 */
function drawFieldBox(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  label: string,
  value: string,
  isMultiline = false,
) {
  // Подпись над полем
  ctx.fillStyle = '#0F382C'
  ctx.font = 'bold 13px sans-serif'
  ctx.fillText(label, x, y - 6)

  // Прямоугольник поля
  ctx.fillStyle = '#FDFDF7'
  ctx.fillRect(x, y, w, h)
  ctx.strokeStyle = '#C9A96E'
  ctx.lineWidth = 1
  ctx.strokeRect(x, y, w, h)

  // Текст внутри поля
  ctx.fillStyle = '#0F382C'
  if (!isMultiline) {
    ctx.font = '13px sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText(value, x + w / 2, y + h / 2 + 5)
    ctx.textAlign = 'left'
  } else {
    ctx.font = '11px sans-serif'
    const lines = value.split('\n')
    let lineY = y + 15
    for (const line of lines) {
      if (lineY > y + h - 6) break
      ctx.fillText(line, x + 6, lineY)
      lineY += 14
    }
  }
}

/**
 * Чистая функция отрисовки билета на Canvas
 */
export function drawTicket(
  ctx: CanvasRenderingContext2D,
  data: TicketDrawData,
  width = TICKET_WIDTH,
  height = TICKET_HEIGHT,
) {
  const tearX = 610
  const notchRadius = 24
  const cornerRadius = 22

  ctx.clearRect(0, 0, width, height)

  // 1. Фоновая геометрия билета
  drawTicketShape(ctx, width, height, tearX, notchRadius, cornerRadius)
  ctx.fillStyle = '#F8F1D8'
  ctx.fill()
  ctx.strokeStyle = '#D8BF89'
  ctx.lineWidth = 2
  ctx.stroke()

  // 2. Линия перфорации
  ctx.save()
  ctx.setLineDash([6, 6])
  ctx.strokeStyle = '#B38E5B'
  ctx.lineWidth = 1.5
  ctx.beginPath()
  ctx.moveTo(tearX, notchRadius + 4)
  ctx.lineTo(tearX, height - notchRadius - 4)
  ctx.stroke()
  ctx.restore()

  // 3. Декоративная рамка левой части билета
  ctx.strokeStyle = '#A33327'
  ctx.lineWidth = 1.5
  ctx.strokeRect(24, 24, tearX - 44, height - 48)

  // 4. Заголовок фильма
  ctx.fillStyle = '#0F382C'
  ctx.font = 'bold 26px sans-serif'
  const titleText = (data.title || 'НАЗВАНИЕ ФИЛЬМА').toUpperCase()
  ctx.fillText(titleText, 40, 60, tearX - 80)

  // 5. Мета-данные: Год • Жанры • Возраст
  const genresStr = data.genres && data.genres.length > 0 ? data.genres.join(', ') : 'Кино'
  const yearStr = data.year ? `${data.year}` : '2024'
  const ageStr = data.ageRating ?? '12+'
  ctx.fillStyle = '#A33327'
  ctx.font = 'bold 12px sans-serif'
  ctx.fillText(`${yearStr} • ${genresStr} • ${ageStr}`, 40, 84, tearX - 80)

  // 6. Поля данных: Статус и Оценка
  const statusVal = data.status ?? 'Любимый'
  const ratingVal = data.rating !== undefined ? `${data.rating}/10` : '—'
  drawFieldBox(ctx, 40, 115, 85, 26, 'Статус', statusVal)
  drawFieldBox(ctx, 135, 115, 65, 26, 'Оценка', ratingVal)

  // 7. Дата / Время
  const dateVal = data.dateTime ?? '22.11.2024 | 19:30:28'
  drawFieldBox(ctx, 40, 175, 160, 26, 'Дата/Время', dateVal)

  // 8. Место
  const seatVal = data.seat ?? '22 ряд 55 место'
  drawFieldBox(ctx, 40, 235, 160, 26, 'Место', seatVal)

  // 9. Блок Отзыва
  const defaultReview =
    data.review ||
    'Отличный фильм с великолепной режиссурой и глубоким сюжетом.\n' +
      'Оставляет незабываемое впечатление после просмотра.\n' +
      'Рекомендуется к просмотру всем ценителям классики.'
  drawFieldBox(ctx, 220, 115, 345, 146, 'Отзыв', defaultReview, true)

  // 10. Правый корешок: декоративная рамка
  ctx.strokeStyle = '#A33327'
  ctx.lineWidth = 1.5
  ctx.strokeRect(tearX + 20, 24, width - tearX - 44, height - 48)

  // Тексты на корешке
  ctx.textAlign = 'center'
  ctx.fillStyle = '#0F382C'
  ctx.font = '900 24px serif'
  ctx.fillText('VIE', tearX + (width - tearX) / 2, 60)

  ctx.fillStyle = '#A33327'
  ctx.font = 'bold 11px sans-serif'
  ctx.fillText('Ретро архив', tearX + (width - tearX) / 2, 78)
  ctx.fillText('фильмов', tearX + (width - tearX) / 2, 92)

  ctx.fillStyle = '#0F382C'
  ctx.font = '12px sans-serif'
  ctx.fillText('itmo.vie.ru', tearX + (width - tearX) / 2, 114)

  // Заглушка под QR-код
  const qrBoxSize = 100
  const qrX = tearX + (width - tearX) / 2 - qrBoxSize / 2
  const qrY = 130
  ctx.fillStyle = '#FFFFFF'
  ctx.fillRect(qrX, qrY, qrBoxSize, qrBoxSize)
  ctx.strokeStyle = '#C9A96E'
  ctx.lineWidth = 1
  ctx.strokeRect(qrX, qrY, qrBoxSize, qrBoxSize)

  // Подпись под QR-кодом
  ctx.fillStyle = '#A33327'
  ctx.font = '10px sans-serif'
  ctx.fillText('Отсканируй,', tearX + (width - tearX) / 2, 256)
  ctx.fillText('чтобы оставить', tearX + (width - tearX) / 2, 270)
  ctx.fillText('свой отзыв', tearX + (width - tearX) / 2, 284)

  ctx.textAlign = 'left'
}
