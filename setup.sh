#!/bin/bash
# AITempl — Полная установка на VPS
# Запуск: bash setup.sh

set -e

echo "========================================="
echo "  AITempl — Установка на VPS"
echo "========================================="

# ─── 1. Обновление системы ───
echo ""
echo ">>> [1/8] Обновление системы..."
apt update && apt upgrade -y
apt install -y curl git ufw htop

# ─── 2. Docker + Docker Compose ───
echo ""
echo ">>> [2/8] Установка Docker..."
if ! command -v docker &> /dev/null; then
    # Установка из официального подписанного apt-репозитория Docker
    # (без `curl | sh` — не выполняем неаутентифицированный скрипт из сети под root)
    install -m 0755 -d /etc/apt/keyrings
    curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc
    chmod a+r /etc/apt/keyrings/docker.asc
    echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/ubuntu $(. /etc/os-release && echo "$VERSION_CODENAME") stable" > /etc/apt/sources.list.d/docker.list
    apt update
    apt install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
    systemctl enable docker
    systemctl start docker
    echo "Docker установлен: $(docker --version)"
else
    echo "Docker уже установлен: $(docker --version)"
fi

if ! command -v docker compose &> /dev/null; then
    apt install -y docker-compose-plugin
fi
echo "Docker Compose: $(docker compose version)"

# ─── 3. Swap (страховка для 4 ГБ RAM) ───
echo ""
echo ">>> [3/8] Настройка swap..."
if [ ! -f /swapfile ]; then
    fallocate -l 2G /swapfile
    chmod 600 /swapfile
    mkswap /swapfile
    swapon /swapfile
    echo '/swapfile none swap sw 0 0' >> /etc/fstab
    echo "vm.swappiness=10" >> /etc/sysctl.conf
    sysctl -p
    echo "Swap 2 ГБ создан"
else
    echo "Swap уже существует"
fi

# ─── 4. Firewall ───
echo ""
echo ">>> [4/8] Настройка firewall..."
ufw --force reset
ufw default deny incoming
ufw default allow outgoing
ufw allow 22/tcp    # SSH
ufw allow 80/tcp    # HTTP
ufw allow 443/tcp   # HTTPS
ufw --force enable
echo "UFW активирован: SSH + HTTP + HTTPS"

# ─── 5. Клонирование репозитория ───
echo ""
echo ">>> [5/8] Клонирование репозитория..."
cd /opt
if [ -d "sitetemplates" ]; then
    echo "Репо уже существует, обновляем..."
    cd sitetemplates
    git pull
else
    git clone https://github.com/igor1000rr/sitetemplates.git
    cd sitetemplates
fi
echo "Репо: $(pwd)"

# ─── 6. Создание .env ───
echo ""
echo ">>> [6/8] Создание .env..."
if [ ! -f .env ]; then
    cp .env.example .env

    # Генерируем случайные пароли
    DB_PASS=$(openssl rand -base64 18 | tr -dc 'a-zA-Z0-9' | head -c 24)
    REDIS_PASS=$(openssl rand -base64 18 | tr -dc 'a-zA-Z0-9' | head -c 24)
    APP_KEY_RAW=$(openssl rand -base64 32)

    sed -i "s|APP_KEY=base64:GENERATE_WITH_php_artisan_key_generate|APP_KEY=base64:${APP_KEY_RAW}|" .env
    sed -i "s|DB_PASSWORD=CHANGE_ME|DB_PASSWORD=${DB_PASS}|" .env
    sed -i "s|REDIS_PASSWORD=CHANGE_ME|REDIS_PASSWORD=${REDIS_PASS}|" .env

    echo ""
    echo "╔══════════════════════════════════════════╗"
    echo "║  .env создан с автоматическими паролями  ║"
    echo "║                                          ║"
    echo "║  DB/REDIS пароли записаны в .env         ║"
    echo "║  (в консоль/логи не выводим — см. .env)  ║"
    echo "║                                          ║"
    echo "║  ⚠️  ЗАПОЛНИ ВРУЧНУЮ:                    ║"
    echo "║  - YUKASSA_SHOP_ID / SECRET_KEY          ║"
    echo "║  - AWS (S3) ключи                        ║"
    echo "║  - TELEGRAM_BOT_TOKEN / CHAT_ID          ║"
    echo "║  - GOOGLE / YANDEX OAuth                 ║"
    echo "║  - MAIL настройки                        ║"
    echo "║                                          ║"
    echo "║  nano /opt/sitetemplates/.env             ║"
    echo "╚══════════════════════════════════════════╝"
else
    echo ".env уже существует"
fi

# ─── 7. Docker Compose: подготовка ───
echo ""
echo ">>> [7/8] Подготовка Docker Compose..."

# Копируем compose в корень проекта
cp deploy/docker-compose.prod.yml docker-compose.yml

# Создаём директорию для SSL
mkdir -p deploy/ssl

echo "Docker Compose готов"

# ─── 8. Запуск ───
echo ""
echo ">>> [8/8] Запуск контейнеров..."
docker compose build --no-cache
docker compose up -d

echo ""
echo "Ждём пока контейнеры поднимутся..."
sleep 15

# Проверка
echo ""
echo "========================================="
echo "  Статус контейнеров:"
echo "========================================="
docker compose ps

echo ""
echo "========================================="
echo "  Проверка здоровья:"
echo "========================================="
curl -sf http://localhost:8000/api/health 2>/dev/null && echo "" || echo "API ещё запускается..."
curl -sf http://localhost:3000/ > /dev/null 2>&1 && echo "Frontend: OK" || echo "Frontend ещё запускается..."

echo ""
echo "========================================="
echo "  ГОТОВО!"
echo "========================================="
echo ""
echo "  Сервер: http://147.45.155.40"
echo "  Админка: http://147.45.155.40/panel"
echo ""
echo "  Следующие шаги:"
echo "  1. nano /opt/sitetemplates/.env  — заполнить ключи"
echo "  2. docker compose restart       — перезапустить"
echo "  3. Привязать домен (DNS A-запись → 147.45.155.40)"
echo "  4. Установить SSL:"
echo "     apt install certbot"
echo "     certbot certonly --standalone -d aitempl.ru"
echo "     # скопировать сертификаты в deploy/ssl/"
echo "     docker compose restart"
echo ""
