# Frontend (Vite + React + TS)

Мини-UI под Telegram WebApp:
- Авторизация по `initData` (Authorization header).
- Экран пациента: отметка настроения, история, средние значения.
- Экран психолога: список пациентов, детальный просмотр, создание инвойса на добавление пациента (10 Stars).

## Локальный запуск
```bash
cd front
npm install
VITE_API_URL=http://localhost:7214 npm run dev
# если вне Telegram, передайте VITE_INIT_DATA=<captured_initData>
```

В Docker сборка получает `VITE_API_URL` через build-arg (см. docker-compose в `back/`).

## Поведение
- После `/billing/subscribe` или `/billing/add-patient` фронт пытается вызвать `Telegram.WebApp.openInvoice`, иначе открывает ссылку в новом окне.
- История и графики используют данные API; поле `mood` нормализуется из `value` ответа бекенда.
