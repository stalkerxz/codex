# PROTOPOPOV PRODUCTION — Курс по фотосъёмке

## 1) Обоснование стека (5–7 строк)
- **Next.js + TypeScript** даёт быстрый TTFB/LCP, SEO для лендинга и единый UX для кабинета/симулятора.
- **Fastify + TypeScript** обеспечивает лёгкую и быструю API-инфраструктуру без тяжёлого фреймворка.
- **PostgreSQL + Prisma** дают стабильные миграции и строгие типы в коде.
- **Redis** подготовлен для очередей/вебхуков и уведомлений (BullMQ/Jobs при расширении).
- **S3/MinIO** — стандартный способ хранения медиа с CDN-friendly ссылками.
- **Docker Compose** упрощает локальную разработку и прод деплой на VPS.

## 2) Архитектура (словами)
- **Web (Next.js)**: лендинг, кабинет, курс и практикум. Встраивание симулятора как интерактивного блока.
- **API (Fastify)**: авторизация, контент курса, практикум, платежи, аналитика, админ-CRUD.
- **PostgreSQL**: курсы, уроки, контент, задания, попытки практикума, оплаты, роли.
- **MinIO/S3**: медиа-файлы (видео, изображения, домашние задания).
- **Redis**: очередь задач/вебхуков (готово для подключения).
- **Caddy**: reverse proxy + HTTPS в проде.

```
Client -> Next.js (Web)
  |            
  | REST API
  v
Fastify API -> PostgreSQL
        \-> S3 (MinIO/S3)
        \-> Redis (jobs/webhooks)
```

## 3) Дерево папок
```
/apps
  /api        Fastify API
  /web        Next.js UI
/packages
  /simulator  Библиотека физической модели практикума
/infra        Caddyfile
/prisma       (зарезервировано)
```

## 4) Схема БД (таблицы и связи)
- **User** (role, email, passwordHash) -> Enrollment, HomeworkSubmission, SimulatorAttempt, Payment
- **Course** -> Module -> Lesson -> LessonContentBlock
- **Lesson** -> Quiz -> QuizQuestion -> QuizAnswer
- **Lesson** -> Homework -> HomeworkSubmission
- **SimulatorScene** -> SimulatorTask -> SimulatorAttempt
- **Product** -> Payment -> Enrollment

Полная схема: `apps/api/prisma/schema.prisma`.

## 5) API (основные эндпойнты)
- `POST /auth/register`, `POST /auth/login`, `GET /auth/me`
- `GET /courses`, `GET /courses/:slug`, `GET /courses/lessons/:slug`, `POST /courses/progress`
- `GET /simulator/scenes`, `GET /simulator/tasks/:id`, `POST /simulator/evaluate`, `POST /simulator/attempts`
- `POST /payments/checkout`, `POST /payments/webhook`
- `POST /analytics/event`
- `POST /admin/courses`, `POST /admin/modules`, `POST /admin/lessons`, `POST /admin/simulator/scenes`

### Пример запроса
```bash
curl -X POST http://localhost:4000/simulator/evaluate \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"iso":200,"aperture":2.8,"shutter":0.008,"focalLength":50,"distance":2,"mode":"M","exposureComp":0,"metering":"matrix","wbKelvin":5600,"wbTint":0,"sensor":"full-frame","subjectSpeed":1,"cameraSpeed":0.5,"lightEV":9}'
```

## 6) Полный код проекта
Все файлы находятся в репозитории в папках `/apps`, `/packages`, `/infra`. Этот README описывает структуру и даёт ссылки на ключевые файлы.

## 7) Запуск и деплой
### Dev (локально)
```bash
pnpm install
cp .env.example .env
pnpm db:generate
pnpm db:migrate
pnpm db:seed
pnpm dev
```

Или через Docker:
```bash
docker compose up --build
```

### Prod (VPS)
1) Заполните `.env` с боевыми значениями (PostgreSQL, S3, домен).
2) Обновите `infra/Caddyfile` с вашим доменом.
3) Запуск:
```bash
docker compose -f docker-compose.prod.yml up -d --build
```

## 8) Как добавлять уроки/сцены и править модель симулятора
- **Новые уроки/модули**: через API `POST /admin/modules` + `POST /admin/lessons`.
- **Контент уроков**: через таблицу `LessonContentBlock` (text/video/simulator/attachments).
- **Сцены практикума**: через `POST /admin/simulator/scenes`.
- **Логика симулятора**: `packages/simulator/src/index.ts` — функции `computeExposure`, `computeDOF`, `computeMotionBlur`, `computeNoise`, `evaluateSettings`.
- **Сид контент**: `apps/api/prisma/seed.ts`.
