#!/usr/bin/env bash
# ─── Entrypoint سرویس لاراول گینان‌کالا ───
# ۱) اگر vendor نبود: composer install   ۲) کلید اپ   ۳) migrate + seed   ۴) php-fpm
set -e
cd /var/www/html

if [ ! -f vendor/autoload.php ]; then
  echo "[gnk] composer install ..."
  composer install --no-interaction --prefer-dist --quiet
fi

if [ ! -f .env ]; then
  cp .env.example .env
fi

if ! grep -q '^APP_KEY=base64:' .env 2>/dev/null; then
  php artisan key:generate --force --no-interaction
fi

echo "[gnk] migrate + seed ..."
php artisan migrate --force --seed --no-interaction

# کش‌سازی کانفیگ/روت در پروداکشن
if [ "${APP_ENV:-local}" = "production" ]; then
  php artisan config:cache && php artisan route:cache && php artisan view:cache || true
fi

# public/storage symlink (برای آواتار/آپلودها)
php artisan storage:link --force 2>/dev/null || true

exec php-fpm
