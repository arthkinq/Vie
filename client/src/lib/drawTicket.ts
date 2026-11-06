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

export const PALLETS: Record<TicketPalette, PaletteColors> = {
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
export function drawSerratedVerticalEdge(
  ctx: CanvasRenderingContext2D,
  startX: number,
  startY: number,
  endY: number,
  teethCount: number,
  toothDepth: number,
  direction: 1 | -1,
): void {
  const totalH = Math.abs(endY - startY)
  const toothH = totalH / teethCount
  const isGoingDown = endY > startY

  for (let i = 0; i < teethCount; i++) {
    const currentY = isGoingDown ? startY + i * toothH : startY - i * toothH
    const midY = currentY + (isGoingDown ? toothH / 2 : -toothH / 2)
    const nextY = currentY + (isGoingDown ? toothH : -toothH)

    ctx.lineTo(startX - toothDepth * direction, midY)
    ctx.lineTo(startX, nextY)
  }
}
export function buildTicketPath(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  tearX: number,
  shape: TicketShape,
): void {
  const cornerRadius = 24
  const notchRadius = 16
  const concaveRadius = 26
  const teeth = 14
  const toothDepth = 4

  const hasNotch = shape === 'classic' || shape === 'notched-serrated'
  ctx.beginPath()
  if (shape == 'rectangular') {
    ctx.rect(0, 0, width, height)
    ctx.closePath()
    return
  }
  if (shape == 'classic') {
    // Верхний левый угол
    ctx.moveTo(cornerRadius, 0)

    // Верхняя грань и верхний вырез отрыва
    ctx.lineTo(tearX - notchRadius, 0)
    ctx.arc(tearX, 0, notchRadius, Math.PI, 0, true)
    ctx.lineTo(width - cornerRadius, 0)

    // Правый верхний угол
    ctx.arcTo(width, 0, width, cornerRadius, cornerRadius)

    // Правая грань
    ctx.lineTo(width, height - cornerRadius)

    // Правый нижний угол
    ctx.arcTo(width, height, width - cornerRadius, height, cornerRadius)

    // Нижняя грань и нижний вырез отрыва
    ctx.lineTo(tearX + notchRadius, height)
    ctx.arc(tearX, height, notchRadius, 0, Math.PI, true)
    ctx.lineTo(cornerRadius, height)

    // Левый нижний угол
    ctx.arcTo(0, height, 0, height - cornerRadius, cornerRadius)

    // Левая грань
    ctx.lineTo(0, cornerRadius)

    // Замыкание
    ctx.arcTo(0, 0, cornerRadius, 0, cornerRadius)
    ctx.closePath()
    return
  }
  const cornerPad = concaveRadius

  ctx.moveTo(cornerPad, 0)
  if (hasNotch) {
    ctx.lineTo(tearX - notchRadius, 0)
    ctx.arc(tearX, 0, notchRadius, Math.PI, 0, true)
  }
  ctx.lineTo(width - cornerPad, 0)
  ctx.arc(width, 0, concaveRadius, Math.PI, Math.PI / 2, true)
  drawSerratedVerticalEdge(ctx, width, cornerPad, height - cornerPad, teeth, toothDepth, 1)
  ctx.arc(width, height, concaveRadius, (3 * Math.PI) / 2, Math.PI, true)

  if (hasNotch) {
    ctx.lineTo(tearX + notchRadius, height)
    ctx.arc(tearX, height, notchRadius, 0, Math.PI, true)
  }
  ctx.lineTo(cornerPad, height)
  ctx.arc(0, height, concaveRadius, 0, (3 * Math.PI) / 2, true)
  drawSerratedVerticalEdge(ctx, 0, height - cornerPad, cornerPad, teeth, toothDepth, -1)
  ctx.arc(0, 0, concaveRadius, Math.PI / 2, 0, true)
  ctx.closePath()
}
function drawStar(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  outerRadius: number,
  innerRadius: number,
): void {
  const spikes = 5
  let rot = (Math.PI / 2) * 3
  const step = Math.PI / spikes

  ctx.beginPath()
  ctx.moveTo(cx, cy - outerRadius)
  for (let i = 0; i < spikes; i++) {
    ctx.lineTo(cx + Math.cos(rot) * outerRadius, cy + Math.sin(rot) * outerRadius)
    rot += step
    ctx.lineTo(cx + Math.cos(rot) * innerRadius, cy + Math.sin(rot) * innerRadius)
    rot += step
  }
  ctx.closePath()
  ctx.fill()
}

export function drawPattern(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  pattern: TicketPattern,
): void {
  if (pattern === 'none') return

  ctx.save()
  ctx.fillStyle = TICKET_STATIC_COLORS.pattern
  ctx.strokeStyle = TICKET_STATIC_COLORS.pattern

  if (pattern === 'stars') {
    const stepX = 54
    const stepY = 54
    for (let y = 20; y < height; y += stepY) {
      // Шахматный сдвиг через строку
      const offsetX = (Math.floor(y / stepY) % 2) * (stepX / 2)
      for (let x = 16 + offsetX; x < width; x += stepX) {
        drawStar(ctx, x, y, 7, 3.5)
      }
    }
  } else if (pattern === 'stripes') {
    ctx.lineWidth = 2.5
    const step = 28
    for (let x = -height; x < width + height; x += step) {
      ctx.beginPath()
      ctx.moveTo(x, 0)
      ctx.lineTo(x + height, height)
      ctx.stroke()
    }
  } else if (pattern === 'triangles') {
    const size = 9
    const stepX = 44
    const stepY = 44
    for (let y = 20; y < height; y += stepY) {
      const offsetX = (Math.floor(y / stepY) % 2) * (stepX / 2)
      for (let x = 16 + offsetX; x < width; x += stepX) {
        ctx.beginPath()
        ctx.moveTo(x, y - size / 2)
        ctx.lineTo(x + size / 2, y + size / 2)
        ctx.lineTo(x - size / 2, y + size / 2)
        ctx.closePath()
        ctx.fill()
      }
    }
  }

  ctx.restore()
}
