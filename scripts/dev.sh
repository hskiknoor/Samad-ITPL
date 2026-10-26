#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."
mkdir -p storage/logs
if [ ! -f bootstrap/ssr/ssr.js ] || [ ! -f public/build/manifest.json ]; then
    printf 'Build assets first with npm run build.\n' >&2
    exit 1
fi
if curl -fsS --max-time 2 http://127.0.0.1:13714/health >/dev/null 2>&1 || curl -fsS --max-time 2 http://127.0.0.1:8000/up >/dev/null 2>&1; then
    printf 'A service already uses a required port. Reuse it if healthy, or stop only a service you own before starting again.\n' >&2
    exit 1
fi
node bootstrap/ssr/ssr.js >storage/logs/ssr.log 2>&1 &
ssr_pid=$!
php_pid=''
cleanup() {
    if [ -n "$php_pid" ]; then kill "$php_pid" 2>/dev/null || true; fi
    kill "$ssr_pid" 2>/dev/null || true
}
trap cleanup EXIT INT TERM
php artisan serve --host=127.0.0.1 --port=8000 --no-reload >storage/logs/dev-server.log 2>&1 &
php_pid=$!
ready=0
for attempt in {1..30}; do
    if ! kill -0 "$ssr_pid" 2>/dev/null || ! kill -0 "$php_pid" 2>/dev/null; then
        printf 'A service exited. Inspect storage/logs/ssr.log and storage/logs/dev-server.log.\n' >&2
        exit 1
    fi
    if curl -fsS --max-time 2 http://127.0.0.1:13714/health >/dev/null 2>&1 && page_html=$(curl -fsS --max-time 5 http://127.0.0.1:8000/ 2>/dev/null); then
        if [[ "$page_html" == *'<h1'* ]]; then
            ready=1
            break
        fi
    fi
    sleep 1
done
if [ "$ready" -ne 1 ]; then
    printf 'Application readiness failed. Inspect storage/logs/ssr.log and storage/logs/dev-server.log.\n' >&2
    exit 1
fi
printf 'Folio CMS is running on port 8000 with SSR on port 13714. Use /admin for the workspace.\n'
printf 'Logs: storage/logs/dev-server.log and storage/logs/ssr.log. Press Ctrl+C to stop both services.\n'
while kill -0 "$ssr_pid" 2>/dev/null && kill -0 "$php_pid" 2>/dev/null; do
    sleep 1
done
if ! kill -0 "$ssr_pid" 2>/dev/null; then
    wait "$ssr_pid"
else
    wait "$php_pid"
fi
