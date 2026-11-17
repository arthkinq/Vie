import { describe, expect, it, vi } from 'vitest'
import { drawTicket, TICKET_HEIGHT, TICKET_WIDTH, type TicketDrawData } from './drawTicket'

function createMockContext(measureTextWidth?: (text: string) => number) {
  const calls = {
    fillText: [] as { text: string; x: number; y: number }[],
    stroke: 0,
    fill: 0,
    clearRect: [] as [number, number, number, number][],
    fillRect: [] as [number, number, number, number][],
  }

  const ctx = {
    fillStyle: '',
    strokeStyle: '',
    lineWidth: 1,
    font: '',
    textAlign: 'left',
    clearRect: vi.fn((x: number, y: number, w: number, h: number) => {
      calls.clearRect.push([x, y, w, h])
    }),
    beginPath: vi.fn(),
    moveTo: vi.fn(),
    lineTo: vi.fn(),
    arc: vi.fn(),
    closePath: vi.fn(),
    fill: vi.fn(() => {
      calls.fill++
    }),
    stroke: vi.fn(() => {
      calls.stroke++
    }),
    fillRect: vi.fn((x: number, y: number, w: number, h: number) => {
      calls.fillRect.push([x, y, w, h])
    }),
    strokeRect: vi.fn(),
    fillText: vi.fn((text: string, x: number, y: number) => {
      calls.fillText.push({ text, x, y })
    }),
    measureText: vi.fn((text: string) => ({
      width: measureTextWidth ? measureTextWidth(text) : text.length * 8,
    })),
  } as unknown as CanvasRenderingContext2D

  return { ctx, calls }
}

describe('drawTicket', () => {
  it('exports correct standard ticket dimensions', () => {
    expect(TICKET_WIDTH).toBe(863)
    expect(TICKET_HEIGHT).toBe(385)
  })

  it('draws ticket with full custom dataset', () => {
    const { ctx, calls } = createMockContext()

    const data: TicketDrawData = {
      title: 'Интерстеллар',
      year: 2014,
      genres: ['Фантастика', 'Драма'],
      ageRating: '16+',
      rating: 9,
      status: 'Просмотрен',
      dateTime: '25.12.2024 | 18:00',
      seat: '1 ряд 5 место',
      review: 'Потрясающий фильм о путешествии сквозь пространство.',
    }

    drawTicket(ctx, data)

    expect(calls.clearRect).toEqual([[0, 0, TICKET_WIDTH, TICKET_HEIGHT]])
    expect(calls.fill).toBeGreaterThan(0)
    expect(calls.stroke).toBeGreaterThan(0)

    const renderedTexts = calls.fillText.map((item) => item.text)
    expect(renderedTexts).toContain('ИНТЕРСТЕЛЛАР')
    expect(renderedTexts).toContain('2014')
    expect(renderedTexts).toContain('16+')
    expect(renderedTexts).toContain('9/10')
    expect(renderedTexts).toContain('Просмотрен')
    expect(renderedTexts).toContain('25.12.2024 | 18:00')
    expect(renderedTexts).toContain('1 ряд 5 место')
    expect(renderedTexts).toContain('VIE')
    expect(renderedTexts).toContain('Ретро архив')
    expect(renderedTexts).toContain('фильмов')
    expect(renderedTexts).toContain('itmo.vie.ru')
    expect(renderedTexts).toContain('Отсканируй,')
  })

  it('uses fallbacks when optional fields are omitted', () => {
    const { ctx, calls } = createMockContext()

    drawTicket(ctx, { title: '' })

    const renderedTexts = calls.fillText.map((item) => item.text)
    expect(renderedTexts).toContain('INTERSTELLAR')
    expect(renderedTexts).toContain('2024')
    expect(renderedTexts).toContain('12+')
    expect(renderedTexts).toContain('Любимый')
    expect(renderedTexts).toContain('—')
    expect(renderedTexts).toContain('22.11.2004 | 19:30:28')
    expect(renderedTexts).toContain('22 ряд 55 место')
    expect(renderedTexts).toContain('VIE')
  })

  it('supports custom canvas width and height', () => {
    const { ctx, calls } = createMockContext()

    drawTicket(ctx, { title: 'Начало' }, 900, 400)

    expect(calls.clearRect).toEqual([[0, 0, 900, 400]])
  })

  it('handles empty genres array by falling back to default genre', () => {
    const { ctx, calls } = createMockContext()

    drawTicket(ctx, {
      title: 'Фильм',
      genres: [],
    })

    const renderedTexts = calls.fillText.map((item) => item.text)
    expect(renderedTexts).toContain('Приключения')
  })

  it('truncates very long titles using fitText', () => {
    const { ctx, calls } = createMockContext((text) => text.length * 20)

    drawTicket(ctx, {
      title:
        'Очень длинное название фильма, которое определенно не поместится в одну строку билета',
    })

    const titleCall = calls.fillText.find((item) => item.y === 88 && item.x === 66)
    expect(titleCall).toBeDefined()
    expect(titleCall?.text.endsWith('…')).toBe(true)
  })

  it('handles fitText when maxWidth is zero or negative', () => {
    const { ctx } = createMockContext((text) => {
      if (text.includes('2024') || text.includes('12+')) return 1000
      return text.length * 10
    })

    expect(() => {
      drawTicket(ctx, { title: 'Тест', year: 2024, ageRating: '12+' })
    }).not.toThrow()
  })

  it('renders multiline review with newlines and text wrapping', () => {
    const { ctx, calls } = createMockContext((text) => text.length * 5)

    const multilineReview =
      'Первый абзац длинного отзыва для проверки переноса слов.\nВторой абзац отзыва.'

    drawTicket(ctx, {
      title: 'Тест',
      review: multilineReview,
    })

    const renderedTexts = calls.fillText.map((item) => item.text)
    const hasFirstParagraphPart = renderedTexts.some((t) => t.includes('Первый'))
    const hasSecondParagraphPart = renderedTexts.some((t) => t.includes('Второй'))

    expect(hasFirstParagraphPart).toBe(true)
    expect(hasSecondParagraphPart).toBe(true)
  })

  it('breaks multiline review when text height exceeds field bounds', () => {
    const { ctx, calls } = createMockContext(() => 10)

    const veryLongReview = Array.from({ length: 30 }, (_, i) => `Строка ${i + 1}`).join('\n')

    drawTicket(ctx, {
      title: 'Тест',
      review: veryLongReview,
    })

    const renderedLines = calls.fillText
      .filter((item) => item.text.startsWith('Строка'))
      .map((item) => item.text)

    // Should stop before reaching line 30
    expect(renderedLines.length).toBeLessThan(30)
    expect(renderedLines.length).toBeGreaterThan(0)
  })
})
