# Folio CMS — Laravel, React & MySQL

A reusable business, publishing, and catalog CMS built with Laravel 13, React 19, Inertia 3, and MySQL 8.4 LTS. The public React website is rendered on the server, then hydrated in the browser. Each client gets their own deployment and database; this starter does not provide tenant isolation in a shared database.


This branch is the standalone CMS project. The project root contains `artisan`, `composer.json`, and `compose.yaml`.

Choose the website modules in **Admin → Platform & modules**. Build pages with content sections, select a custom homepage, publish reports, and configure discovery/SEO and the website assistant there. The public website is `/`, staff sign-in is `/login`, the admin workspace is `/admin`, and customer sign-in is `/account/login`. Run the project through its PHP server with MySQL; it is a server application.

## What works

- Session login with request throttling; administrator and content-editor roles.
- Pages, articles, and products; Markdown editing with filtered HTML; categories, tags, excerpts, featured images, drafts, and scheduled publication.
- Revision snapshots and restoration into a draft.
- Media uploads, alt text, downloads, and protection against deleting images used by content. User uploads accept JPG, PNG, WebP, GIF, AVIF, and PDF up to 10 MB. The bundled SVG illustrations are trusted demo assets; SVG uploads are disabled.
- Site identity, accent color, homepage copy, navigation order, footer, and catalog currency.
- Server-rendered public pages, search and category/tag filters, canonical URLs, meta descriptions, Open Graph tags, Article/Product structured data, XML sitemap, and robots rules. Drafts and future publications are excluded publicly. Noindex content stays out of the sitemap.
- Product stock, cart quantities, manual checkout requests, private receipts, order fulfilment states, and stock restoration on cancellation. Prices and totals come from the database. Checkout uses a session lock and token to prevent duplicate processing.
- Contact messages and an administrator inbox.
- A dashboard showing actual content counts, metadata completeness, creation activity, and upcoming content. It does not report visitor analytics.

The SEO score is a four-part metadata checklist, not a prediction of search rankings. Search engines choose whether and when to index content.

## Local setup with MySQL 8.4 LTS

Requirements: PHP 8.4 with PDO MySQL (`pdo_mysql`), ctype, curl, DOM/XML, fileinfo, intl, mbstring, tokenizer and zip; Composer 2; Node 22.12+ (tested with Node 24), npm, curl, and Bash. Install PHP, Composer, and Node on your computer. For report uploads, set `upload_max_filesize=20M` and `post_max_size=24M` in the PHP configuration used by your server, then restart PHP. Docker Desktop/Engine with Compose is needed only for the Docker database option. Windows users can run the Bash scripts in WSL or Git Bash; macOS and Linux can use their terminals.

### Option A: start MySQL with Docker (recommended)

Extract or clone the project and open its application directory (the directory containing `artisan`, `composer.json`, and `compose.yaml`):

```bash
cd your-extracted-cms-folder
bash scripts/setup.sh --docker --demo
bash scripts/dev.sh
```

The project root contains `artisan`, `composer.json`, and `compose.yaml`. Run the CMS through the PHP server; the admin workspace is `/admin`.

Setup creates `.env` from `.env.example`, generates unique local MySQL passwords without printing them, starts MySQL 8.4 on port 3306, waits for an authenticated health check, installs locked PHP/JavaScript dependencies, applies migrations, seeds an empty local CMS when `--demo` is supplied, and builds the browser/SSR assets. Existing `.env` values and application keys are preserved. Demo seeding is skipped when any CMS data already exists. The application uses its own database user rather than the MySQL root account.

The MySQL container uses a persistent named volume. Stop it with `docker compose stop mysql`; start it again with `bash scripts/mysql.sh start`. Database data stays in the volume. Use a different `DB_PORT` in `.env` if 3306 is already occupied, and a unique `COMPOSE_PROJECT_NAME` for each independent client project. Passwords in `.env` initialize a new MySQL volume; changing them later does not change existing database accounts. Keep `.env` with your installation.

The development runner starts Laravel on port 8000 and React SSR on loopback port 13714. Visit the local server in your browser; `/` is the public site and `/admin` is the workspace. It checks rendered homepage readiness and stops the two web processes together when interrupted. Logs are in `storage/logs/dev-server.log` and `storage/logs/ssr.log`.

