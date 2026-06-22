<?php

namespace Tests\Unit;

use App\Models\PromoCode;
use PHPUnit\Framework\TestCase;

class PromoCodeTest extends TestCase
{
    public function test_percent_discount(): void
    {
        $promo = new PromoCode(['discount_type' => 'percent', 'discount_value' => 10]);
        // 10% от 1000.00₽ (в копейках)
        $this->assertSame(10000, $promo->calculateDiscount(100000));
    }

    public function test_fixed_discount_is_capped_at_subtotal(): void
    {
        $promo = new PromoCode(['discount_type' => 'fixed', 'discount_value' => 50000]);
        $this->assertSame(50000, $promo->calculateDiscount(100000));
        // скидка не может превышать сумму заказа
        $this->assertSame(30000, $promo->calculateDiscount(30000));
    }

    public function test_inactive_code_is_invalid(): void
    {
        $promo = new PromoCode([
            'discount_type' => 'percent',
            'discount_value' => 10,
            'is_active' => false,
        ]);
        $this->assertFalse($promo->isValid(100000));
    }

    public function test_min_order_is_enforced(): void
    {
        $promo = new PromoCode([
            'discount_type' => 'percent',
            'discount_value' => 10,
            'is_active' => true,
            'min_order' => 200000,
        ]);
        $this->assertFalse($promo->isValid(100000));
        $this->assertTrue($promo->isValid(200000));
    }

    public function test_exhausted_uses_make_code_invalid(): void
    {
        $promo = new PromoCode([
            'discount_type' => 'percent',
            'discount_value' => 10,
            'is_active' => true,
            'max_uses' => 5,
            'used_count' => 5,
        ]);
        $this->assertFalse($promo->isValid(100000));
    }
}
