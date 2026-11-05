import { useState } from 'react'
import { Alert, Typography } from 'antd'
import { useNavigate } from 'react-router'
import { login, register } from '../api'
import AuthForm, { type AuthFormValues, type AuthMode } from '../components/AuthForm/AuthForm'
import { useAppDispatch } from '../store'
import { loggedIn } from '../store/authSlice'
import './Login.css'

export default function Login() {
  const [error, setError] = useState<string | null>(null)
  const dispatch = useAppDispatch()
  const navigate = useNavigate()

  const handleSubmit = async (values: AuthFormValues, mode: AuthMode) => {
    setError(null)
    try {
      const result =
        mode === 'login'
          ? await login({ login: values.username, password: values.password })
          : await register({
              username: values.username,
              mail: values.mail ?? '',
              password: values.password,
            })

      dispatch(
        loggedIn({
          token: result.token,
          username: result.username,
          remember: Boolean(values.remember),
        }),
      )
      navigate('/profile')
    } catch (err) {
      setError((err as Error).message)
    }
  }

  return (
    <div className="login-page">
      <Typography.Title level={1} className="login-page-title">
        Вход
      </Typography.Title>
      <div className="blur-ellipse" aria-hidden="true" />
      <div className="login-form-wrapper">
        <AuthForm onSubmit={handleSubmit} />
        {error && (
          <div className="login-error-wrapper">
            <Alert type="error" title={error} showIcon />
          </div>
        )}
      </div>
    </div>
  )
}
