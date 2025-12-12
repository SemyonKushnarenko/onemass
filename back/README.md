# Mood Tracker (Telegram Mini-App)

NestJS + React (Vite) мини-приложение под Telegram c оплатой Stars, напоминаниями и кабинетом психолога.

## Запуск локально (Docker)
```bash
cd back
cp .env.example .env  # пропишите BOT_TOKEN, Postgres/Redis
docker-compose up --build
```
Сервисы:
- backend: http://localhost:7214 (Swagger: http://localhost:7214/api)
- frontend: http://localhost:4173
- Postgres: 5432
- Redis: 6379

> В docker-compose фронтенд собирается с `VITE_API_URL=http://app:7214`, поэтому внутри сети контейнеров API доступен по имени `app`.

### Важные переменные
- BOT_TOKEN — токен Telegram-бота.
- TELEGRAM_CHECK_SIGNATURE=false — отключить проверку подписи initData для локальной отладки. В проде включите (true / уберите).
- PSYCHOLOGIST_IDS=123,456 — whitelist Telegram ID психологов.
- DAILY_NOTIFY_CRON=0 9 * * * — рассылка напоминаний (UTC).
- POSTGRES_HOST/USER/PASS/NAME, REDIS_HOST/PORT.

## API (MVP)
- POST `/auth/init` — валидация initData, создание пользователя, возврат роли и подписки.
- POST `/mood/submit` — сохранить настроение (1–5, comment). value<3 создаёт уведомление психологу.
- GET `/mood/list` — записи за период (по умолчанию 30 дней, последние сначала).
- GET `/mood/stats` — средние за месяц/год (простое среднее по всем отметкам, без группировки по дням).
- GET `/psychologist/patients` — пациенты психолога (с последними mood).
- GET `/psychologist/patient/:id` — детали пациента + все его записи за месяц.
- POST `/billing/subscribe` — invoice Stars для пациента.
- POST `/billing/add-patient` — invoice Stars (10 Stars) на добавление пациента и создание реферала.
- POST `/billing/webhook` — принимает `{ payload }`, помечает платёж как PAID и выполняет доменные действия.
- POST `/events/notify/daily` — ручной триггер ежедневных напоминаний.

## Платежи (Stars)
- Создание инвойса через Bot API `createInvoiceLink`.
- `/billing/subscribe` — цель PATIENT_SUBSCRIPTION, payload `sub-*`, после webhook подписка активируется.
- `/billing/add-patient` — цель ADD_PATIENT, payload = refCode, сумма 10 Stars. После webhook реферал становится активным, а при активации пациентом создаётся связь психолог-пациент.
- Вебхук упрощён: требуется только тело `{ payload }` (подпись апдейта Telegram не проверяется).

## Уведомления
- BullMQ + Redis, очередь `notifications`.
- Повторяющаяся задача `daily-broadcast` (cron) шлёт пациентам «Не забудьте отметить настроение».
- LOW_MOOD_ALERT: если пациент сохраняет value<3, всем привязанным психологам приходит Telegram-сообщение.
- Все отправки логируются в `notifications_log`.

## Стратегия данных
- Все отметки хранятся как есть. Для статистики берётся простое среднее по отметкам за окно (месяц/год). Список за день показывает последнюю отметку по фактической дате `date`.

## Миграции
- Схема описана в entities (users, moods, psychologists, psychologist_patients, referrals, payments, notifications_log).
- Сгенерируйте при необходимости: `npm run migration:generate --name Init` и примените `npm run migration:run`.

## Локальная отладка без Telegram
- Поставьте `TELEGRAM_CHECK_SIGNATURE=false` и передайте в фронт `VITE_INIT_DATA` (захваченный initData из WebApp). Authorization заголовок — это initData целиком.

## Тесты
- Юнит/покрытие: `npm run test:cov`
- E2E: `npm run test:e2e` (использует тестовые POSTGRES_* при наличии).