For a demo installation, sign-in details are generated in the private, ignored file `storage/app/private/local-admin.json`. To choose your own admin account or reset its password, use the hidden password prompt:

```bash
php artisan cms:admin you@example.com --name="Your Name"
```

### Option B: use your existing MySQL server

Use MySQL 8.4 LTS, create the application database and a dedicated user using a database administrator account, then copy `.env.example` to `.env` and enter that user's connection details. Example SQL (choose your own password):

```sql
CREATE DATABASE folio_cms CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'folio'@'localhost' IDENTIFIED BY 'replace_with_your_own_strong_password';
GRANT ALL PRIVILEGES ON folio_cms.* TO 'folio'@'localhost';
```

The relevant `.env` fields are:

```dotenv
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=folio_cms
DB_USERNAME=folio
DB_PASSWORD="your_own_database_password"
```

Run the setup without the Docker option:

```bash
bash scripts/setup.sh --demo
bash scripts/dev.sh
```

Omit `--demo` for an empty installation, then create an administrator with `cms:admin`. The `cms:install` command checks MySQL connectivity/version and applies pending migrations; it never resets a database. Setup does not create or fall back to SQLite. Existing SQLite files are kept if upgrading an older checkout; changing the connection does not transfer their data. Export/import existing data separately before switching a populated installation.

For noninteractive account automation, inject `CMS_ADMIN_PASSWORD` securely into the command process; do not commit it or put it in a command argument. Demo installation is restricted to local/testing environments. A production run with `--demo` is refused.

### Cloud workspace

The cloud runtime installs PHP's MySQL extension locally under `/workspace/.setup`:

```bash
cd /workspace/Samad-ITPL
bash scripts/cloud-bootstrap.sh
export PATH="/workspace/.setup/bin:$PATH"
export NPM_CONFIG_CACHE=/workspace/.cache/npm
bash scripts/setup.sh --docker --demo
bash scripts/dev.sh
```

Docker volume state must not be assumed to survive a new cloud machine. Before saving a development snapshot, run `bash scripts/mysql.sh backup`. This creates a consistent SQL dump in `storage/app/private/mysql-snapshot.sql`; it includes private data and stays out of Git and distributable archives. On startup, `scripts/mysql.sh start` restores that dump only if the configured application database has no tables. It leaves a populated database alone. The current environment's previous SQLite database and configuration were backed up privately before the MySQL switch; existing CMS records were copied into MySQL.

Asset changes require `npm run build` and a restart of the SSR process. If `public/hot` remains after a stopped Vite process, remove that generated file before running built assets. Keep the SSR service running alongside PHP so public initial HTML contains content and metadata.

## Validation on MySQL

Docker initializes a separate database named `folio_cms_test` and grants the application user access to it. With a native MySQL installation, prepare this database separately:

```sql
CREATE DATABASE folio_cms_test CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
GRANT ALL PRIVILEGES ON folio_cms_test.* TO 'folio'@'localhost';
```

Then run:

```bash
php artisan test --compact
npm run build
npm run format:check
php vendor/bin/pint --dirty --format agent
```

`phpunit.xml` selects MySQL and forces `folio_cms_test`, overriding the application's database name and any `DB_URL`. Tests refresh the schema in this dedicated test database; they use the connection host, port, username, and password from your local environment. Do not use this database for site data. The suite exercises MySQL migrations, JSON fields, editorial workflows, permissions, contact submissions, media, trusted cart totals, stock rollback, order cancellation, and repeatable installation. Tests do not need a running SSR service.

## Website assistant, customer accounts, and downloads

The assistant starts in **website search mode** because the AI provider is intentionally unselected. It searches published pages, articles, products, and available reports. Customer sign-in additionally enables access to that customer's own orders and assigned reports. Visitors can use the floating assistant or `/search`; documents are available through `/reports`.

When ready, select OpenAI or Anthropic and a supported model ID in **Platform & modules → AI integration**. Set `CMS_AI_API_KEY` securely in the server environment (or your local ignored `.env`), then clear cached configuration. The key is never returned in page props or stored in public settings. Cloud environments also need the selected provider's HTTPS API domain allowed. No live provider call has been verified with a real credential in this setup; both provider adapters were tested with mocked responses. Search remains available without credentials and when the provider is unavailable. The UI labels AI responses and search results separately.

