<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\Platform;
use App\Models\Template;
use App\Models\User;
use App\Services\PaymentService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class OrderTest extends TestCase
{
    use RefreshDatabase;

    private function user(): User
    {
        return User::create([
            'name' => 'U',
            'email' => uniqid('u', true) . '@test.local',
            'password' => 'password',
        ]);
    }

    private function publishedTemplate(int $price): Template
    {
        $cat = Category::create(['name' => 'Cat', 'slug' => uniqid('cat', true)]);
        $plat = Platform::create(['name' => 'WP', 'slug' => uniqid('wp', true)]);

        return Template::create([
            'title' => 'Tmpl',
            'slug' => uniqid('tmpl', true),
            'price' => $price,
            'category_id' => $cat->id,
            'platform_id' => $plat->id,
            'status' => 'published',
            'published_at' => now()->subMinute(),
        ]);
    }

    public function test_order_total_is_computed_from_db_prices(): void
    {
        // Платёж мокаем — не дёргаем внешний API ЮKassa
        $this->mock(PaymentService::class, function ($m) {
            $m->shouldReceive('createPayment')->once()
                ->andReturn(['payment_id' => 'p1', 'confirmation_url' => 'https://pay.test/1']);
        });

        $user = $this->user();
        $tpl = $this->publishedTemplate(149900);
        Sanctum::actingAs($user);

        $resp = $this->postJson('/api/orders', [
            'items' => [['template_id' => $tpl->id]],
        ]);

        $resp->assertCreated();
        // Цена берётся из БД, а не из запроса
        $this->assertDatabaseHas('orders', [
            'user_id' => $user->id,
            'subtotal' => 149900,
            'total' => 149900,
        ]);
    }

    public function test_order_requires_authentication(): void
    {
        $tpl = $this->publishedTemplate(100000);

        $this->postJson('/api/orders', [
            'items' => [['template_id' => $tpl->id]],
        ])->assertUnauthorized();
    }
}
