import { useState } from 'react'
import { Button, Checkbox, Form, Input, Tabs } from 'antd'
import './AuthForm.css'
export type AuthMode = 'login' | 'register'

export interface AuthFormValues {
  username: string
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
    <div style={{ maxWidth: 360, margin: '0 auto' }}>
      <Tabs activeKey={mode} onChange={handleTabChange} centered items={tabItems} />

      <Form
        form={form}
        layout="vertical"
        onFinish={handleFinish}
        initialValues={{ remember: false }}
      >
        <Form.Item
          name="username"
          rules={[
            { required: true, message: 'Введите почту' },
            { min: 3, message: 'Минимум 3 символа' },
          ]}
        >
          <Input placeholder="username or mail" />
        </Form.Item>
        <Form.Item
          name="password"
          rules={[
            { required: true, message: 'Введите пароль' },
            { min: 8, message: 'Пароль должен содержать минимум 8 символов' },
          ]}
        >
          <Input.Password placeholder="password" />
        </Form.Item>
        {mode === 'register' && (
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