Answers are grounded in the authorized sources retrieved by the server. The model receives no SQL/database tools, file-system tools, or other customers' records. Source/download links come from server-defined routes. Every download checks permissions again; chatbot text cannot authorize a file. The assistant currently uses keyword retrieval, not an embedding/vector index. Report search uses the title, summary, and **Searchable knowledge** entered by an administrator; automatic PDF/OCR ingestion is not implemented.

Customers can register at `/account/register`. Orders placed while signed in are linked through a server-assigned user ID. Earlier guest orders are not claimed by matching an email address. The customer portal provides only that customer's orders and CSV/JSON exports. CSV export protects formula-like cell values. Public reports and customer-assigned reports are stored on the private filesystem, with access-checked attachment responses. Unpublished reports are unavailable to visitors and customers. Staff administrators manage report metadata, files, and customer assignment, and can reset customer passwords from the Customers screen; content editors do not receive customer report administration access.

## SEO and content components

The CMS supports per-page title, description, keywords, canonical override, index control, featured image alt text, Open Graph and Twitter metadata, and site-wide Google/Bing verification tokens. Structured data includes Organization, Article, Product, breadcrumbs, and FAQ entries when actual FAQ sections are present. XML sitemap and robots files reflect enabled modules and public publishing status. Keywords are included when configured; Google does not use them as a ranking signal.

`/llms.txt` lists public, indexable website content and public reports. `/llms-full.txt` expands content, and `/llm.txt` redirects to the conventional plural spelling. Account information, customer-only reports, drafts, and future content are excluded. These files are an emerging convention and do not guarantee LLM discovery, training exclusion, search rankings, or citations. `/feed.xml` provides the journal RSS feed.

Content sections include text, feature grids, FAQs, and calls to action, with ordering controls. A published page can be selected as the custom homepage in the platform discovery settings. Server rendering provides the content in initial HTML. The redirect manager supports internal 301/302 redirects, rejects loops/external targets, and protects account/admin/system routes.

## Adapting for another client

1. Use an independent deployment, database, `APP_KEY`, and storage for each client. Existing Codex tasks already have isolated checkouts; use the checkout directly without creating a Git worktree unless explicitly requested.
2. Set brand, homepage copy, menus, email, and color in **Site settings**. Set the currency before creating products. Existing prices must be explicitly migrated before changing currencies.
3. Replace demo content and illustrations through **Pages**, **Articles**, **Products**, **Categories**, and **Media library**. Give each image meaningful alt text and each important page useful search metadata.
4. Change public page layouts in `resources/js/Pages/Public`, shared presentation in `resources/js/Components`, and styling in `resources/css/app.css`. Keep request validation and role checks in the Laravel backend when extending modules.
5. New business-specific fields belong in database migrations, model fillable/casts, request validation, the admin editor, and public presentation together. Keep server-side pricing and stock authoritative for commerce extensions.

## Production boundaries

This is a working starter, not a turnkey payment platform. Payment gateways, tax calculations, shipping rates, refunds, email notifications, automated password-reset email, analytics integrations, localization, plugin installation, and shared multi-tenant hosting are not implemented. Content-section templates are provided; a freeform visual drag-and-drop theme designer is not implemented. Order checkout submits an uncharged request for manual confirmation. Digital-product delivery is not implemented.

Use the same MySQL 8.4 LTS version locally and live. Set production `DB_*` values in the server environment, use a separate database/account, and provide `MYSQL_ATTR_SSL_CA` when required by a managed MySQL service. The bundled Compose file is for local development.

Deploy the `public/` directory as the web root behind HTTPS, with PHP-FPM or another supported production Laravel server and a supervised Node SSR process. Do not expose the repository root, `.env`, database backups, private credentials, or port 13714 publicly. Set `APP_ENV=production`, `APP_DEBUG=false`, the real HTTPS `APP_URL`, a unique `APP_KEY`, and secure session-cookie settings. Configure trusted hosts/proxies for your infrastructure, persistent storage, backups, monitoring, retention policies for customer data. Use a separate production MySQL database and concurrency/load testing appropriate to the client's order volume before accepting live transactions.

Production commands should install Composer dependencies without development packages, build assets before removing frontend build dependencies, run reviewed migrations, create an administrator through `cms:admin`, and run `php artisan optimize`. Do not seed demo accounts or content in production. Publication of the Codex environment saves a development snapshot; it does not deploy this website to public hosting.
