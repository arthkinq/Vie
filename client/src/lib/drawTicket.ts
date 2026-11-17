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

export const TICKET_WIDTH = 863
export const TICKET_HEIGHT = 385

// Основные цвета билета
const COLOR_BG = '#FFFBAA'
const COLOR_GREEN = '#103A3A'
const COLOR_RED = '#920003'

// Шрифты. Заголовочный шрифт в будущем будет настраиваемым, пока фиксированный
const BODY_FONT = '"Roboto Serif", Georgia, serif'
const HEADING_FONT = '"Sofia Sans Extra Condensed", "Oswald", sans-serif'

const TEAR_X = 618 // центр промежутка между рамками
const NOTCH_RADIUS = 18
const CORNER_RADIUS = 32
const FRAME_RADIUS = 30
const FRAME_PADDING = 30
const FRAME_GAP = 74
const FRAME_TOP = FRAME_PADDING
const FRAME_HEIGHT = TICKET_HEIGHT - FRAME_PADDING * 2 // 325
const LEFT_FRAME_X = FRAME_PADDING
const LEFT_FRAME_W = 551
const RIGHT_FRAME_X = LEFT_FRAME_X + LEFT_FRAME_W + FRAME_GAP // 655
const RIGHT_FRAME_W = TICKET_WIDTH - FRAME_PADDING - RIGHT_FRAME_X // 178

const CONTENT_INSET = 36 // отступ содержимого от внутренней рамки
const HEADLINE_BASELINE = 88 // общая базовая линия названия и «VIE»

/**
 * Отрисовка скругленного прямоугольника
 */
function drawRoundedRectPath(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.lineTo(x + w - r, y)
  ctx.arc(x + w - r, y + r, r, -Math.PI / 2, 0)
  ctx.lineTo(x + w, y + h - r)
  ctx.arc(x + w - r, y + h - r, r, 0, Math.PI / 2)
  ctx.lineTo(x + r, y + h)
  ctx.arc(x + r, y + h - r, r, Math.PI / 2, Math.PI)
  ctx.lineTo(x, y + r)
  ctx.arc(x + r, y + r, r, Math.PI, -Math.PI / 2)
  ctx.closePath()
}

/**
 * Внешний контур билета со скруглениями и круглыми вырезами на линии отрыва
 */
function drawTicketOuterShape(
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
    if (currentLine) resultLines.push(currentLine)
  }

  return resultLines
}

/**
 * Обрезает текст
 */
function fitText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string {
  if (maxWidth <= 0) return ''
  if (ctx.measureText(text).width <= maxWidth) return text

  let result = text
  while (result.length > 1 && ctx.measureText(`${result}…`).width > maxWidth) {
    result = result.slice(0, -1)
  }
  return `${result.trimEnd()}…`
}

/**
 * Поле с подписью.
 */
function drawField(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  label: string,
  value: string,
  isMultiline = false,
) {
  // 1. Подпись
  ctx.fillStyle = COLOR_GREEN
  ctx.font = `400 17px ${BODY_FONT}`
  ctx.textAlign = 'left'
  ctx.fillText(label, x, y - 4)

  // 2. Блок значения
  ctx.fillStyle = '#FFFFFF'
  ctx.fillRect(x, y, w, h)
  ctx.strokeStyle = COLOR_RED
  ctx.lineWidth = 1
  ctx.strokeRect(x + 0.5, y + 0.5, w - 1, h - 1)

  // 3. Текст значения
  ctx.fillStyle = COLOR_GREEN
  if (!isMultiline) {
    ctx.font = `400 13px ${BODY_FONT}`
    ctx.textAlign = 'center'
    ctx.fillText(fitText(ctx, value, w - 12), x + w / 2, y + h / 2 + 4.5)
    ctx.textAlign = 'left'
  } else {
    ctx.font = `400 11px ${BODY_FONT}`
    const lines = wrapText(ctx, value, w - 16)
    let lineY = y + 17
    for (const line of lines) {
      if (lineY > y + h - 6) break
      ctx.fillText(line, x + 8, lineY)
      lineY += 13
    }
  }
}

/**
 * Строка год - жанры - возраст
 */
function drawMetaLine(
  ctx: CanvasRenderingContext2D,
  x: number,
  baseline: number,
  maxWidth: number,
  year: string,
  genres: string,
  age: string,
) {
  const dotSize = 8
  const gap = 8

  ctx.font = `400 14px ${BODY_FONT}`
  ctx.textAlign = 'left'

  const yearW = ctx.measureText(year).width
  const ageW = ctx.measureText(age).width
  const reserved = yearW + ageW + (gap + dotSize + gap) * 2
  const genresText = fitText(ctx, genres, maxWidth - reserved)
  const genresW = ctx.measureText(genresText).width

  const drawDot = (dotX: number) => {
    ctx.beginPath()
    ctx.arc(dotX + dotSize / 2, baseline - 5, dotSize / 2, 0, Math.PI * 2)
    ctx.fillStyle = COLOR_RED
    ctx.fill()
  }

  let cursor = x
  ctx.fillStyle = COLOR_RED
  ctx.fillText(year, cursor, baseline)
  cursor += yearW + gap
  drawDot(cursor)
  cursor += dotSize + gap

  ctx.fillStyle = COLOR_RED
  ctx.fillText(genresText, cursor, baseline)
  cursor += genresW + gap
  drawDot(cursor)
  cursor += dotSize + gap

  ctx.fillStyle = COLOR_RED
  ctx.fillText(age, cursor, baseline)
}

