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

const BODY_FONT = '"Roboto Serif", Georgia, serif'

/**
 * Разбиение текста на строки с учетом максимальной ширины блока
 */
function wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const resultLines: string[] = []
  const paragraphs = text.split('\n')

  for (const para of paragraphs) {
    const words = para.split(' ')
    let currentLine = ''

    for (const word of words) {
      const testLine = currentLine ? `${currentLine} ${word}` : word
      if (ctx.measureText(testLine).width > maxWidth && currentLine) {
        resultLines.push(currentLine)
        currentLine = word
      } else {
        currentLine = testLine
      }
    }
    if (currentLine) {
      resultLines.push(currentLine)
    }
  }

  return resultLines
}

function drawTicketShape(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  tearX: number,
  notchRadius: number,
  cornerRadius: number,
) {
  ctx.beginPath()
  ctx.moveTo(cornerRadius, 0)
  ctx.lineTo(tearX - notchRadius, 0)
  ctx.arc(tearX, 0, notchRadius, Math.PI, 0, true)
  ctx.lineTo(width - cornerRadius, 0)
  ctx.arc(width - cornerRadius, cornerRadius, cornerRadius, -Math.PI / 2, 0)
  ctx.lineTo(width, height - cornerRadius)
  ctx.arc(width - cornerRadius, height - cornerRadius, cornerRadius, 0, Math.PI / 2)
  ctx.lineTo(tearX + notchRadius, height)
  ctx.arc(tearX, height, notchRadius, 0, Math.PI, true)
  ctx.lineTo(cornerRadius, height)
  ctx.arc(cornerRadius, height - cornerRadius, cornerRadius, Math.PI / 2, Math.PI)
  ctx.lineTo(0, cornerRadius)
  ctx.arc(cornerRadius, cornerRadius, cornerRadius, Math.PI, -Math.PI / 2)
  ctx.closePath()
}

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
  ctx.font = `600 12px ${BODY_FONT}`
  ctx.fillText(label, x, y - 5)

  // Прямоугольник ячейки
  ctx.fillStyle = '#FDFDF7'
  ctx.fillRect(x, y, w, h)
  ctx.strokeStyle = '#C9A96E'
  ctx.lineWidth = 1
  ctx.strokeRect(x, y, w, h)

  // Текст внутри ячейки
  ctx.fillStyle = '#0F382C'
  if (!isMultiline) {
    ctx.font = `400 12px ${BODY_FONT}`
    ctx.textAlign = 'center'
    ctx.fillText(value, x + w / 2, y + h / 2 + 4)
    ctx.textAlign = 'left'
  } else {
    ctx.font = `400 11px ${BODY_FONT}`
    // Вычисляем допустимую ширину строки с отступами слева и справа
    const maxTextWidth = w - 16
    const lines = wrapText(ctx, value, maxTextWidth)

    let lineY = y + 16
    for (const line of lines) {
      if (lineY > y + h - 6) break // Не вылезаем за нижний край рамки
      ctx.fillText(line, x + 8, lineY)
      lineY += 15
    }
  }
}

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

  // 1. Геометрия билета
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

  // 3. Декоративная рамка левой части
  ctx.strokeStyle = '#A33327'
  ctx.lineWidth = 1.5
  ctx.strokeRect(24, 24, tearX - 44, height - 48)

  // 4. Заголовок фильма
  ctx.fillStyle = '#0F382C'
  ctx.font = 'bold 26px sans-serif'
  const titleText = (data.title || 'НАЗВАНИЕ ФИЛЬМА').toUpperCase()
  ctx.fillText(titleText, 40, 60, tearX - 80)

  // 5. Мета-данные
  const genresStr = data.genres && data.genres.length > 0 ? data.genres.join(', ') : 'Кино'
  const yearStr = data.year ? `${data.year}` : '2024'
  const ageStr = data.ageRating ?? '12+'
  ctx.fillStyle = '#A33327'
  ctx.font = `600 12px ${BODY_FONT}`
  ctx.fillText(`${yearStr} • ${genresStr} • ${ageStr}`, 40, 84, tearX - 80)

  // 6. Поля данных
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
    'Отличный фильм с великолепной режиссурой и глубоким сюжетом. ' +
      'Оставляет незабываемое впечатление после просмотра. ' +
      'Рекомендуется к просмотру всем ценителям классики.'
  drawFieldBox(ctx, 220, 115, 345, 146, 'Отзыв', defaultReview, true)

  // 10. Правый корешок
  ctx.strokeStyle = '#A33327'
  ctx.lineWidth = 1.5
  ctx.strokeRect(tearX + 20, 24, width - tearX - 44, height - 48)

  ctx.textAlign = 'center'
  ctx.fillStyle = '#0F382C'
  ctx.font = '900 24px serif'
  ctx.fillText('VIE', tearX + (width - tearX) / 2, 60)

  ctx.fillStyle = '#A33327'
  ctx.font = `600 11px ${BODY_FONT}`
  ctx.fillText('Ретро архив', tearX + (width - tearX) / 2, 78)
  ctx.fillText('фильмов', tearX + (width - tearX) / 2, 92)

  ctx.fillStyle = '#0F382C'
  ctx.font = `400 12px ${BODY_FONT}`
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

  ctx.fillStyle = '#A33327'
  ctx.font = `400 10px ${BODY_FONT}`
  ctx.fillText('Отсканируй,', tearX + (width - tearX) / 2, 256)
  ctx.fillText('чтобы оставить', tearX + (width - tearX) / 2, 270)
  ctx.fillText('свой отзыв', tearX + (width - tearX) / 2, 284)

  ctx.textAlign = 'left'
}
