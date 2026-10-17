import { Link, NavLink } from 'react-router'

export default function Header() {
  return (
    <header className="header">
      <Link to="/">VIE</Link>
      <NavLink to="/" end>
        Главная
      </NavLink>
      <NavLink to="/ticket">Билет</NavLink>
      <NavLink to="/about">О нас</NavLink>
      <Link to="/search">Найти фильм</Link>
      <Link to="/profile">Профиль</Link>
    </header>
  )
}
