#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."
case "${1:-start}" in
    start)
        php scripts/local-env.php --docker
        docker compose up -d --wait --wait-timeout 120 mysql
        snapshot=storage/app/private/mysql-snapshot.sql
        if [ -f "$snapshot" ]; then
            table_count=$(php -r 'require "vendor/autoload.php"; $app = require "bootstrap/app.php"; $app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap(); echo count(Illuminate\Support\Facades\Schema::getTableListing());')
            if [ "$table_count" -eq 0 ]; then
                docker compose exec -T mysql sh -c 'export MYSQL_PWD="$MYSQL_PASSWORD"; exec mysql --user="$MYSQL_USER" --database="$MYSQL_DATABASE"' < "$snapshot"
                printf 'Restored the private MySQL snapshot into the empty database.\n'
            fi
        fi
        ;;
    backup)
        umask 077
        mkdir -p storage/app/private
        snapshot_tmp=$(mktemp storage/app/private/mysql-snapshot.XXXXXX)
        trap 'rm -f "$snapshot_tmp"' EXIT
        docker compose exec -T mysql sh -c 'export MYSQL_PWD="$MYSQL_PASSWORD"; exec mysqldump --user="$MYSQL_USER" --single-transaction --no-tablespaces --set-gtid-purged=OFF "$MYSQL_DATABASE"' > "$snapshot_tmp"
        test -s "$snapshot_tmp"
        mv "$snapshot_tmp" storage/app/private/mysql-snapshot.sql
        printf 'Database backup saved privately to storage/app/private/mysql-snapshot.sql.\n'
        ;;
    *) printf 'Usage: scripts/mysql.sh [start|backup]\n' >&2; exit 1 ;;
esac
