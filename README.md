# MonteMove Core

Монорепозиторий проекта MonteMove.

## Структура

```
packages/
├── api/           # NestJS Backend (@montemove/api)
└── frontend/      # Next.js Frontend (@montemove/frontend)
```

## Быстрый старт

```bash
# Установка
pnpm install
cp .env.example .env

# База данных
pnpm docker:up
pnpm db:generate
pnpm db:migrate

# Разработка
pnpm dev              # Все сервисы
pnpm dev:api          # Backend (localhost:3000)
pnpm dev:frontend     # Frontend (localhost:3001)
```

## Команды

```bash
# Разработка
pnpm dev              # Запуск всех сервисов
pnpm dev:api          # Только API
pnpm dev:frontend     # Только frontend

# Сборка
pnpm build            # Сборка всех проектов
pnpm build:api
pnpm build:frontend

# База данных
pnpm db:generate      # Генерация Prisma Client
pnpm db:migrate       # Миграции (dev)
pnpm db:deploy        # Миграции (prod)

# Docker
pnpm docker:up        # Запуск PostgreSQL
pnpm docker:down      # Остановка PostgreSQL

# Утилиты
pnpm lint             # Линтинг
pnpm format           # Форматирование
pnpm test             # Тесты
pnpm clean            # Очистка
```

## Стек

**Backend:** NestJS 11, PostgreSQL, Prisma, JWT  
**Frontend:** Next.js 15, React 19, TailwindCSS, Zustand
