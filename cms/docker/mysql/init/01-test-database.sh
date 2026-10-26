#!/usr/bin/env bash
(
    set -euo pipefail
    if [[ ! "$MYSQL_USER" =~ ^[A-Za-z0-9_]+$ ]]; then
        printf 'MYSQL_USER must contain only letters, numbers, and underscores.\n' >&2
        exit 1
    fi
    export MYSQL_PWD="$MYSQL_ROOT_PASSWORD"
    mysql --user=root --protocol=socket <<SQL
CREATE DATABASE IF NOT EXISTS folio_cms_test CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
GRANT ALL PRIVILEGES ON folio_cms_test.* TO '$MYSQL_USER'@'%';
SQL
)
