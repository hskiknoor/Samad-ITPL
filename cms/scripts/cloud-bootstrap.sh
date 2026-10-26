#!/usr/bin/env bash
set -euo pipefail

runtime_root=/workspace/.setup
export COMPOSER_HOME=/workspace/.cache/composer
export COMPOSER_CACHE_DIR=/workspace/.cache/composer/cache
export NPM_CONFIG_CACHE=/workspace/.cache/npm
mkdir -p "$runtime_root/bin" "$COMPOSER_HOME" "$NPM_CONFIG_CACHE"

if ! "$runtime_root/bin/php" -r 'exit(PHP_VERSION_ID >= 80400 && extension_loaded("pdo_mysql") && extension_loaded("intl") ? 0 : 1);' >/dev/null 2>&1; then
    mkdir -p "$runtime_root/apt/lists/partial" "$runtime_root/apt/cache/archives/partial" "$runtime_root/apt/empty" "$runtime_root/php"
    cat > "$runtime_root/apt/sources.list" <<'SOURCES'
deb [signed-by=/usr/share/keyrings/debian-archive-keyring.gpg] https://deb.debian.org/debian trixie main
deb [signed-by=/usr/share/keyrings/debian-archive-keyring.gpg] https://security.debian.org/debian-security trixie-security main
SOURCES
    cat > "$runtime_root/apt/apt.conf" <<'CONFIG'
Dir::Etc::parts "/workspace/.setup/apt/empty";
Dir::Etc::main "/dev/null";
Dir::Etc::sourcelist "/workspace/.setup/apt/sources.list";
Dir::Etc::sourceparts "/workspace/.setup/apt/empty";
Dir::State::lists "/workspace/.setup/apt/lists";
Dir::Cache "/workspace/.setup/apt/cache";
APT::Sandbox::User "agent";
Acquire::Languages "none";
CONFIG
    export APT_CONFIG="$runtime_root/apt/apt.conf"
    apt-get update
    (
        cd "$runtime_root/apt/cache/archives"
        apt-get download php8.4-cli php8.4-common php8.4-mbstring php8.4-xml php8.4-mysql php8.4-sqlite3 php8.4-curl php8.4-zip php8.4-intl libargon2-1
        for package in php8.4-*.deb libargon2-*.deb; do
            dpkg-deb -x "$package" "$runtime_root/php"
        done
    )
    cat > "$runtime_root/php/php.ini" <<'INI'
extension_dir=/workspace/.setup/php/usr/lib/php/20240924
extension=ctype
extension=curl
extension=dom
extension=fileinfo
extension=iconv
extension=intl
extension=mbstring
extension=pdo
extension=mysqlnd
extension=pdo_mysql
extension=pdo_sqlite
extension=phar
extension=sqlite3
extension=tokenizer
extension=xml
extension=xmlreader
extension=xmlwriter
extension=zip
memory_limit=512M
upload_max_filesize=10M
post_max_size=12M
date.timezone=UTC
INI
    cat > "$runtime_root/bin/php" <<'PHPWRAPPER'
#!/bin/sh
export LD_LIBRARY_PATH="/workspace/.setup/php/usr/lib/x86_64-linux-gnu${LD_LIBRARY_PATH:+:$LD_LIBRARY_PATH}"
export PHPRC=/workspace/.setup/php/php.ini
export PHP_INI_SCAN_DIR=/workspace/.setup/apt/empty
exec /workspace/.setup/php/usr/bin/php8.4 -c /workspace/.setup/php/php.ini "$@"
PHPWRAPPER
    chmod +x "$runtime_root/bin/php"
fi

if [ ! -f "$runtime_root/composer.phar" ]; then
    curl -fsSL --retry 2 https://composer.github.io/installer.sig -o "$runtime_root/composer-installer.sig"
    curl -fsSL --retry 2 https://getcomposer.org/installer -o "$runtime_root/composer-setup.php"
    "$runtime_root/bin/php" -r 'if (trim(file_get_contents("/workspace/.setup/composer-installer.sig")) !== hash_file("sha384", "/workspace/.setup/composer-setup.php")) { fwrite(STDERR, "Composer installer checksum failed\n"); exit(1); }'
    "$runtime_root/bin/php" "$runtime_root/composer-setup.php" --install-dir="$runtime_root" --filename=composer.phar
fi
cat > "$runtime_root/bin/composer" <<'COMPOSERWRAPPER'
#!/bin/sh
export COMPOSER_HOME=/workspace/.cache/composer
export COMPOSER_CACHE_DIR=/workspace/.cache/composer/cache
exec /workspace/.setup/bin/php /workspace/.setup/composer.phar "$@"
COMPOSERWRAPPER
chmod +x "$runtime_root/bin/composer"
"$runtime_root/bin/php" -v
"$runtime_root/bin/composer" --version
