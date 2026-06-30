<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('newsletter_subscribers', function (Blueprint $table) {
            // ip / subscribed_at контроллер уже использовал, но колонок не было
            if (!Schema::hasColumn('newsletter_subscribers', 'ip')) {
                $table->string('ip', 45)->nullable()->after('source');
            }
            if (!Schema::hasColumn('newsletter_subscribers', 'subscribed_at')) {
                $table->timestamp('subscribed_at')->nullable()->after('promo_code');
            }
            // Double opt-in: подписка активна только после подтверждения по ссылке
            if (!Schema::hasColumn('newsletter_subscribers', 'confirm_token')) {
                $table->string('confirm_token', 64)->nullable()->after('subscribed_at');
            }
            if (!Schema::hasColumn('newsletter_subscribers', 'confirmed_at')) {
                $table->timestamp('confirmed_at')->nullable()->after('confirm_token');
            }
        });
    }

    public function down(): void
    {
        Schema::table('newsletter_subscribers', function (Blueprint $table) {
            foreach (['ip', 'subscribed_at', 'confirm_token', 'confirmed_at'] as $col) {
                if (Schema::hasColumn('newsletter_subscribers', $col)) {
                    $table->dropColumn($col);
                }
            }
        });
    }
};
