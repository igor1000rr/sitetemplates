<?php

namespace Database\Seeders;

use App\Models\PostCategory;
use Illuminate\Database\Seeder;

class PostCategorySeeder extends Seeder
{
    public function run(): void
    {
        $categories = [
            ['name' => 'Гайды', 'slug' => 'guides', 'description' => 'Пошаговые инструкции по созданию и настройке сайтов'],
            ['name' => 'SEO', 'slug' => 'seo', 'description' => 'Советы по продвижению сайтов в поисковиках'],
            ['name' => 'Дизайн', 'slug' => 'design', 'description' => 'Тренды дизайна и UX-практики'],
            ['name' => 'WordPress', 'slug' => 'wordpress', 'description' => 'Всё о WordPress: темы, плагины, оптимизация'],
            ['name' => 'Tilda', 'slug' => 'tilda', 'description' => 'Работа с Tilda: шаблоны, Zero Block, интеграции'],
            ['name' => 'Бизнес', 'slug' => 'business', 'description' => 'Запуск бизнеса в интернете, маркетинг, аналитика'],
            ['name' => 'Обновления', 'slug' => 'updates', 'description' => 'Новые шаблоны, фичи и обновления платформы'],
        ];

        foreach ($categories as $i => $cat) {
            PostCategory::updateOrCreate(
                ['slug' => $cat['slug']],
                [...$cat, 'sort_order' => $i]
            );
        }
    }
}
