import './Header.css'
import { Link, NavLink } from 'react-router'
import { useAppSelector } from '../store'

export default function Header() {
  const token = useAppSelector((state) => state.auth.token)

  return (
    <header className="header curtain-header">
      <Link to="/" className="header-logo">
        VIE
      </Link>

      <NavLink to="/" end>
        Главная
      </NavLink>

      <NavLink to="/ticket">Билет</NavLink>

      <NavLink to="/about">О нас</NavLink>

      <Link to="/search" className="header-search">
        Найти фильм
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          aria-hidden="true"
        >
          <circle cx="11" cy="11" r="7" />
          <path d="M16 16 L21 21" />
        </svg>
      </Link>

      <Link
        to={token ? '/profile' : '/login'}
        className="header-account"
        aria-label={token ? 'Профиль' : 'Войти'}
      />
    </header>
  )
}
