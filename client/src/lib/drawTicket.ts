import type { Movie } from '../api'

export type TicketShape = 'classic' | 'serrated' | 'rectangular' | 'notched-serrated'
export type TicketPattern = 'stars' | 'stripes' | 'triangles' | 'none'
export type TicketPalette = 'cream-gold' | 'dark-teal' | 'monochrome' | 'red-vintage'

export interface TicketStyleOptions {
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
}
const CORNER_R = 24 // скругление углов у classic
const CONCAVE_R = 26 // вогнутые углы у serrated-форм
const NOTCH_R = 16 // вырезы отрыва сверху и снизу
const SCALLOPS = 12 // сколько круглых выемок на боковой
function drawScallopEdge(ctx: CanvasRenderingContext2D, x: number, from: number, to: number): void {
  const down = to > from
  const r = Math.abs(to - from) / SCALLOPS / 2
  const [a0, a1] = down ? [-Math.PI / 2, Math.PI / 2] : [Math.PI / 2, -Math.PI / 2]

  for (let i = 0; i < SCALLOPS; i++) {
    const cy = from + (down ? 1 : -1) * (2 * i + 1) * r
    ctx.arc(x, cy, r, a0, a1, true)
  }
}

export function buildTicketPath(ctx: CanvasRenderingContext2D, shape: TicketShape): void {
  const w = TICKET_WIDTH
  const h = TICKET_HEIGHT
  const tearX = TEAR_X

  ctx.beginPath()
  if (shape === 'rectangular') {
    ctx.rect(0, 0, w, h)
    return
  }

  const scalloped = shape === 'serrated' || shape === 'notched-serrated'
  const notched = shape === 'classic' || shape === 'notched-serrated'
  const r = scalloped ? CONCAVE_R : CORNER_R

  // Верхняя грань (слева направо)
  ctx.moveTo(r, 0)
  if (notched) {
    ctx.lineTo(tearX - NOTCH_R, 0)
    ctx.arc(tearX, 0, NOTCH_R, Math.PI, 0, true)
  }
  ctx.lineTo(w - r, 0)

  // Правая грань (сверху вниз)
  if (scalloped) {
    ctx.arc(w, 0, r, Math.PI, Math.PI / 2, true)
    drawScallopEdge(ctx, w, r, h - r)
    ctx.arc(w, h, r, (3 * Math.PI) / 2, Math.PI, true)
  } else {
    ctx.arcTo(w, 0, w, r, r)
    ctx.lineTo(w, h - r)
    ctx.arcTo(w, h, w - r, h, r)
  }

  // Нижняя грань (справа налево)
  if (notched) {
    ctx.lineTo(tearX + NOTCH_R, h)
    ctx.arc(tearX, h, NOTCH_R, 0, Math.PI, true)
  }
  ctx.lineTo(r, h)

  // Левая грань (снизу вверх)
  if (scalloped) {
    ctx.arc(0, h, r, 0, (3 * Math.PI) / 2, true)
    drawScallopEdge(ctx, 0, h - r, r)
    ctx.arc(0, 0, r, Math.PI / 2, 0, true)
  } else {
    ctx.arcTo(0, h, 0, h - r, r)
    ctx.lineTo(0, r)
    ctx.arcTo(0, 0, r, 0, r)
  }
  ctx.closePath()
}
const PATTERN = {
  stars: { step: 80, size: 12 },
  triangles: { step: 64, size: 20 },
  stripes: { step: 44, lineWidth: 6 },
}
function forEachCell(step: number, draw: (x: number, y: number) => void): void {
  for (let row = 0, y = step / 2; y < TICKET_HEIGHT + step; y += step, row++) {
    const shift = row % 2 ? step / 2 : 0
    for (let x = shift - step / 2; x < TICKET_WIDTH + step; x += step) draw(x, y)
  }
}

function drawStar(ctx: CanvasRenderingContext2D, cx: number, cy: number, size: number): void {
  ctx.beginPath()
  for (let i = 0; i < 10; i++) {
    const radius = i % 2 === 0 ? size : size / 2
    const angle = -Math.PI / 2 + (i * Math.PI) / 5
    ctx.lineTo(cx + Math.cos(angle) * radius, cy + Math.sin(angle) * radius)
  }
  ctx.closePath()
  ctx.fill()
}

function drawTriangle(ctx: CanvasRenderingContext2D, cx: number, cy: number, size: number): void {
  ctx.beginPath()
  ctx.moveTo(cx, cy - size / 2)
  ctx.lineTo(cx + size / 2, cy + size / 2)
  ctx.lineTo(cx - size / 2, cy + size / 2)
  ctx.closePath()
  ctx.fill()
}

