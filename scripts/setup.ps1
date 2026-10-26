#Requires -Version 5.1
[CmdletBinding()]
param(
    [switch]$Docker,
    [switch]$Demo
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

function Invoke-CmsCommand {
    param(
        [Parameter(Mandatory = $true)][string]$Command,
        [string[]]$Arguments = @()
    )

    & $Command @Arguments
    if ($LASTEXITCODE -ne 0) {
        throw "$Command failed (exit code $LASTEXITCODE). Resolve the error above, then run setup again."
    }
}

$root = Split-Path -Parent $PSScriptRoot
Push-Location -LiteralPath $root
try {
    if (-not (Get-Command php -CommandType Application -ErrorAction SilentlyContinue)) {
        throw 'PHP 8.4+ was not found on PATH. Install PHP 8.4+, add its directory to PATH, and open a new terminal. Many XAMPP releases include an older PHP version.'
    }
    Invoke-CmsCommand php @('scripts/local-env.php', '--check')

    foreach ($command in @('composer', 'node', 'npm')) {
        if (-not (Get-Command $command -CommandType Application -ErrorAction SilentlyContinue)) {
            throw "$command was not found on PATH. Install Composer 2 and Node.js 22.12+ (with npm), then open a new terminal."
        }
    }
    $nodeVersionText = & node --version
    if ($LASTEXITCODE -ne 0) {
        throw 'Could not read the Node.js version. Check your Node.js installation.'
    }
    $nodeVersion = [version]($nodeVersionText -replace '^v', '' -replace '-.*$', '')
    if ($nodeVersion -lt [version]'22.12.0') {
        throw "Node.js 22.12+ is required; this terminal is using $nodeVersionText. Install a supported version and open a new terminal."
    }

    $environmentExisted = Test-Path -LiteralPath '.env'
    if ($Docker) {
        if (-not (Get-Command docker -CommandType Application -ErrorAction SilentlyContinue)) {
            throw 'Install and start Docker Desktop with Linux containers, then rerun with -Docker. It supplies the required MySQL 8.4 server.'
        }
        Invoke-CmsCommand docker @('compose', 'version')
        Invoke-CmsCommand php @('scripts/local-env.php', '--docker')
    }
    else {
        Invoke-CmsCommand php @('scripts/local-env.php')
        if (-not $environmentExisted) {
            throw '.env has been created. Create a database/user on MySQL 8.4+, enter DB_* values in .env, then rerun this command. The database bundled with XAMPP is usually MariaDB; use a separate MySQL server or the -Docker option.'
        }
    }

    Invoke-CmsCommand composer @('install', '--prefer-dist', '--no-interaction')
    Invoke-CmsCommand npm @('ci', '--ignore-scripts')
    Invoke-CmsCommand php @('artisan', 'config:clear', '--no-interaction')

    $key = Select-String -LiteralPath '.env' -Pattern '^APP_KEY\s*=\s*(.*)$' | Select-Object -Last 1
    $keyValue = if ($null -eq $key) { '' } else { $key.Matches[0].Groups[1].Value.Trim() }
    if ($keyValue -in @('', '""', "''")) {
        Invoke-CmsCommand php @('artisan', 'key:generate', '--no-interaction')
    }
    if ($Docker) {
        Invoke-CmsCommand docker @('compose', 'up', '-d', '--wait', '--wait-timeout', '120', 'mysql')
    }

    $installArguments = @('artisan', 'cms:install', '--no-interaction')
    if ($Demo) {
        $installArguments += '--demo'
    }
    Invoke-CmsCommand php $installArguments
    if (-not (Test-Path -LiteralPath 'public/storage')) {
        Invoke-CmsCommand php @('artisan', 'storage:link', '--no-interaction')
        if (-not (Test-Path -LiteralPath 'public/storage')) {
            throw 'The public/storage directory link could not be created. Check filesystem permissions and the storage/app/public directory, then rerun setup.'
        }
    }
    Invoke-CmsCommand npm @('run', 'build')

    Write-Host ''
    Write-Host 'Setup complete. Keep these two commands running in separate terminals at the project root:'
    Write-Host '  npm run ssr'
    Write-Host '  php artisan serve --host=127.0.0.1 --port=8000 --no-reload'
    Write-Host 'The public site uses port 8000; staff sign-in is /login and the workspace is /admin.'
    if ($Demo) {
        Write-Host 'For a new demo installation, credentials are in the private storage/app/private/local-admin.json file.'
    }
}
catch {
    [Console]::Error.WriteLine($_.Exception.Message)
    exit 1
}
finally {
    Pop-Location
}
