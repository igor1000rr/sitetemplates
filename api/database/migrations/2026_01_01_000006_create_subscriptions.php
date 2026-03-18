<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('subscription_plans', function (Blueprint $table) {
            $table->id();
            $table->string('name');            // "Стартовый", "Про", "Бизнес"
            $table->string('slug')->unique();
            $table->text('description')->nullable();
            $table->integer('price');           // копейки/месяц
            $table->integer('annual_price')->nullable(); // копейки/год (со скидкой)
            $table->integer('downloads_per_month')->default(-1); // -1 = unlimited
            $table->json('features')->nullable(); // ["Все шаблоны", "Приоритетная поддержка", ...]
            $table->boolean('is_popular')->default(false);
            $table->boolean('is_active')->default(true);
            $table->integer('sort_order')->default(0);
            $table->timestamps();
        });

        Schema::create('subscriptions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('plan_id')->constrained('subscription_plans')->cascadeOnDelete();
            $table->enum('billing_cycle', ['monthly', 'annual'])->default('monthly');
            $table->enum('status', ['active', 'cancelled', 'expired', 'past_due'])->default('active');
            $table->string('yukassa_subscription_id')->nullable(); // ID автоплатежа ЮKassa
            $table->string('yukassa_payment_method_id')->nullable(); // Сохранённый способ оплаты
            $table->integer('price_paid');     // сумма, фактически оплаченная (копейки)
            $table->integer('downloads_used')->default(0); // использовано скачиваний в текущем периоде
            $table->timestamp('current_period_start')->nullable();
            $table->timestamp('current_period_end')->nullable();
            $table->timestamp('cancelled_at')->nullable();
            $table->timestamp('trial_ends_at')->nullable();
            $table->timestamps();

            $table->index(['user_id', 'status']);
            $table->index('current_period_end');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('subscriptions');
        Schema::dropIfExists('subscription_plans');
    }
};
