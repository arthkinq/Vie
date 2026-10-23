import { useState } from 'react'
import {  Button, Checkbox, Form, Input, Tabs } from 'antd'

export type AuthMode = 'login' | 'register'

export interface AuthFormValues {
    username?: string
    password?: string
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
    const handleFinish = ( values: AuthFormValues) => {
        onSubmit?.(values, mode)
    }

    return (
        <div style={{ maxWidth: 360, margin: '0 auto' }}>
            <Form form = {form}
            layout='vertical'
            onFinish={handleFinish}
            initialValues={{remember:true}}>
                <Form.Item name='username'
                rules={[
                    {required: true, message: 'Введите имя пользователя или почту'},
                    {min: 3, message: 'Минимум 3 символа'}
                ]}
                >
                    <Input placeholder='username or mail'></Input>
                </Form.Item>
                <Form.Item name='password'
                rules ={[
                    {required: true, message: 'Введите пароль'},
                    {min:6, message: 'Пароль должен содержать минимум 6 символов' },
                ]}>
                    <Input.Password placeholder='password'></Input.Password>
                </Form.Item>
                
            </Form>
            <Tabs
                activeKey={mode}
                onChange={handleTabChange}
                centered
                items={tabItems}
            />
            <p style={{ textAlign: 'center' }}>Текущий режим: {mode}</p>
        </div>
    )
}