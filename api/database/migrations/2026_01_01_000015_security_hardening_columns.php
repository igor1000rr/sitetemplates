<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Подписка теперь создаётся в статусе 'pending' (до подтверждения оплаты),
        // а исходный enum его не содержал — расширяем CHECK-ограничение (PostgreSQL).
        if (Schema::hasTable('subscriptions') && DB::getDriverName() === 'pgsql') {
            DB::statement('ALTER TABLE subscriptions DROP CONSTRAINT IF EXISTS subscriptions_status_check');
            DB::statement("ALTER TABLE subscriptions ADD CONSTRAINT subscriptions_status_check CHECK (status::text IN ('active','cancelled','expired','past_due','pending'))");
        }

        // password_reset_tokens — кастомная миграция users заменила дефолтную
        // и забыла создать эту таблицу, из-за чего сброс пароля падал с SQL-ошибкой.
        if (!Schema::hasTable('password_reset_tokens')) {
            Schema::create('password_reset_tokens', function (Blueprint $table) {
                $table->string('email')->primary();
                $table->string('token');
                $table->timestamp('created_at')->nullable();
            });
        }

        // social_provider / social_id — пишутся при OAuth-входе, но колонок не было.
        Schema::table('users', function (Blueprint $table) {
            if (!Schema::hasColumn('users', 'social_provider')) {
                $table->string('social_provider')->nullable()->after('avatar');
            }
            if (!Schema::hasColumn('users', 'social_id')) {
                $table->string('social_id')->nullable()->index()->after('social_provider');
            }
        });

        // Идемпотентность писем-просьб оставить отзыв.
        Schema::table('orders', function (Blueprint $table) {
            if (!Schema::hasColumn('orders', 'review_request_sent_at')) {
                $table->timestamp('review_request_sent_at')->nullable()->after('paid_at');
            }
        });

        // Защита от двойного начисления авторам при гонке/ретрае вебхука.
        if (Schema::hasTable('author_earnings') && !$this->indexExists('author_earnings', 'author_earnings_order_item_id_unique')) {
            // На старых БД мог остаться дубль (до фикса идемпотентности) — иначе
            // добавление UNIQUE упало бы и оборвало миграцию. Чистим, оставляя минимальный id.
            if (DB::getDriverName() === 'pgsql') {
                DB::statement('DELETE FROM author_earnings a USING author_earnings b WHERE a.order_item_id = b.order_item_id AND a.id > b.id');
            }

            Schema::table('author_earnings', function (Blueprint $table) {
                $table->unique('order_item_id');
            });
        }
    }

    public function down(): void
    {
        if (Schema::hasTable('subscriptions') && DB::getDriverName() === 'pgsql') {
            DB::statement('ALTER TABLE subscriptions DROP CONSTRAINT IF EXISTS subscriptions_status_check');
            DB::statement("ALTER TABLE subscriptions ADD CONSTRAINT subscriptions_status_check CHECK (status::text IN ('active','cancelled','expired','past_due'))");
        }

        Schema::table('orders', function (Blueprint $table) {
            if (Schema::hasColumn('orders', 'review_request_sent_at')) {
                $table->dropColumn('review_request_sent_at');
            }
        });

        Schema::table('users', function (Blueprint $table) {
            foreach (['social_provider', 'social_id'] as $col) {
                if (Schema::hasColumn('users', $col)) {
                    $table->dropColumn($col);
                }
            }
        });

        if (Schema::hasTable('author_earnings') && $this->indexExists('author_earnings', 'author_earnings_order_item_id_unique')) {
            Schema::table('author_earnings', function (Blueprint $table) {
                $table->dropUnique('author_earnings_order_item_id_unique');
            });
        }

        Schema::dropIfExists('password_reset_tokens');
    }

    private function indexExists(string $table, string $index): bool
    {
        $conn = Schema::getConnection();
        try {
            return count($conn->select(
                "SELECT 1 FROM pg_indexes WHERE tablename = ? AND indexname = ?",
                [$table, $index]
            )) > 0;
        } catch (\Throwable $e) {
            return false;
        }
    }
};
