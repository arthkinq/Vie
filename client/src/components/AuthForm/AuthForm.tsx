import { useState } from 'react'
import { Button, Checkbox, Form, Input, Tabs } from 'antd'
import './AuthForm.css'
export type AuthMode = 'login' | 'register'

export interface AuthFormValues {
  username: string
  mail?: string
  password: string
  confirmPassword?: string
  remember?: boolean
}

export interface AuthFormProps {
  initialMode?: AuthMode
  onSubmit?: (values: AuthFormValues, mode: AuthMode) => void
}

export default function AuthForm({ initialMode = 'login', onSubmit }: AuthFormProps) {
  const [mode, setMode] = useState<AuthMode>(initialMode)
  const [form] = Form.useForm<AuthFormValues>()
  const tabItems = [
    { key: 'login', label: 'Войти' },
    { key: 'register', label: 'Создать' },
  ]
  const handleTabChange = (key: string) => {
    setMode(key as AuthMode)
    form.resetFields()
  }
  const handleFinish = (values: AuthFormValues) => {
    onSubmit?.(values, mode)
  }

  return (
    <div className="auth-form-container">
      <Tabs activeKey={mode} onChange={handleTabChange} centered items={tabItems} />

      <Form
        form={form}
        layout="vertical"
        onFinish={handleFinish}
        initialValues={{ remember: false }}
      >
        {mode === 'login' && (
          <>
            {' '}
            <Form.Item
              validateTrigger="onBlur"
              name="username"
              rules={[
                { required: true, message: 'Введите логин или почту' },
                { whitespace: true, message: 'Поле не может состоять только из пробелов' },
                () => ({
                  validator(_, value) {
                    if (!value) {
                      return Promise.resolve()
                    }
                    if (value.includes('@')) {
                      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
                      if (!emailRegex.test(value)) {
                        return Promise.reject(new Error('Введен некорректный адрес почты!'))
                      }
                      return Promise.resolve()
                    }
                    if (value.length < 3) {
                      return Promise.reject(new Error('Логин должен содержать минимум 3 символа!'))
                    }
                    if (!/^[a-zA-Z0-9_.-]+$/.test(value)) {
                      return Promise.reject(
                        new Error('Логин может содержать только латиницу, цифры и символы _ . -'),
                      )
                    }
                    return Promise.resolve()
                  },
                }),
              ]}
            >
              <Input placeholder="username or mail" />
            </Form.Item>
            <Form.Item
              name="password"
              validateTrigger="onBlur"
              rules={[{ required: true, message: 'Введите пароль' }]}
            >
              <Input.Password placeholder="password" />
            </Form.Item>
          </>
        )}

        {mode === 'register' && (
          <>
            <Form.Item
              validateTrigger="onBlur"
              name="username"
              rules={[
                { required: true, message: 'Введите имя пользователя' },
                { whitespace: true, message: 'Поле не может состоять только из пробелов' },
                { min: 3, message: 'Имя пользователя должно содержать минимум 3 символа!' },
                {
                  pattern: /^[a-zA-Z0-9_.-]+$/,
                  message:
                    'Имя пользователя может содержать только латиницу, цифры и символы _ . -',
                },
              ]}
            >
              <Input placeholder="username" />
            </Form.Item>

            <Form.Item
              validateTrigger="onBlur"
              name="mail"
              rules={[
                { required: true, message: 'Введите почту' },
                { type: 'email', message: 'Введен некорректный адрес почты!' },
              ]}
            >
              <Input placeholder="example@mail.com" />
            </Form.Item>
            <Form.Item
              name="password"
              validateTrigger="onBlur"
              rules={[
                { required: true, message: 'Введите пароль' },
                { min: 8, message: 'Пароль должен содержать минимум 8 символов' },
                {
                  pattern: /^(?=.*[a-zа-яё])(?=.*[A-ZА-ЯЁ])(?=.*\d).+$/,
                  message:
                    'Пароль должен содержать минимум одну заглавную букву, одну строчную и одну цифру!',
                },
              ]}
            >
              <Input.Password placeholder="password" />
            </Form.Item>
            <Form.Item
              name="confirmPassword"
              dependencies={['password']}
              rules={[
                { required: true, message: 'Повторите пароль' },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue('password') === value) {
                      return Promise.resolve()
                    }
                    return Promise.reject(new Error('Пароли не совпадают!'))
                  },
                }),
              ]}
            >
              <Input.Password placeholder="repeat password" />
            </Form.Item>
          </>
        )}

        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 24,
          }}
        >
          <Form.Item name="remember" valuePropName="checked" noStyle>
            <Checkbox>Запомнить</Checkbox>
          </Form.Item>

          <Button type="link" style={{ padding: 0 }}>
            Забыли пароль?
          </Button>
        </div>
        <Form.Item>
          <Button type="primary" htmlType="submit">
            {mode === 'login' ? 'ВОЙТИ' : 'СОЗДАТЬ'}
          </Button>
        </Form.Item>
      </Form>
    </div>
  )
}
