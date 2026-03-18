<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Подписчики рассылки
        Schema::create('newsletter_subscribers', function (Blueprint $table) {
            $table->id();
            $table->string('email')->unique();
            $table->string('source', 30)->default('footer'); // footer, popup, admin
            $table->boolean('is_active')->default(true);
            $table->string('promo_code')->nullable();
            $table->timestamp('unsubscribed_at')->nullable();
            $table->timestamps();
            $table->index('email');
        });

        // OAuth аккаунты
        Schema::create('social_accounts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('provider', 30);
            $table->string('provider_id');
            $table->text('provider_token')->nullable();
            $table->text('provider_refresh_token')->nullable();
            $table->timestamps();
            $table->unique(['provider', 'provider_id']);
            $table->index('user_id');
        });

        // Доп. услуги
        Schema::create('services', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('slug')->unique();
            $table->string('short_description', 500)->nullable();
            $table->text('description')->nullable();
            $table->integer('price'); // копейки
            $table->string('icon', 100)->nullable();
            $table->string('category', 50)->default('other');
            $table->integer('estimated_days')->default(3);
            $table->boolean('is_popular')->default(false);
            $table->boolean('is_active')->default(true);
            $table->integer('sort_order')->default(0);
            $table->timestamps();
        });

        // Услуги в заказах
        Schema::create('order_item_services', function (Blueprint $table) {
            $table->id();
            $table->foreignId('order_item_id')->constrained()->cascadeOnDelete();
            $table->foreignId('service_id')->constrained();
            $table->integer('price');
            $table->string('status', 20)->default('pending');
            $table->timestamp('completed_at')->nullable();
            $table->timestamp('created_at')->useCurrent();
            $table->index('order_item_id');
        });

        // Заявки на разработку под ключ
        Schema::create('custom_requests', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('email');
            $table->string('phone', 30)->nullable();
            $table->string('company')->nullable();
            $table->string('business_type', 100)->nullable();
            $table->string('budget_range', 50)->nullable();
            $table->string('deadline', 100)->nullable();
            $table->text('description');
            $table->text('reference_urls')->nullable();
            $table->string('preferred_platform', 50)->nullable();
            $table->string('status', 20)->default('new');
            $table->foreignId('assigned_to')->nullable()->constrained('users');
            $table->text('admin_notes')->nullable();
            $table->integer('estimated_price')->nullable();
            $table->timestamps();
            $table->index('status');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('custom_requests');
        Schema::dropIfExists('order_item_services');
        Schema::dropIfExists('services');
        Schema::dropIfExists('social_accounts');
        Schema::dropIfExists('newsletter_subscribers');
    }
};
