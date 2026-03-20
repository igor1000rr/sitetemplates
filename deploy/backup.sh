#!/bin/bash
# ═══ Автобэкап PostgreSQL ═══
# Запускать через cron: 0 3 * * * /opt/sitetemplates/deploy/backup.sh

BACKUP_DIR="/opt/backups/sitetemplates"
COMPOSE_DIR="/opt/sitetemplates"
KEEP_DAYS=14

mkdir -p "$BACKUP_DIR"

TIMESTAMP=$(date +%Y%m%d_%H%M%S)
FILENAME="db_${TIMESTAMP}.sql.gz"

# Загружаем переменные из .env
source "${COMPOSE_DIR}/.env" 2>/dev/null
DB_USER="${DB_USERNAME:-templatename}"
DB_NAME="${DB_DATABASE:-templatename}"

# Дамп через docker
cd "$COMPOSE_DIR"
docker compose exec -T postgres pg_dump -U "$DB_USER" -d "$DB_NAME" | gzip > "${BACKUP_DIR}/${FILENAME}"

if [ $? -eq 0 ] && [ -s "${BACKUP_DIR}/${FILENAME}" ]; then
    echo "✅ Backup: ${FILENAME} ($(du -h "${BACKUP_DIR}/${FILENAME}" | cut -f1))"
else
    echo "❌ Backup failed!"
    rm -f "${BACKUP_DIR}/${FILENAME}"
    exit 1
fi

# Удаляем старые
find "$BACKUP_DIR" -name "db_*.sql.gz" -mtime +${KEEP_DAYS} -delete
echo "Cleaned backups older than ${KEEP_DAYS} days"
