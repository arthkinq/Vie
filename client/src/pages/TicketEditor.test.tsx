import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { Provider } from 'react-redux'
import { MemoryRouter, Route, Routes } from 'react-router'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { Movie } from '../api'
import * as drawTicketModule from '../lib/drawTicket'
import { setupStore } from '../store'
import TicketEditor from './TicketEditor'

const mockMovie: Movie = {
  id: 42,
  title: 'Интерстеллар',
  year: 2014,
  genres: ['фантастика', 'драма'],
  countries: ['США'],
  director: 'Кристофер Нолан',
  rating: 8.6,
  description: 'Космическое путешествие в поисках нового дома.',
  poster: 'interstellar.jpg',
}

function renderEditor(movieId = '42', preloadedState?: Parameters<typeof setupStore>[0]) {
  const store = setupStore(preloadedState)
  const renderResult = render(
    <Provider store={store}>
      <MemoryRouter initialEntries={[`/ticket/${movieId}`]}>
        <Routes>
          <Route path="/ticket/:id" element={<TicketEditor />} />
          <Route path="/ticket" element={<div>Страница выбора билета</div>} />
        </Routes>
      </MemoryRouter>
    </Provider>,
  )
  return { store, ...renderResult }
}

describe('TicketEditor page', () => {
  beforeEach(() => {
    // Mock document.fonts
    Object.defineProperty(document, 'fonts', {
      value: { ready: Promise.resolve() },
      configurable: true,
    })

    // Mock Canvas 2D Context
    HTMLCanvasElement.prototype.getContext = vi.fn().mockReturnValue({
      clearRect: vi.fn(),
      beginPath: vi.fn(),
      moveTo: vi.fn(),
      lineTo: vi.fn(),
      arc: vi.fn(),
      closePath: vi.fn(),
      fill: vi.fn(),
      stroke: vi.fn(),
      fillRect: vi.fn(),
      strokeRect: vi.fn(),
      fillText: vi.fn(),
      measureText: vi.fn((text: string) => ({ width: text.length * 8 })),
    }) as unknown as typeof HTMLCanvasElement.prototype.getContext
  })

  afterEach(() => {
    cleanup()
    vi.restoreAllMocks()
  })

  it('renders loading spinner while movies are loading', () => {
    const { container } = renderEditor('42', {
      movies: { items: [], status: 'loading' },
    })

    expect(container.querySelector('.ant-spin')).toBeInTheDocument()
  })

  it('renders error alert when movie request fails', () => {
    renderEditor('42', {
      movies: { items: [], status: 'failed' },
    })

    expect(screen.getByText('Не удалось загрузить фильм')).toBeInTheDocument()
  })

  it('renders not found alert when movie ID does not exist in store', () => {
    renderEditor('999', {
      movies: { items: [mockMovie], status: 'succeeded' },
    })

    expect(screen.getByText('Фильм не найден')).toBeInTheDocument()
    expect(screen.getByText('Возможно, он был удалён или ссылка неверна.')).toBeInTheDocument()

    const backButton = screen.getByRole('button', { name: 'Назад к выбору' })
    expect(backButton).toBeInTheDocument()
    const link = backButton.closest('a')
    expect(link).toHaveAttribute('href', '/ticket')
  })

  it('renders ticket editor with canvas and customizer sections when movie is found', () => {
    const drawTicketSpy = vi.spyOn(drawTicketModule, 'drawTicket')

    renderEditor('42', {
      movies: { items: [mockMovie], status: 'succeeded' },
      ratings: { 42: 10 },
    })

    expect(screen.getByText('Форма')).toBeInTheDocument()
    expect(screen.getByText('Узор')).toBeInTheDocument()
    expect(screen.getByText('Цвет')).toBeInTheDocument()
    expect(screen.getByText('Шрифт')).toBeInTheDocument()

    expect(screen.getByRole('button', { name: 'Опубликовать' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Скачать' })).toBeInTheDocument()

    expect(drawTicketSpy).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        title: 'Интерстеллар',
        year: 2014,
        genres: ['фантастика', 'драма'],
        rating: 10,
      }),
    )
  })

  it('uses movie rating when user has not rated the movie', () => {
    const drawTicketSpy = vi.spyOn(drawTicketModule, 'drawTicket')

    renderEditor('42', {
      movies: { items: [mockMovie], status: 'succeeded' },
      ratings: {},
    })

    expect(drawTicketSpy).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        title: 'Интерстеллар',
        rating: 8.6,
      }),
    )
  })

  it('switches active shape when shape buttons are clicked', () => {
    const { container } = renderEditor('42', {
      movies: { items: [mockMovie], status: 'succeeded' },
    })

    const shapeButtons = container.querySelectorAll('.shape-btn')
    expect(shapeButtons.length).toBe(4)

    expect(shapeButtons[0]).toHaveClass('active')

    fireEvent.click(shapeButtons[1])
    expect(shapeButtons[1]).toHaveClass('active')
    expect(shapeButtons[0]).not.toHaveClass('active')

    fireEvent.click(shapeButtons[2])
    expect(shapeButtons[2]).toHaveClass('active')

    fireEvent.click(shapeButtons[3])
    expect(shapeButtons[3]).toHaveClass('active')
  })

  it('switches active pattern when pattern buttons are clicked', () => {
    renderEditor('42', {
      movies: { items: [mockMovie], status: 'succeeded' },
    })

    const section = screen.getByText('Узор').closest('.customizer-section')
    const patternButtons = section?.querySelectorAll('.square-tool-btn') ?? []
    expect(patternButtons.length).toBe(4)

    expect(patternButtons[0]).toHaveClass('active')

    fireEvent.click(patternButtons[1])
    expect(patternButtons[1]).toHaveClass('active')

    fireEvent.click(patternButtons[2])
    expect(patternButtons[2]).toHaveClass('active')

    fireEvent.click(patternButtons[3])
    expect(patternButtons[3]).toHaveClass('active')
  })

  it('switches active color palette when palette buttons are clicked', () => {
    const { container } = renderEditor('42', {
      movies: { items: [mockMovie], status: 'succeeded' },
    })

    const paletteButtons = container.querySelectorAll('.palette-btn')
    expect(paletteButtons.length).toBe(4)

    expect(paletteButtons[0]).toHaveClass('active')

    fireEvent.click(paletteButtons[1])
    expect(paletteButtons[1]).toHaveClass('active')

    fireEvent.click(paletteButtons[2])
    expect(paletteButtons[2]).toHaveClass('active')

    fireEvent.click(paletteButtons[3])
    expect(paletteButtons[3]).toHaveClass('active')
  })

  it('switches active font style when font buttons are clicked', () => {
    const { container } = renderEditor('42', {
      movies: { items: [mockMovie], status: 'succeeded' },
    })

    const fontButtons = container.querySelectorAll('.font-btn')
    expect(fontButtons.length).toBe(4)

    expect(fontButtons[0]).toHaveClass('active')

    fireEvent.click(fontButtons[1])
    expect(fontButtons[1]).toHaveClass('active')

    fireEvent.click(fontButtons[2])
    expect(fontButtons[2]).toHaveClass('active')

    fireEvent.click(fontButtons[3])
    expect(fontButtons[3]).toHaveClass('active')
  })

  it('downloads ticket as png when clicking download button', async () => {
    const createObjectURLSpy = vi
      .spyOn(URL, 'createObjectURL')
      .mockReturnValue('blob:http://localhost/ticket-42.png')
    const revokeObjectURLSpy = vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {})

    const clickSpy = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {})

    HTMLCanvasElement.prototype.toBlob = vi.fn((callback) => {
      callback(new Blob(['image-content'], { type: 'image/png' }))
    })

    renderEditor('42', {
      movies: { items: [mockMovie], status: 'succeeded' },
    })

    const downloadButton = screen.getByRole('button', { name: 'Скачать' })
    fireEvent.click(downloadButton)

    await waitFor(() => {
      expect(HTMLCanvasElement.prototype.toBlob).toHaveBeenCalled()
      expect(createObjectURLSpy).toHaveBeenCalled()
      expect(clickSpy).toHaveBeenCalled()
      expect(revokeObjectURLSpy).toHaveBeenCalledWith('blob:http://localhost/ticket-42.png')
    })
  })

  it('handles download safely if canvas.toBlob yields null', () => {
    const createObjectURLSpy = vi.spyOn(URL, 'createObjectURL')

    HTMLCanvasElement.prototype.toBlob = vi.fn((callback) => {
      callback(null)
    })

    renderEditor('42', {
      movies: { items: [mockMovie], status: 'succeeded' },
    })

    const downloadButton = screen.getByRole('button', { name: 'Скачать' })
    fireEvent.click(downloadButton)

    expect(createObjectURLSpy).not.toHaveBeenCalled()
  })

  it('handles case when canvas getContext returns null', () => {
    HTMLCanvasElement.prototype.getContext = vi.fn().mockReturnValue(null)

    expect(() => {
      renderEditor('42', {
        movies: { items: [mockMovie], status: 'succeeded' },
      })
    }).not.toThrow()
  })
})
