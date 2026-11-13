import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import About from './About'

describe('About page', () => {
  afterEach(() => {
    cleanup()
  })

  it('renders page title', () => {
    render(<About />)

    expect(
      screen.getByRole('heading', {
        name: 'О НАШЕМ КИНОТЕАТРЕ',
      }),
    ).toBeInTheDocument()
  })

  it('renders all features', () => {
    render(<About />)

    expect(screen.getByText('ОЦЕНИВАТЬ ФИЛЬМЫ')).toBeInTheDocument()
    expect(screen.getByText('ОСТАВЛЯТЬ ОТЗЫВЫ')).toBeInTheDocument()
    expect(screen.getByText('СОЗДАВАТЬ КОЛЛЕКЦИОННЫЕ БИЛЕТЫ')).toBeInTheDocument()
  })

  it('renders all team members', () => {
    render(<About />)

    expect(screen.getByText('Сланов Артур')).toBeInTheDocument()
    expect(screen.getByText('Слудная Виктория')).toBeInTheDocument()
    expect(screen.getByText('Тетман Юлия')).toBeInTheDocument()
    expect(screen.getByText('Герасимова Алина')).toBeInTheDocument()
  })
})
