# Как контрибьютить

Работаем по [GitHub flow](https://docs.github.com/ru/get-started/using-github/github-flow).

1. Ветка `main` защищена, напрямую в неё пушить нельзя.
2. Под каждую задачу создаём ветку от `main`: `feature/название`, `fix/название`.
3. Коммитим маленькими кусками, сообщения коротко и по делу.
4. Открываем Pull Request и заполняем шаблон.
5. Мержим только когда CI зелёный: `lint`, `unit`, `coverage` (минимум 80%), `e2e`.

Перед PR локально, из папки `client`:

```
npm run lint
npm run format:check
npm test
npm run test:e2e
```

<!-- For G3.0: Rules of contribution verified! -->
