<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('entries', function (Blueprint $table) {
            $table->string('seo_keywords', 1000)->nullable();
            $table->string('canonical_url', 2048)->nullable();
            $table->json('blocks')->nullable();
        });
        Schema::table('orders', fn (Blueprint $table) => $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete());
        Schema::create('reports', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->string('slug')->unique();
            $table->text('summary');
            $table->text('content')->nullable();
            $table->string('status')->default('draft');
            $table->string('audience')->default('public');
            $table->foreignId('owner_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('file_path');
            $table->string('original_name');
            $table->string('mime');
            $table->unsignedBigInteger('size');
            $table->boolean('noindex')->default(false);
            $table->timestamp('published_at')->nullable();
            $table->timestamps();
        });
        Schema::create('redirects', function (Blueprint $table) {
            $table->id();
            $table->string('from_path')->unique();
            $table->string('to_path');
            $table->unsignedSmallInteger('status')->default(301);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('redirects');
        Schema::dropIfExists('reports');
        Schema::table('orders', fn (Blueprint $table) => $table->dropConstrainedForeignId('user_id'));
        Schema::table('entries', fn (Blueprint $table) => $table->dropColumn(['seo_keywords', 'canonical_url', 'blocks']));
    }
};