export function drawPattern(ctx: CanvasRenderingContext2D, pattern: TicketPattern): void {
  if (pattern === 'none') return

  ctx.save()
  ctx.fillStyle = TICKET_STATIC_COLORS.pattern
  ctx.strokeStyle = TICKET_STATIC_COLORS.pattern

  if (pattern === 'stars') {
    const { step, size } = PATTERN.stars
    forEachCell(step, (x, y) => drawStar(ctx, x, y, size))
  } else if (pattern === 'triangles') {
    const { step, size } = PATTERN.triangles
    forEachCell(step, (x, y) => drawTriangle(ctx, x, y, size))
  } else {
    const { step, lineWidth } = PATTERN.stripes
    ctx.lineWidth = lineWidth
    for (let x = -TICKET_HEIGHT; x < TICKET_WIDTH; x += step) {
      ctx.beginPath()
      ctx.moveTo(x, 0)
      ctx.lineTo(x + TICKET_HEIGHT, TICKET_HEIGHT)
      ctx.stroke()
    }
  }

  ctx.restore()
}
export function drawBordersAndTearLine(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  tearX: number,
  accentColor: string,
): void {
  ctx.save()
  ctx.strokeStyle = accentColor
  ctx.lineWidth = 1.5

  const pad = 16

  const mainWidth = tearX - pad * 2
  const mainHeight = height - pad * 2
  ctx.strokeRect(pad, pad, mainWidth, mainHeight)

  const stubX = tearX + pad
  const stubWidth = width - tearX - pad * 2
  const stubHeight = height - pad * 2
  ctx.strokeRect(stubX, pad, stubWidth, stubHeight)

  ctx.setLineDash([6, 6])
  ctx.beginPath()
  ctx.moveTo(tearX, pad - 2)
  ctx.lineTo(tearX, height - pad + 2)
  ctx.stroke()

  ctx.restore()
}

export function drawInfoBox(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  label: string,
  value: string,
  accentColor: string,
  fontFamily: string,
): void {
  ctx.font = `600 13px ${fontFamily}`
  ctx.fillStyle = accentColor
  ctx.textAlign = 'left'
  ctx.textBaseline = 'alphabetic'
  ctx.fillText(label, x + 2, y - 5)

  ctx.fillStyle = TICKET_STATIC_COLORS.whiteBox
  ctx.fillRect(x, y, w, h)
  ctx.strokeStyle = accentColor
  ctx.lineWidth = 1
  ctx.strokeRect(x, y, w, h)

  ctx.font = `700 13px ${fontFamily}`
  ctx.fillStyle = TICKET_STATIC_COLORS.inkText
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText(value, x + w / 2, y + h / 2)
  ctx.textBaseline = 'alphabetic'
}

export function drawReviewBox(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  text: string,
  accentColor: string,
  fontFamily: string,
): void {
  ctx.font = `600 13px ${fontFamily}`
  ctx.fillStyle = accentColor
  ctx.textAlign = 'left'
  ctx.fillText('Отзыв', x + 2, y - 5)

  ctx.fillStyle = TICKET_STATIC_COLORS.whiteBox
  ctx.fillRect(x, y, w, h)
  ctx.strokeStyle = accentColor
  ctx.lineWidth = 1
  ctx.strokeRect(x, y, w, h)

  const fontSize = 11
  const lineHeight = 15
  const padding = 8
  const maxTextWidth = w - padding * 2
  const maxLines = Math.floor((h - padding * 2) / lineHeight)

  ctx.font = `400 ${fontSize}px ${fontFamily}`
  ctx.fillStyle = TICKET_STATIC_COLORS.inkText
  ctx.textAlign = 'left'

  const content =
    text.trim() ||
    'Отличная картина для домашней коллекции. Прекрасная атмосфера ретро-кинематографа!'

  const words = content.split(/\s+/)
  const lines: string[] = []
  let currentLine = ''

  for (const word of words) {
    const testLine = currentLine ? `${currentLine} ${word}` : word
    const testWidth = ctx.measureText(testLine).width

    if (testWidth <= maxTextWidth) {
      currentLine = testLine
    } else {
      if (currentLine) lines.push(currentLine)
      currentLine = word
    }

    if (lines.length === maxLines) break
  }

  if (lines.length < maxLines && currentLine) {
    lines.push(currentLine)
  }

  if (lines.length >= maxLines) {
    let last = lines[maxLines - 1]
    while (ctx.measureText(last + '...').width > maxTextWidth && last.length > 0) {
      last = last.slice(0, -1)
    }
    lines[maxLines - 1] = last + '...'
  }

  let textY = y + padding + fontSize
  for (const line of lines) {
    ctx.fillText(line, x + padding, textY)
    textY += lineHeight
  }
}

