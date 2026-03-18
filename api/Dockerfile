FROM php:8.3-fpm-alpine AS base

# Extensions
RUN apk add --no-cache \
    postgresql-dev \
    libzip-dev \
    zip unzip curl \
    nginx supervisor \
    && docker-php-ext-install pdo pdo_pgsql zip pcntl opcache bcmath

# Redis
RUN apk add --no-cache --virtual .build-deps $PHPIZE_DEPS \
    && pecl install redis \
    && docker-php-ext-enable redis \
    && apk del .build-deps

# Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

WORKDIR /var/www/html

# Install deps (cache layer)
COPY composer.json ./
RUN composer install --no-dev --optimize-autoloader --no-interaction --no-scripts

# Copy app
COPY . .
RUN composer dump-autoload --optimize

# Create required directories
RUN mkdir -p storage/app/public storage/framework/cache storage/framework/sessions storage/framework/views storage/logs bootstrap/cache

# Config files
COPY docker/php.ini /usr/local/etc/php/conf.d/99-app.ini
COPY docker/supervisord.conf /etc/supervisord.conf
COPY docker/nginx-api.conf /etc/nginx/http.d/default.conf

# Permissions
RUN chown -R www-data:www-data storage bootstrap/cache \
    && chmod -R 775 storage bootstrap/cache

EXPOSE 8000

CMD ["/usr/bin/supervisord", "-c", "/etc/supervisord.conf"]
