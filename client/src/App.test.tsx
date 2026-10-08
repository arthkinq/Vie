import { render, screen } from '@testing-library/react'
import { Provider } from 'react-redux'
import { MemoryRouter } from 'react-router'
import { describe, expect, it } from 'vitest'
import App from './App'
import { store } from './store'

function renderAt(path: string) {
  render(
    <Provider store={store}>
      <MemoryRouter initialEntries={[path]}>
        <App />
      </MemoryRouter>
    </Provider>,
  )
}

describe('App', () => {
  it('renders the home page', () => {
    renderAt('/')
    expect(screen.getByRole('heading', { name: 'Vie' })).toBeInTheDocument()
  })

  it('renders the catalog page', () => {
    renderAt('/catalog')
    expect(screen.getByRole('heading', { name: 'Каталог' })).toBeInTheDocument()
  })
})
