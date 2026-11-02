import { Typography } from 'antd'
import AuthForm from '../components/AuthForm/AuthForm'
import './Login.css'

export default function Login() {
  return (
    <div className="login-page">
      <Typography.Title level={1} className="login-page-title">
        Вход
      </Typography.Title>
      <div className="blur-ellipse" aria-hidden="true" />
      <div className="login-form-wrapper">
        <AuthForm />
      </div>
    </div>
  )
}
