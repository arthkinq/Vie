import { render, screen } from '@testing-library/react'
import * as Sentry from '@sentry/react'
import { describe, expect, it, vi } from 'vitest'

function BuggyComponent(): never {
  throw new Error('Test error')
}

describe('Sentry ErrorBoundary', () => {
  it('shows fallback when child throws error', () => {
    vi.spyOn(console, 'error').mockImplementation(() => {})

    render(
      <Sentry.ErrorBoundary fallback={<div>Что-то пошло не так</div>}>
        <BuggyComponent />
      </Sentry.ErrorBoundary>,
    )

    expect(screen.getByText('Что-то пошло не так')).toBeInTheDocument()
  })
})