export function drawStubSection(
  ctx: CanvasRenderingContext2D,
  width: number,
  tearX: number,
  colors: PaletteColors,
  fontFamily: string,
): void {
  const stubCenterX = tearX + (width - tearX) / 2

  ctx.font = `900 28px ${fontFamily}`
  ctx.fillStyle = colors.primary
  ctx.textAlign = 'center'
  ctx.fillText('VIE', stubCenterX, 56)

  ctx.font = `600 11px ${fontFamily}`
  ctx.fillStyle = colors.accent
  ctx.fillText('Ретро архив фильмов', stubCenterX, 76)

  ctx.font = `700 13px ${fontFamily}`
  ctx.fillStyle = colors.primary
  ctx.fillText('itmo.vie.ru', stubCenterX, 96)

  const qrSize = 104
  const qrX = Math.round(stubCenterX - qrSize / 2)
  const qrY = 118

  ctx.fillStyle = TICKET_STATIC_COLORS.whiteBox
  ctx.fillRect(qrX, qrY, qrSize, qrSize)
  ctx.strokeStyle = colors.accent
  ctx.lineWidth = 1
  ctx.strokeRect(qrX, qrY, qrSize, qrSize)

  ctx.font = `500 11px ${fontFamily}`
  ctx.fillStyle = colors.accent
  ctx.textAlign = 'center'
  ctx.fillText('Отсканируй, чтобы', stubCenterX, qrY + qrSize + 22)
  ctx.fillText('оставить свой отзыв', stubCenterX, qrY + qrSize + 38)
}
function fitText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string {
  if (ctx.measureText(text).width <= maxWidth) return text
  let s = text
  while (s && ctx.measureText(s + '...').width > maxWidth) s = s.slice(0, -1)
  return s + '...'
}
export function drawTicket(
  ctx: CanvasRenderingContext2D,
  movie: Movie,
  style: TicketStyleOptions,
  userData: TicketUserData = {},
): void {
  const width = TICKET_WIDTH
  const height = TICKET_HEIGHT
  const tearX = TEAR_X

  const colors = PALETTES[style.palette]
  const fontFamily = style.fontFamily || 'Georgia, serif'

  ctx.save()
  ctx.clearRect(0, 0, width, height)

  buildTicketPath(ctx, style.shape)
  ctx.fillStyle = colors.ticketBg
  ctx.fill()

  ctx.save()
  ctx.clip()

  drawPattern(ctx, style.pattern)

  ctx.restore()

  buildTicketPath(ctx, style.shape)
  ctx.strokeStyle = colors.accent
  ctx.lineWidth = 2.5
  ctx.stroke()

  drawBordersAndTearLine(ctx, width, height, tearX, colors.accent)

  const titleText = (movie.title || 'VIE CINEMA').toUpperCase()
  ctx.font = `800 24px ${fontFamily}`
  ctx.fillStyle = colors.primary
  ctx.textAlign = 'left'
  const maxTitleWidth = tearX - 32 - 24
  ctx.fillText(fitText(ctx, titleText, maxTitleWidth), 32, 54)
  const genresStr = movie.genres?.length ? movie.genres.join(', ') : 'Ретро-классика'
  const subText = `${movie.year || 2024} • ${genresStr} • 12+`
  ctx.font = `600 13px ${fontFamily}`
  ctx.fillStyle = colors.accent
  ctx.fillText(subText, 32, 80)

  const boxTop = 118
  const boxHeight = 32
  const col1W = 120
  const col2W = 85
  const fullColW = col1W + col2W + 12

  const statusVal = userData.status || 'Любимый'
  const ratingVal = `${userData.userRating ?? movie.rating ?? 10}/10`
  const dateVal = userData.date || new Date().toLocaleDateString('ru-RU') + ' | 19:30:28'
  const seatVal = userData.seat || '22 ряд 55 место'

  drawInfoBox(ctx, 32, boxTop, col1W, boxHeight, 'Статус', statusVal, colors.accent, fontFamily)
  drawInfoBox(
    ctx,
    32 + col1W + 12,
    boxTop,
    col2W,
    boxHeight,
    'Оценка',
    ratingVal,
    colors.accent,
    fontFamily,
  )
  drawInfoBox(
    ctx,
    32,
    boxTop + 56,
    fullColW,
    boxHeight,
    'Дата/Время',
    dateVal,
    colors.accent,
    fontFamily,
  )
  drawInfoBox(
    ctx,
    32,
    boxTop + 112,
    fullColW,
    boxHeight,
    'Место',
    seatVal,
    colors.accent,
    fontFamily,
  )

  const reviewLeft = 32 + fullColW + 28
  const reviewWidth = tearX - reviewLeft - 24
  const reviewHeight = 144
  const reviewText = userData.review || movie.description || 'Великолепная картина для коллекции.'

  drawReviewBox(
    ctx,
    reviewLeft,
    boxTop,
    reviewWidth,
    reviewHeight,
    reviewText,
    colors.accent,
    fontFamily,
  )

  drawStubSection(ctx, width, tearX, colors, fontFamily)

  ctx.restore()
}

export function downloadCanvas(canvas: HTMLCanvasElement, filename: string): void {
  canvas.toBlob((blob) => {
    if (!blob) return
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }, 'image/png')
}
