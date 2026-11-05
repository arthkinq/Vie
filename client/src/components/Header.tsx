import './Header.css'
import { Link, NavLink } from 'react-router'
import { useAppSelector } from '../store'

function ProfileIcon() {
  return (
    <svg width="100%" height="100%" viewBox="0 0 100 100" aria-hidden="true">
      <defs>
        <clipPath id="avatar-circle">
          <circle cx="50" cy="50" r="50" />
        </clipPath>
      </defs>

      <circle cx="50" cy="50" r="50" fill="#FFF9AD" />

      <g clipPath="url(#avatar-circle)" fill="#5C4B2A">
        <path
          d="
          M29 44
          C27 24 35 14 50 14
          C65 14 73 24 71 44
          C77 42 78 50 74 56
          C73 59 71 60 69 60
          C67 69 62 74 62 79
          L62 84
          C78 88 91 94 100 101
          H0
          C9 94 22 88 38 84
          V79
          C38 74 33 69 31 60
          C29 60 27 59 26 56
          C22 50 23 42 29 44
          Z
        "
        />
      </g>
    </svg>
  )
}

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
      {token ? (
        <Link to="/profile" className="header-account" aria-label="Профиль">
          <ProfileIcon />
        </Link>
      ) : (
        <Link to="/login" className="header-account" aria-label="Войти">
          <ProfileIcon />
        </Link>
      )}
    </header>
  )
}
