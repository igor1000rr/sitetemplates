<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\Order;
use App\Models\Platform;
use App\Models\Template;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class DownloadAccessTest extends TestCase
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

    private function template(): Template
    {
        $cat = Category::create(['name' => 'Cat', 'slug' => uniqid('cat', true)]);
        $plat = Platform::create(['name' => 'WP', 'slug' => uniqid('wp', true)]);

        return Template::create([
            'title' => 'Tmpl',
            'slug' => uniqid('tmpl', true),
            'price' => 100000,
            'category_id' => $cat->id,
            'platform_id' => $plat->id,
            'status' => 'published',
            'published_at' => now()->subMinute(),
        ]);
    }

    private function order(User $user, Template $tpl, string $status): Order
    {
        $order = Order::create([
            'order_number' => uniqid('TN-', true),
            'user_id' => $user->id,
            'subtotal' => $tpl->price,
            'total' => $tpl->price,
            'status' => $status,
            'paid_at' => $status === 'paid' ? now() : null,
        ]);
        $order->items()->create(['template_id' => $tpl->id, 'price' => $tpl->price]);

        return $order;
    }

    public function test_cannot_download_unpaid_order(): void
    {
        $user = $this->user();
        $tpl = $this->template();
        $order = $this->order($user, $tpl, 'pending');

        Sanctum::actingAs($user);
        $this->getJson("/api/download/{$order->id}/{$tpl->id}")->assertStatus(403);
    }

    public function test_cannot_download_other_users_order(): void
    {
        $owner = $this->user();
        $other = $this->user();
        $tpl = $this->template();
        $order = $this->order($owner, $tpl, 'paid');

        Sanctum::actingAs($other);
        $this->getJson("/api/download/{$order->id}/{$tpl->id}")->assertStatus(403);
    }

    public function test_check_access_reflects_purchase(): void
    {
        $user = $this->user();
        $tpl = $this->template();
        Sanctum::actingAs($user);

        // Без покупки — доступа нет
        $this->getJson("/api/download/check/{$tpl->id}")
            ->assertOk()
            ->assertJson(['has_access' => false]);

        // После оплаченного заказа — доступ есть
        $this->order($user, $tpl, 'paid');
        $this->getJson("/api/download/check/{$tpl->id}")
            ->assertOk()
            ->assertJson(['has_access' => true]);
    }
}
