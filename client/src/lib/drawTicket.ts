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
