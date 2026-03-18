<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Расширяем author_profiles
        Schema::table('author_profiles', function (Blueprint $table) {
            $table->string('slug')->unique()->after('display_name');
            $table->string('avatar', 500)->nullable()->after('bio');
            $table->string('specialization')->nullable()->after('avatar'); // 'WordPress', 'Tilda', 'Оба'
            $table->json('social_links')->nullable()->after('specialization'); // {telegram, vk, github}
            $table->json('portfolio_images')->nullable()->after('social_links');
            $table->integer('balance')->default(0)->after('commission'); // в копейках
            $table->integer('total_earned')->default(0)->after('balance');
            $table->integer('total_sales')->default(0)->after('total_earned');
            $table->string('payout_details')->nullable()->after('total_sales'); // реквизиты для вывода
            $table->enum('payout_method', ['card', 'sbp', 'yoomoney'])->default('card')->after('payout_details');
        });

        // Заработки автора (по каждой продаже)
        Schema::create('author_earnings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('author_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('order_id')->constrained()->cascadeOnDelete();
            $table->foreignId('order_item_id')->constrained()->cascadeOnDelete();
            $table->foreignId('template_id')->constrained()->cascadeOnDelete();
            $table->integer('sale_amount'); // полная сумма продажи (копейки)
            $table->integer('commission_percent'); // % автора на момент продажи
            $table->integer('author_amount'); // сумма автору (копейки)
            $table->integer('platform_amount'); // сумма платформе (копейки)
            $table->timestamps();
        });

        // Заявки на вывод средств
        Schema::create('payouts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('author_id')->constrained('users')->cascadeOnDelete();
            $table->integer('amount'); // сумма в копейках
            $table->enum('method', ['card', 'sbp', 'yoomoney'])->default('card');
            $table->string('details'); // номер карты / телефон / кошелёк
            $table->enum('status', ['pending', 'processing', 'completed', 'rejected'])->default('pending');
            $table->text('admin_note')->nullable(); // комментарий админа
            $table->timestamp('completed_at')->nullable();
            $table->timestamps();

            $table->index(['author_id', 'status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('payouts');
        Schema::dropIfExists('author_earnings');

        Schema::table('author_profiles', function (Blueprint $table) {
            $table->dropColumn([
                'slug', 'avatar', 'specialization', 'social_links',
                'portfolio_images', 'balance', 'total_earned',
                'total_sales', 'payout_details', 'payout_method',
            ]);
        });
    }
};
