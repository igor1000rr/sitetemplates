<?php
// database/migrations/2026_01_01_000002_create_catalog_tables.php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('categories', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('slug')->unique();
            $table->text('icon')->nullable();
            $table->text('description')->nullable();
            $table->integer('sort_order')->default(0);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        Schema::create('platforms', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('slug')->unique();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        Schema::create('templates', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->string('slug')->unique();
            $table->text('description')->nullable();
            $table->string('short_desc', 500)->nullable();

            $table->integer('price'); // копейки
            $table->integer('old_price')->nullable();

            $table->foreignId('category_id')->constrained()->cascadeOnDelete();
            $table->foreignId('platform_id')->constrained();
            $table->foreignId('author_id')->nullable()->constrained('users');

            $table->enum('template_type', ['landing', 'multipage', 'shop', 'quiz'])->default('landing');

            $table->string('zip_path', 500)->nullable();
            $table->bigInteger('zip_size')->nullable();
            $table->string('demo_url', 500)->nullable();

            $table->jsonb('features')->default('[]');
            $table->jsonb('tags')->default('[]');
            $table->jsonb('tech_specs')->default('{}');
            $table->string('version', 20)->default('1.0.0');

            $table->string('meta_title')->nullable();
            $table->string('meta_desc', 500)->nullable();

            $table->integer('sales_count')->default(0);
            $table->integer('views_count')->default(0);
            $table->decimal('rating', 2, 1)->default(0);
            $table->integer('reviews_count')->default(0);

            $table->enum('status', ['draft', 'review', 'published', 'archived'])->default('draft');
            $table->boolean('is_featured')->default(false);
            $table->integer('sort_order')->default(0);

            $table->timestamps();
            $table->timestamp('published_at')->nullable();

            $table->index(['status', 'is_featured']);
            $table->index('price');
        });

        Schema::create('template_images', function (Blueprint $table) {
            $table->id();
            $table->foreignId('template_id')->constrained()->cascadeOnDelete();
            $table->string('path', 500);
            $table->string('alt')->nullable();
            $table->integer('sort_order')->default(0);
            $table->boolean('is_main')->default(false);
            $table->timestamp('created_at')->useCurrent();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('template_images');
        Schema::dropIfExists('templates');
        Schema::dropIfExists('platforms');
        Schema::dropIfExists('categories');
    }
};
