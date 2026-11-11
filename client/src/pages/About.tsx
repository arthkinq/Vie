
import './About.css'

export default function About() {
  return (
    <main className="about-page">
      <h1 className="about-title">О НАШЕМ КИНОТЕАТРЕ</h1>

      <section className="about-description">
        <p>
          VIE – РЕКОМЕНДАТЕЛЬНАЯ ПЛАТФОРМА И ПЕРСОНАЛЬНЫЙ ТРЕКЕР ФИЛЬМОВ
          В ЭСТЕТИКЕ КЛАССИЧЕСКОГО АМЕРИКАНСКОГО КИНОТЕАТРА.
          МЫ ХОТИМ ВЕРНУТЬ ПРОСМОТРУ КИНО ОЩУЩЕНИЕ НАСТОЯЩЕГО СОБЫТИЯ.
          ЗДЕСЬ МОЖНО НАХОДИТЬ ФИЛЬМЫ ПО СВОЕМУ ВКУСУ, СТАВИТЬ ОЦЕНКИ,
          СОХРАНЯТЬ КАРТИНЫ НА ПОТОМ И ДЕЛИТЬСЯ ВПЕЧАТЛЕНИЯМИ.
          РЕКОМЕНДАЦИИ VIE ФОРМИРУЮТСЯ ПЕРСОНАЛЬНО НА ОСНОВЕ ВАШИХ
          ОЦЕНОК, ПОЭТОМУ СО ВРЕМЕНЕМ КАТАЛОГ ВСЁ ТОЧНЕЕ ОТРАЖАЕТ
          ИМЕННО ВАШ ВКУС.
        </p>
      </section>

      <section className="about-features">
        <h2>Наши возможности</h2>

        <ul className="about-features-list">
          <li>
            <svg
              className="about-feature-icon"
              viewBox="0 0 24 24"
              fill="currentColor"
              aria-hidden="true"
            >
              <path d="m12 2 3.1 6.3 7 1-5.1 5 .9 7L12 18l-6.9 3.3.9-7-5.1-5 7-1L12 2Z" />
            </svg>
            <span>ОЦЕНИВАТЬ ФИЛЬМЫ</span>
          </li>

          <li>
            <svg
              className="about-feature-icon"
              viewBox="0 0 24 24"
              fill="currentColor"
              aria-hidden="true"
            >
              <path d="M20.5 3.5C15 2 9 6 6 12l-2 5-2 5 5-2 5-2c6-3 10-9 8.5-14.5ZM3 21l11-11" />
            </svg>
            <span>ОСТАВЛЯТЬ ОТЗЫВЫ</span>
          </li>

          <li>
            <span className="about-ticket-icon" aria-hidden="true">
              СКАЧАТЬ
            </span>
            <span>СОЗДАВАТЬ КОЛЛЕКЦИОННЫЕ БИЛЕТЫ</span>
          </li>
        </ul>
      </section>

      <section className="about-team">
        <h2>Наша команда</h2>

        <ul className="about-team-list">
          <li>
            <strong>Сланов Артур</strong>
            <span> — архитектура и backend.</span>
          </li>

          <li>
            <strong>Слудная Виктория</strong>
            <span> — логика приложения и авторизация.</span>
          </li>

          <li>
            <strong>Тетман Юлия</strong>
            <span> — каталог фильмов и разработка карточек фильмов.</span>
          </li>

          <li>
            <strong>Герасимова Алина</strong>
            <span> — дизайн и визуальная система.</span>
          </li>
        </ul>
      </section>
    </main>
  )
}
