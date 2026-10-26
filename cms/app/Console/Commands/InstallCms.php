<?php

namespace App\Console\Commands;

use App\Models\Category;
use App\Models\Entry;
use App\Models\Media;
use App\Models\Order;
use App\Models\Setting;
use App\Models\Submission;
use App\Models\User;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Throwable;

class InstallCms extends Command
{
    protected $signature = 'cms:install {--demo : Seed demo content only into an empty local or testing installation}';

    protected $description = 'Verify MySQL, apply pending migrations, and optionally initialize an empty local CMS';

    public function handle(): int
    {
        if ($this->option('demo') && ! app()->environment(['local', 'testing'])) {
            $this->error('Demo installation is available only in local and testing environments.');

            return self::FAILURE;
        }
        if (DB::connection()->getDriverName() !== 'mysql') {
            $this->error('Folio CMS installation requires DB_CONNECTION=mysql. Existing data was kept.');

            return self::FAILURE;
        }
        try {
            $version = DB::selectOne('SELECT VERSION() AS version')->version;
        } catch (Throwable) {
            $this->error('Cannot connect to MySQL. Check the DB_* settings in .env, enable pdo_mysql, and start your database server.');

            return self::FAILURE;
        }
        if (stripos($version, 'MariaDB') !== false || version_compare($version, '8.4.0', '<')) {
            $this->error('Use MySQL 8.4 LTS or newer. This installation has been tested with the official MySQL 8.4 image.');

            return self::FAILURE;
        }
        if ($this->call('migrate', ['--force' => true]) !== self::SUCCESS) {
            return self::FAILURE;
        }
        if ($this->option('demo')) {
            foreach ([User::class, Entry::class, Media::class, Category::class, Setting::class, Order::class, Submission::class] as $model) {
                if ($model::exists()) {
                    $this->info('Existing CMS data found. Demo seeding was skipped.');

                    return self::SUCCESS;
                }
            }
            if ($this->call('db:seed', ['--force' => true]) !== self::SUCCESS) {
                return self::FAILURE;
            }
        }
        $this->info('MySQL connection verified. CMS schema is ready.');

        return self::SUCCESS;
    }
}
