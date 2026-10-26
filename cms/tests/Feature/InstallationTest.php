<?php

namespace Tests\Feature;

use App\Models\Entry;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class InstallationTest extends TestCase
{
    public function test_empty_local_installation_can_seed_demo_content_on_mysql(): void
    {
        Storage::fake('public');
        $this->assertSame('mysql', DB::connection()->getDriverName());
        $this->artisan('cms:install', ['--demo' => true])->assertSuccessful();
        $this->assertDatabaseHas('users', ['email' => 'admin@folio.local', 'role' => 'admin']);
        $this->assertDatabaseHas('entries', ['slug' => 'the-everyday-notebook', 'stock' => 25]);
        $this->assertDatabaseCount('entries', 8);
        $this->artisan('cms:install', ['--demo' => true])->expectsOutputToContain('Demo seeding was skipped')->assertSuccessful();
        $this->assertDatabaseCount('entries', 8);
    }

    public function test_installation_does_not_add_demo_content_or_modify_existing_stock(): void
    {
        $entry = Entry::factory()->product()->create(['stock' => 37]);
        $userCount = User::count();
        $this->artisan('cms:install', ['--demo' => true])->expectsOutputToContain('Demo seeding was skipped')->assertSuccessful();
        $this->assertSame(37, $entry->fresh()->stock);
        $this->assertDatabaseCount('entries', 1);
        $this->assertDatabaseCount('users', $userCount);
    }

    public function test_installation_without_demo_keeps_the_database_empty(): void
    {
        $this->artisan('cms:install')->assertSuccessful();
        $this->assertDatabaseCount('users', 0);
        $this->assertDatabaseCount('entries', 0);
    }

    public function test_production_installation_refuses_demo_accounts(): void
    {
        app()->instance('env', 'production');
        $this->artisan('cms:install', ['--demo' => true])->expectsOutputToContain('only in local and testing')->assertFailed();
        $this->assertDatabaseCount('users', 0);
        $this->assertDatabaseCount('entries', 0);
    }
}
