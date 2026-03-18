#!/bin/bash
# ═══════════════════════════════════════════════
# TemplateName — Deploy Script
# Запуск: ./deploy.sh [setup|update|ssl|logs]
# ═══════════════════════════════════════════════

set -e

PROJECT_DIR="/opt/templatename"
COMPOSE_FILE="$PROJECT_DIR/docker-compose.prod.yml"

# Цвета
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

log() { echo -e "${GREEN}[✓]${NC} $1"; }
warn() { echo -e "${YELLOW}[!]${NC} $1"; }
error() { echo -e "${RED}[✗]${NC} $1"; exit 1; }

# ─── Первоначальная установка ───
setup() {
    log "Установка TemplateName..."

    # Зависимости
    if ! command -v docker &>/dev/null; then
        warn "Устанавливаю Docker..."
        curl -fsSL https://get.docker.com | sh
        systemctl enable docker && systemctl start docker
    fi

    if ! command -v docker-compose &>/dev/null && ! docker compose version &>/dev/null; then
        warn "Устанавливаю Docker Compose..."
        apt-get install -y docker-compose-plugin
    fi

    # Структура
    mkdir -p "$PROJECT_DIR"/{templatename-api,templatename-web,deploy/ssl}

    log "Скопируй файлы проекта:"
    echo "  scp templatename-api.zip server:$PROJECT_DIR/"
    echo "  scp templatename-web.zip server:$PROJECT_DIR/"
    echo ""
    echo "Затем:"
    echo "  cd $PROJECT_DIR"
    echo "  unzip templatename-api.zip -d templatename-api/"
    echo "  unzip templatename-web.zip -d templatename-web/"
    echo "  cp deploy/.env.example .env"
    echo "  nano .env  # заполни все переменные"
    echo "  ./deploy.sh ssl  # получи SSL"
    echo "  ./deploy.sh update  # запусти"
}

# ─── SSL через Let's Encrypt ───
ssl() {
    DOMAIN="${1:-DOMAIN.RU}"

    log "Получение SSL для $DOMAIN..."

    if ! command -v certbot &>/dev/null; then
        apt-get update && apt-get install -y certbot
    fi

    certbot certonly --standalone \
        -d "$DOMAIN" -d "www.$DOMAIN" \
        --non-interactive --agree-tos \
        --email "admin@$DOMAIN"

    # Копируем в проект
    cp "/etc/letsencrypt/live/$DOMAIN/fullchain.pem" "$PROJECT_DIR/deploy/ssl/"
    cp "/etc/letsencrypt/live/$DOMAIN/privkey.pem" "$PROJECT_DIR/deploy/ssl/"

    log "SSL установлен. Настрой автопродление:"
    echo "  echo '0 3 * * * certbot renew --quiet && cp /etc/letsencrypt/live/$DOMAIN/*.pem $PROJECT_DIR/deploy/ssl/ && docker compose -f $COMPOSE_FILE restart nginx' | crontab -"
}

# ─── Обновление / Запуск ───
update() {
    cd "$PROJECT_DIR"

    if [ ! -f .env ]; then
        error "Нет .env файла! Скопируй из deploy/.env.example и заполни."
    fi

    log "Сборка контейнеров..."
    docker compose -f docker-compose.prod.yml build --no-cache

    log "Запуск..."
    docker compose -f docker-compose.prod.yml up -d

    log "Ожидание запуска БД..."
    sleep 5

    log "Миграции..."
    docker compose -f docker-compose.prod.yml exec api php artisan migrate --force

    log "Кэширование..."
    docker compose -f docker-compose.prod.yml exec api php artisan config:cache
    docker compose -f docker-compose.prod.yml exec api php artisan route:cache
    docker compose -f docker-compose.prod.yml exec api php artisan view:cache

    log "Готово! Проверь:"
    echo "  https://$(grep NEXT_PUBLIC_SITE_URL .env | cut -d= -f2 | sed 's|https://||')"
}

# ─── Seed (первый запуск) ───
seed() {
    cd "$PROJECT_DIR"
    log "Заполнение БД тестовыми данными..."
    docker compose -f docker-compose.prod.yml exec api php artisan db:seed --force
    log "Готово!"
}

# ─── Логи ───
logs() {
    cd "$PROJECT_DIR"
    docker compose -f docker-compose.prod.yml logs -f --tail=100 "${1:-}"
}

# ─── Статус ───
status() {
    cd "$PROJECT_DIR"
    docker compose -f docker-compose.prod.yml ps
    echo ""
    echo "Диск:"
    docker system df
}

# ─── Backup ───
backup() {
    cd "$PROJECT_DIR"
    BACKUP_DIR="$PROJECT_DIR/backups"
    mkdir -p "$BACKUP_DIR"
    FILENAME="backup_$(date +%Y%m%d_%H%M%S).sql"

    log "Backup базы данных..."
    docker compose -f docker-compose.prod.yml exec -T postgres \
        pg_dump -U templatename templatename > "$BACKUP_DIR/$FILENAME"

    gzip "$BACKUP_DIR/$FILENAME"
    log "Сохранён: $BACKUP_DIR/${FILENAME}.gz"

    # Удаляем бэкапы старше 30 дней
    find "$BACKUP_DIR" -name "*.gz" -mtime +30 -delete
}

# ─── Main ───
case "${1:-}" in
    setup)  setup ;;
    update) update ;;
    ssl)    ssl "$2" ;;
    seed)   seed ;;
    logs)   logs "$2" ;;
    status) status ;;
    backup) backup ;;
    *)
        echo "Использование: $0 {setup|update|ssl|seed|logs|status|backup}"
        echo ""
        echo "  setup   — первоначальная установка (Docker, структура)"
        echo "  update  — сборка и запуск (build + up + migrate + cache)"
        echo "  ssl     — получение SSL через Let's Encrypt"
        echo "  seed    — заполнение БД тестовыми данными"
        echo "  logs    — просмотр логов (можно указать сервис: logs api)"
        echo "  status  — статус контейнеров"
        echo "  backup  — backup базы данных"
        ;;
esac