export function drawTicket(
  ctx: CanvasRenderingContext2D,
  data: TicketDrawData,
  width = TICKET_WIDTH,
  height = TICKET_HEIGHT,
) {
  ctx.clearRect(0, 0, width, height)

  // Фон билета
  drawTicketOuterShape(ctx, width, height, TEAR_X, NOTCH_RADIUS, CORNER_RADIUS)
  ctx.fillStyle = COLOR_BG
  ctx.fill()

  // Внутренние красные рамки
  ctx.strokeStyle = COLOR_RED
  ctx.lineWidth = 3
  drawRoundedRectPath(ctx, LEFT_FRAME_X, FRAME_TOP, LEFT_FRAME_W, FRAME_HEIGHT, FRAME_RADIUS)
  ctx.stroke()
  drawRoundedRectPath(ctx, RIGHT_FRAME_X, FRAME_TOP, RIGHT_FRAME_W, FRAME_HEIGHT, FRAME_RADIUS)
  ctx.stroke()

  // Заголовок фильма
  const contentX = LEFT_FRAME_X + CONTENT_INSET
  const contentW = LEFT_FRAME_W - CONTENT_INSET * 2

  ctx.textAlign = 'left'
  ctx.fillStyle = COLOR_GREEN
  ctx.font = `700 32px ${HEADING_FONT}`
  const titleText = fitText(ctx, (data.title || 'INTERSTELLAR').toUpperCase(), contentW)
  ctx.fillText(titleText, contentX, HEADLINE_BASELINE)

  // Мета-данные
  const genresStr = data.genres && data.genres.length > 0 ? data.genres.join(', ') : 'Приключения'
  const yearStr = data.year ? `${data.year}` : '2024'
  const ageStr = data.ageRating ?? '12+'
  drawMetaLine(ctx, contentX, HEADLINE_BASELINE + 28, contentW, yearStr, genresStr, ageStr)

  // Поля данных слева.
  const row1Y = 156
  const row2Y = row1Y + 68
  const row3Y = row2Y + 68

  const statusVal = data.status ?? 'Любимый'
  const ratingVal = data.rating !== undefined ? `${data.rating}/10` : '—'
  drawField(ctx, contentX, row1Y, 108, 28, 'Статус', statusVal)
  drawField(ctx, contentX + 108 + 8, row1Y, 84, 28, 'Оценка', ratingVal)

  const dateVal = data.dateTime ?? '22.11.2004 | 19:30:28'
  drawField(ctx, contentX, row2Y, 200, 28, 'Дата/Время', dateVal)

  const seatVal = data.seat ?? '22 ряд 55 место'
  drawField(ctx, contentX, row3Y, 200, 28, 'Место', seatVal)

  // Поле отзыва
  const reviewX = contentX + 200 + 38
  const reviewW = LEFT_FRAME_X + LEFT_FRAME_W - CONTENT_INSET - reviewX
  const defaultReview =
    data.review ||
    'Отличный фильм с великолепной режиссурой и глубоким сюжетом. ' +
      'Оставляет незабываемое впечатление после просмотра. ' +
      'Рекомендуется к просмотру всем ценителям классики.'
  drawField(ctx, reviewX, row1Y, reviewW, 173, 'Отзыв', defaultReview, true)

  // Корешок
  const stubCenterX = RIGHT_FRAME_X + RIGHT_FRAME_W / 2
  ctx.textAlign = 'center'

  ctx.fillStyle = COLOR_GREEN
  ctx.font = `700 32px ${HEADING_FONT}`
  ctx.fillText('VIE', stubCenterX, HEADLINE_BASELINE)

  ctx.fillStyle = COLOR_RED
  ctx.font = `400 14px ${BODY_FONT}`
  ctx.fillText('Ретро архив', stubCenterX, HEADLINE_BASELINE + 21)
  ctx.fillText('фильмов', stubCenterX, HEADLINE_BASELINE + 37)

  ctx.fillStyle = COLOR_GREEN
  ctx.font = `400 17px ${BODY_FONT}`
  ctx.fillText('itmo.vie.ru', stubCenterX, row1Y - 4)

  // Плейсхолдер QR
  const qrBoxSize = 104
  const qrX = stubCenterX - qrBoxSize / 2
  ctx.fillStyle = '#FFFFFF'
  ctx.fillRect(qrX, row1Y, qrBoxSize, qrBoxSize)
  ctx.strokeStyle = COLOR_RED
  ctx.lineWidth = 1
  ctx.strokeRect(qrX + 0.5, row1Y + 0.5, qrBoxSize - 1, qrBoxSize - 1)

  ctx.fillStyle = COLOR_RED
  ctx.font = `400 11px ${BODY_FONT}`
  const hintY = row1Y + qrBoxSize + 34
  ctx.fillText('Отсканируй,', stubCenterX, hintY)
  ctx.fillText('чтобы оставить', stubCenterX, hintY + 13)
  ctx.fillText('свой отзыв', stubCenterX, hintY + 26)

  ctx.textAlign = 'left'
}
