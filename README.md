# TemplateName

Маркетплейс готовых шаблонов сайтов с AI-подбором, подписками, доп. услугами и разработкой под ключ.

## Стек

- **Frontend:** Next.js 14 (App Router, SSR)
- **Backend:** Laravel 11 API
- **Admin:** Filament
- **БД:** PostgreSQL
- **Кэш/Очереди:** Redis
- **Хранилище:** S3
- **Оплата:** ЮKassa
- **Деплой:** Docker Compose + nginx + SSL

## Структура

```
templatename/
├── api/          # Laravel 11 backend (240+ файлов)
├── web/          # Next.js 14 frontend (200+ файлов)
├── deploy/       # Docker, nginx, deploy.sh
├── database.sql  # Справочник структуры БД
└── .env.example  # Переменные окружения
```

## Быстрый старт

```bash
# 1. Клонировать
git clone git@github.com:antsincgame/templatename.git
cd templatename

# 2. Настроить переменные
cp .env.example .env
# Заполнить .env (ЮKassa, S3, Telegram, OAuth)

# 3. Запустить
chmod +x deploy/deploy.sh
./deploy/deploy.sh setup

# 4. SSL (после настройки DNS)
./deploy/deploy.sh ssl
```

## Автодеплой

Для Coolify: указать репо `antsincgame/templatename`, docker-compose.prod.yml из `deploy/`.

## Реквизиты

ИП Гладкий Сергей Владимирович  
ИНН 502754420766 · ОГРНИП 326508100130650
