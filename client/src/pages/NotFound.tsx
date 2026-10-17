import { Typography } from 'antd'
import { Link } from 'react-router'

export default function NotFound() {
  return (
    <div>
      <Typography.Title>Страница не найдена</Typography.Title>
      <Link to="/">На главную</Link>
    </div>
  )
}
