# ─── ایمیج لاراول (PHP-FPM) — مرجع پروداکشن ───
FROM php:8.3-fpm-alpine

# افزونه‌های موردنیاز لاراول
RUN apk add --no-cache \
      bash curl git unzip icu-dev libzip-dev libpng-dev oniguruma-dev freetype-dev libjpeg-turbo-dev \
  && docker-php-ext-configure gd --with-freetype --with-jpeg \
  && docker-php-ext-install -j"$(nproc)" \
      pdo_mysql mbstring zip exif pcntl bcmath gd intl opcache

# Redis
RUN apk add --no-cache --virtual .build-deps $PHPIZE_DEPS \
  && pecl install redis \
  && docker-php-ext-enable redis \
  && apk del .build-deps

# OPcache — تنظیمات پروداکشن
RUN { \
      echo 'opcache.enable=1'; \
      echo 'opcache.memory_consumption=256'; \
      echo 'opcache.max_accelerated_files=20000'; \
      echo 'opcache.validate_timestamps=0'; \
    } > /usr/local/etc/php/conf.d/opcache.ini

# Composer
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

WORKDIR /var/www/html

# در پروداکشن: composer install --no-dev --optimize-autoloader
# و سپس: php artisan config:cache route:cache view:cache migrate --force scout:import
CMD ["php-fpm"]
