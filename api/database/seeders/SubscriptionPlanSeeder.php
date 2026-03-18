<?php

namespace Database\Seeders;

use App\Models\SubscriptionPlan;
use Illuminate\Database\Seeder;

class SubscriptionPlanSeeder extends Seeder
{
    public function run(): void
    {
        $plans = [
            [
                'name' => 'Стартовый',
                'slug' => 'starter',
                'description' => 'Для начинающих — 5 скачиваний в месяц',
                'price' => 99000,       // 990 ₽/мес
                'annual_price' => 990000, // 9 900 ₽/год (~825 ₽/мес)
                'downloads_per_month' => 5,
                'features' => [
                    '5 скачиваний в месяц',
                    'Все шаблоны каталога',
                    'Обновления шаблонов',
                    'Email-поддержка',
                ],
                'is_popular' => false,
                'sort_order' => 1,
            ],
            [
                'name' => 'Про',
                'slug' => 'pro',
                'description' => 'Для фрилансеров — неограниченные скачивания',
                'price' => 199000,       // 1 990 ₽/мес
                'annual_price' => 1990000, // 19 900 ₽/год (~1 658 ₽/мес)
                'downloads_per_month' => -1, // unlimited
                'features' => [
                    'Безлимитные скачивания',
                    'Все шаблоны каталога',
                    'Обновления шаблонов',
                    'Приоритетная поддержка',
                    'PSD/Figma исходники',
                ],
                'is_popular' => true,
                'sort_order' => 2,
            ],
            [
                'name' => 'Агентство',
                'slug' => 'agency',
                'description' => 'Для студий — безлимит + расширенная лицензия',
                'price' => 499000,       // 4 990 ₽/мес
                'annual_price' => 4990000, // 49 900 ₽/год (~4 158 ₽/мес)
                'downloads_per_month' => -1,
                'features' => [
                    'Безлимитные скачивания',
                    'Расширенная лицензия',
                    'Использование для клиентов',
                    'Приоритетная поддержка',
                    'PSD/Figma исходники',
                    'White-label (без упоминания)',
                ],
                'is_popular' => false,
                'sort_order' => 3,
            ],
        ];

        foreach ($plans as $plan) {
            SubscriptionPlan::updateOrCreate(
                ['slug' => $plan['slug']],
                $plan
            );
        }
    }
}
