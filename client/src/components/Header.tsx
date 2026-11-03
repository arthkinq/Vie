import { Link, NavLink } from 'react-router'
import { useAppSelector } from '../store'

export default function Header() {
  const token = useAppSelector((state) => state.auth.token)

  return (
    <header className="header">
      <Link to="/">VIE</Link>
      <NavLink to="/" end>
        Главная
      </NavLink>
      <NavLink to="/ticket">Билет</NavLink>
      <NavLink to="/about">О нас</NavLink>
      <Link to="/search">Найти фильм</Link>
      {token ? <Link to="/profile">Профиль</Link> : <Link to="/login">Войти</Link>}
    </header>
  )
}
