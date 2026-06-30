<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\Order;
use App\Models\Platform;
use App\Models\Template;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PaymentWebhookTest extends TestCase
{
    use RefreshDatabase;

    public function test_webhook_marks_order_paid_and_is_idempotent(): void
    {
        $user = User::create([
            'name' => 'U',
            'email' => uniqid('u', true) . '@test.local',
            'password' => 'password',
        ]);
        $cat = Category::create(['name' => 'Cat', 'slug' => uniqid('cat', true)]);
        $plat = Platform::create(['name' => 'WP', 'slug' => uniqid('wp', true)]);
        $tpl = Template::create([
            'title' => 'Tmpl',
            'slug' => uniqid('tmpl', true),
            'price' => 100000,
            'category_id' => $cat->id,
            'platform_id' => $plat->id,
            'status' => 'published',
            'published_at' => now()->subMinute(),
        ]);

        $order = Order::create([
            'order_number' => 'TN-TEST-1',
            'user_id' => $user->id,
            'subtotal' => 100000,
            'total' => 100000,
            'status' => 'processing',
            'payment_id' => 'pay_test_1',
        ]);
        $order->items()->create(['template_id' => $tpl->id, 'price' => 100000]);

        $payload = [
            'event' => 'payment.succeeded',
            'object' => [
                'id' => 'pay_test_1',
                'status' => 'succeeded',
                'metadata' => ['order_id' => $order->id],
            ],
        ];

        // В testing ЮKassa не настроена → статус берётся из тела (fallback).
        // IP-whitelist активен всегда, но в тестах обходится флагом
        // YUKASSA_ALLOW_INSECURE_WEBHOOK (см. phpunit.xml).
        $this->postJson('/api/payment/webhook', $payload)->assertOk();
        // Повторная доставка того же события — без двойной обработки
        $this->postJson('/api/payment/webhook', $payload)->assertOk();

        $this->assertEquals('paid', $order->fresh()->status);
        $this->assertEquals(1, $tpl->fresh()->sales_count);
    }

    public function test_webhook_ignores_unknown_events(): void
    {
        $this->postJson('/api/payment/webhook', [
            'event' => 'payment.waiting_for_capture',
            'object' => ['id' => 'x'],
        ])->assertOk()->assertJson(['status' => 'ignored']);
    }
}
