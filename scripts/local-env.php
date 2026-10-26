<?php

if (PHP_VERSION_ID < 80400) {
    fwrite(STDERR, 'Folio CMS requires PHP 8.4 or newer; this terminal is using PHP '.PHP_VERSION.". Install PHP 8.4+ and update PATH before running setup.\n");
    exit(1);
}

$requiredExtensions = ['ctype', 'curl', 'dom', 'fileinfo', 'intl', 'mbstring', 'openssl', 'pdo', 'pdo_mysql', 'session', 'tokenizer', 'xml', 'xmlwriter', 'zip'];
$missingExtensions = array_filter($requiredExtensions, fn (string $extension): bool => ! extension_loaded($extension));
if ($missingExtensions !== []) {
    fwrite(STDERR, 'Enable these PHP extensions before setup: '.implode(', ', $missingExtensions).". Run php --ini to locate the active configuration.\n");
    exit(1);
}

if (in_array('--check', $argv, true)) {
    fwrite(STDOUT, 'PHP '.PHP_VERSION." meets the CMS requirements.\n");
    exit(0);
}

/** Prepare a fresh local configuration without changing existing bindings. */
$root = dirname(__DIR__);
$path = $root.'/.env';
if (! file_exists($path)) {
    if (! copy($root.'/.env.example', $path)) {
        fwrite(STDERR, "Could not create .env.\n");
        exit(1);
    }
    chmod($path, 0600);
}

if (in_array('--docker', $argv, true)) {
    $environment = file_get_contents($path);
    if (! preg_match('/^DB_CONNECTION=mysql\s*$/m', $environment)) {
        fwrite(STDERR, "The existing .env does not select MySQL. Configure its DB_* fields before using --docker; existing data and configuration were kept.\n");
        exit(1);
    }
    foreach (['DB_DATABASE', 'DB_USERNAME'] as $name) {
        if (! preg_match('/^'.preg_quote($name, '/').'=[A-Za-z0-9_]+\s*$/m', $environment)) {
            fwrite(STDERR, "$name must contain only letters, numbers, and underscores for the Docker setup.\n");
            exit(1);
        }
    }
    if (preg_match('/^DB_USERNAME=root\s*$/m', $environment)) {
        fwrite(STDERR, "Use a dedicated DB_USERNAME rather than root for the application.\n");
        exit(1);
    }
    foreach (['DB_PASSWORD', 'MYSQL_ROOT_PASSWORD'] as $name) {
        if (! preg_match('/^'.preg_quote($name, '/').'=(.*)$/m', $environment, $match) || in_array(trim($match[1]), ['', '""', "''"], true)) {
            $line = $name.'='.bin2hex(random_bytes(24));
            $environment = preg_match('/^'.preg_quote($name, '/').'=/m', $environment)
                ? preg_replace('/^'.preg_quote($name, '/').'=.*$/m', $line, $environment)
                : rtrim($environment)."\n".$line."\n";
        }
    }
    if (file_put_contents($path, $environment, LOCK_EX) === false) {
        fwrite(STDERR, "Could not save the local database configuration.\n");
        exit(1);
    }
}
