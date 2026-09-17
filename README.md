# Vie — Retro Cinema Film Tracking & Recommendation Platform

Веб-приложение для оценки фильмов и сериалов с персональной рекомендательной системой в стилистике классических американских кинотеатров.

- **Репозиторий:** https://github.com/arthkinq/Vie
- **Таск-трекер:** https://github.com/users/arthkinq/projects/4
- **Figma mood board:** https://www.figma.com/design/RGtTFiKy4XuldtptDkBGrt/Untitled?node-id=2-3&t=ORyeURrubKocK7Py-1
- **User & Data flow:** https://www.figma.com/design/stKbFwJKHEW67ln7teMQUD/G1.1-%E2%80%94-User-Flow?node-id=7-3&t=08FVfEL1L2we1hY8-1

---

## Основной функционал

1. **Витрина и трекинг:** Каталог фильмов, выставление оценок (1–10), ведение списков просмотренного и «Хочу посмотреть».
2. **Клиентская рекомендательная система (Web Worker #1):**
3. **Генератор ретро-билетов (Web Worker #2 / Canvas 2D):**

---

## Стек технологий *(предварительный, может корректироваться)*

- **Клиент:** React 18, TypeScript, Vite, Redux Toolkit.
- **Интерфейс:** Ant Design (`antd`), кастомные ретро-стили (CSS Modules, неон, анимации).
- **Web API & Threads:** Web Workers API, Canvas 2D / OffscreenCanvas API.
- **Сервер:** Node.js (Fastify, TypeScript, SQLite).
- **Тестирование и качество:** Vitest (unit/integration, coverage $\ge 80\%$), Playwright (E2E), ESLint.
- **Контейнеризация:** Docker Compose, `Makefile` (`make run`).

---

## Команда проекта

| Участник         | Роль / Зона ответственности |
|------------------|-----------------------------|
| **Артур (Lead)** | Архитектура, Бэкенд, Воркер |
| **Вика (CTO)**   | Стейт, Роутинг, Тесты |
| **Юля (CEO)**    | UI-компоненты, Аналитика    |
| **Алина (COO)**  | Стили, Анимации, Лейаут     |
