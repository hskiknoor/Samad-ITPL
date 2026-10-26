#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."
export NPM_CONFIG_CACHE="${NPM_CONFIG_CACHE:-/tmp/folio-npm-cache}"
use_docker=0
seed_demo=0
for option in "$@"; do
    case "$option" in
        --docker) use_docker=1 ;;
        --demo) seed_demo=1 ;;
        *) printf 'Usage: scripts/setup.sh [--docker] [--demo]\n' >&2; exit 1 ;;
    esac
done
if [ "$use_docker" -eq 1 ]; then
    php scripts/local-env.php --docker
else
    php scripts/local-env.php
fi
composer install --prefer-dist --no-interaction
npm ci --ignore-scripts
php artisan config:clear --no-interaction
if ! php -r '$env = file_get_contents(".env"); exit(preg_match("/^APP_KEY=.+$/m", $env) ? 0 : 1);'; then
    php artisan key:generate --no-interaction
fi
if [ "$use_docker" -eq 1 ]; then
    bash scripts/mysql.sh start
fi
if [ "$seed_demo" -eq 1 ]; then
    php artisan cms:install --demo --no-interaction
else
    php artisan cms:install --no-interaction
fi
if [ ! -e public/storage ] && [ ! -L public/storage ]; then
    php artisan storage:link --no-interaction
fi
npm run build
printf 'MySQL setup complete. Start the application with scripts/dev.sh.\n'
