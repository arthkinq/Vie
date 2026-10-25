import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import AuthForm from './AuthForm'

describe('AuthForm', () => {
  afterEach(() => {
    cleanup()
  })

  it('renders login mode by default', () => {
    render(<AuthForm />)
    expect(screen.getByRole('tab', { name: 'Войти' })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: 'Создать' })).toBeInTheDocument()

    expect(screen.getByPlaceholderText('username or mail')).toBeInTheDocument
    expect(screen.getByPlaceholderText('password')).toBeInTheDocument()

    expect(screen.queryByPlaceholderText('repeat password')).not.toBeInTheDocument()
    expect(screen.queryByPlaceholderText('example@mail.com')).not.toBeInTheDocument()
  })

  it('switches to register mode when clicking on "Создать" tab', async () => {
    render(<AuthForm />)

    const registerTab = screen.getByRole('tab', { name: 'Создать' })
    fireEvent.click(registerTab)
    expect(await screen.findByPlaceholderText('username')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('example@mail.com')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('repeat password')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'СОЗДАТЬ' })).toBeInTheDocument()
  })

  it('renders register mode initially if initialMode="register" is provided', () => {
    render(<AuthForm initialMode="register" />)
    expect(screen.getByPlaceholderText('username')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('example@mail.com')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('repeat password')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'СОЗДАТЬ' })).toBeInTheDocument()
  })

  it('shows required validation errors on empty submit in login mode', async () => {
    render(<AuthForm />)
    fireEvent.click(screen.getByRole('button', { name: 'ВОЙТИ' }))
    expect(await screen.findByText('Введите логин или почту')).toBeInTheDocument()
    expect(await screen.findByText('Введите пароль')).toBeInTheDocument()
  })

  it('validates invalid email format and short username in login mode', async () => {
    render(<AuthForm />)
    const input = screen.getByPlaceholderText('username or mail')
    fireEvent.change(input, { target: { value: 'bad@mail' } })
    fireEvent.blur(input)
    expect(await screen.findByText('Введен некорректный адрес почты!')).toBeInTheDocument()
    fireEvent.change(input, { target: { value: 'ab' } })
    fireEvent.blur(input)
    expect(await screen.findByText('Логин должен содержать минимум 3 символа!')).toBeInTheDocument()
  })

  it('shows error when password does not match complexity rules', async () => {
    render(<AuthForm />)
    const passwordInput = screen.getByPlaceholderText('password')
    fireEvent.change(passwordInput, { target: { value: 'simplepass' } })
    fireEvent.blur(passwordInput)
    expect(
      await screen.findByText(
        'Пароль должен содержать минимум одну заглавную букву, одну строчную и одну цифру!',
      ),
    ).toBeInTheDocument()
  })

  it('validates mail format and password mismatch in register mode', async () => {
    render(<AuthForm initialMode="register" />)
    const mailInput = screen.getByPlaceholderText('example@mail.com')
    fireEvent.change(mailInput, { target: { value: 'not-an-email' } })
    fireEvent.blur(mailInput)
    expect(await screen.findByText('Введен некорректный адрес почты!')).toBeInTheDocument()
    fireEvent.change(screen.getByPlaceholderText('password'), {
      target: { value: 'StrongPass1' },
    })
    fireEvent.change(screen.getByPlaceholderText('repeat password'), {
      target: { value: 'AnotherPass2' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'СОЗДАТЬ' }))
    expect(await screen.findByText('Пароли не совпадают!')).toBeInTheDocument()
  })

  it('calls onSubmit with form values in login mode', async () => {
    const handleSubmit = vi.fn()
    render(<AuthForm onSubmit={handleSubmit} />)
    fireEvent.change(screen.getByPlaceholderText('username or mail'), {
      target: { value: 'viktoria' },
    })
    fireEvent.change(screen.getByPlaceholderText('password'), {
      target: { value: 'Password123' },
    })
    fireEvent.click(screen.getByLabelText('Запомнить'))
    fireEvent.click(screen.getByRole('button', { name: 'ВОЙТИ' }))
    await waitFor(() => {
      expect(handleSubmit).toHaveBeenCalledTimes(1)
      expect(handleSubmit).toHaveBeenCalledWith(
        {
          username: 'viktoria',
          password: 'Password123',
          remember: true,
        },
        'login',
      )
    })
  })

  it('calls onSubmit with all fields in register mode', async () => {
    const handleSubmit = vi.fn()
    render(<AuthForm initialMode="register" onSubmit={handleSubmit} />)
    fireEvent.change(screen.getByPlaceholderText('username'), {
      target: { value: 'new_user' },
    })
    fireEvent.change(screen.getByPlaceholderText('example@mail.com'), {
      target: { value: 'new_user@example.com' },
    })
    fireEvent.change(screen.getByPlaceholderText('password'), {
      target: { value: 'Password123' },
    })
    fireEvent.change(screen.getByPlaceholderText('repeat password'), {
      target: { value: 'Password123' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'СОЗДАТЬ' }))
    await waitFor(() => {
      expect(handleSubmit).toHaveBeenCalledTimes(1)
      expect(handleSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          username: 'new_user',
          mail: 'new_user@example.com',
          password: 'Password123',
          confirmPassword: 'Password123',
        }),
        'register',
      )
    })
  })
})
