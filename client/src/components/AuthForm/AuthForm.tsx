import { useState } from 'react'
import { Form, Tabs  } from 'antd'

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

export default function AuthForm({initialMode = 'login', onSubmit}: AuthFormProps) {
    const [mode, setMode] = useState<AuthMode>(initialMode)

    const [form] = Form.useForm<AuthFormValues>()  

    return (
        <div>
            <span>Режим: {mode} </span>
        </div>
    )
}