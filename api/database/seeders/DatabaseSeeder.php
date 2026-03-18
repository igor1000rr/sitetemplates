<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\Platform;
use App\Models\Template;
use App\Models\TemplateImage;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // ─── Admin ───
        User::create([
            'name' => 'Admin',
            'email' => 'admin@templatename.ru',
            'password' => Hash::make('password'),
            'role' => 'admin',
            'email_verified_at' => now(),
        ]);

        // ─── Платформы ───
        $wp = Platform::create(['name' => 'WordPress', 'slug' => 'wordpress']);
        $tilda = Platform::create(['name' => 'Tilda', 'slug' => 'tilda']);

        // ─── Категории ───
        $cats = [];
        $catData = [
            ['Салон красоты', 'salon'],
            ['Строительство', 'construction'],
            ['Стоматология', 'dental'],
            ['Недвижимость', 'realty'],
            ['Автосервис', 'auto'],
            ['Доставка еды', 'food'],
            ['Образование', 'education'],
            ['Юристы', 'legal'],
            ['Digital-агентство', 'digital'],
            ['Ресторан', 'restaurant'],
            ['Медицина', 'medical'],
            ['Фитнес', 'fitness'],
        ];

        foreach ($catData as $i => [$name, $slug]) {
            $cats[$slug] = Category::create([
                'name' => $name,
                'slug' => $slug,
                'sort_order' => $i + 1,
            ]);
        }

        // ─── Шаблоны (тестовые) ───
        $templates = [
            [
                'title' => 'Мебель и кухни на заказ',
                'slug' => 'mebel-kuhni',
                'short_desc' => 'Премиум-шаблон для мебельного производства с каталогом, квизом и WooCommerce',
                'description' => 'Полноценный сайт для мебельного бизнеса. Каталог с фильтрами по категориям, материалам и цене. Встроенный квиз для расчёта стоимости кухни. Интеграция с WooCommerce для онлайн-продаж. Адаптивный дизайн, SEO-оптимизация, формы обратной связи.',
                'price' => 499000,
                'old_price' => 1500000,
                'category' => 'construction',
                'platform_id' => $wp->id,
                'template_type' => 'multipage',
                'demo_url' => 'https://flavor.flavor-flavor.ru',
                'features' => ['WooCommerce', 'Квиз', 'Каталог', 'SEO', 'Адаптив'],
                'tags' => ['мебель', 'кухни', 'интернет-магазин'],
                'image' => 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&h=500&fit=crop',
            ],
            [
                'title' => 'Стоматология — клиника полного цикла',
                'slug' => 'stomatologia',
                'short_desc' => 'Современный сайт для стоматологической клиники с онлайн-записью',
                'description' => 'Профессиональный шаблон для стоматологии. Онлайн-запись к врачу, страницы услуг с ценами, блок «Наши врачи» с сертификатами. Раздел отзывов, галерея работ до/после. Полностью адаптивный, быстрая загрузка.',
                'price' => 549000,
                'old_price' => 1800000,
                'category' => 'dental',
                'platform_id' => $wp->id,
                'template_type' => 'multipage',
                'demo_url' => 'https://flavor.flavor-flavor.ru',
                'features' => ['Запись онлайн', 'Врачи', 'Прайс', 'Отзывы', 'Адаптив'],
                'tags' => ['стоматология', 'клиника', 'медицина'],
                'image' => 'https://images.unsplash.com/photo-1629909613654-28e377c37b09?w=800&h=500&fit=crop',
            ],
            [
                'title' => 'Строительство бань и домов под ключ',
                'slug' => 'bani-doma',
                'short_desc' => 'Лендинг + квиз для строительной компании с калькулятором стоимости',
                'description' => 'Высококонверсионный лендинг для строительного бизнеса. Встроенный калькулятор стоимости, квиз для определения параметров проекта, портфолио выполненных работ. Формы захвата, блок преимуществ, отзывы клиентов.',
                'price' => 399000,
                'old_price' => 1200000,
                'category' => 'construction',
                'platform_id' => $wp->id,
                'template_type' => 'quiz',
                'demo_url' => 'https://flavor.flavor-flavor.ru',
                'features' => ['Калькулятор', 'Портфолио', 'Квиз', 'SEO'],
                'tags' => ['строительство', 'бани', 'дома'],
                'image' => 'https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?w=800&h=500&fit=crop',
            ],
            [
                'title' => 'Интернет-магазин стройматериалов',
                'slug' => 'stroymaterialy-shop',
                'short_desc' => 'Полноценный магазин на WooCommerce с каталогом, корзиной и фильтрами',
                'description' => 'Готовый интернет-магазин стройматериалов. WooCommerce с расширенными фильтрами по параметрам, корзина, личный кабинет, история заказов. Интеграция с платёжными системами. Импорт/экспорт товаров через CSV.',
                'price' => 699000,
                'old_price' => 2500000,
                'category' => 'construction',
                'platform_id' => $wp->id,
                'template_type' => 'shop',
                'demo_url' => 'https://flavor.flavor-flavor.ru',
                'features' => ['WooCommerce', 'Корзина', 'Фильтры', 'CSV-импорт', 'Оплата'],
                'tags' => ['стройматериалы', 'магазин', 'woocommerce'],
                'image' => 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=800&h=500&fit=crop',
            ],
            [
                'title' => 'Ремонт квартир и дизайн интерьера',
                'slug' => 'remont-kvartir',
                'short_desc' => 'Стильный лендинг для ремонтной компании с портфолио и квизом',
                'description' => 'Лендинг для компании по ремонту квартир. Портфолио с фото до/после, квиз для расчёта стоимости ремонта, блок с этапами работы, отзывы клиентов. Мобильная версия, быстрая загрузка.',
                'price' => 249000,
                'old_price' => 890000,
                'category' => 'construction',
                'platform_id' => $tilda->id,
                'template_type' => 'landing',
                'demo_url' => 'https://flavor.flavor-flavor.ru',
                'features' => ['Квиз', 'Портфолио', 'Адаптив'],
                'tags' => ['ремонт', 'квартиры', 'дизайн'],
                'image' => 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=800&h=500&fit=crop',
            ],
            [
                'title' => 'Digital-агентство и маркетинг',
                'slug' => 'digital-agency',
                'short_desc' => 'Многостраничный сайт для digital-агентства с кейсами и блогом',
                'description' => 'Профессиональный шаблон для digital-агентства. Страницы услуг, блок кейсов с результатами, блог для SEO-продвижения, секция тарифов. Команда, контакты, интеграция с CRM. Анимации, плавные переходы.',
                'price' => 449000,
                'old_price' => 1400000,
                'category' => 'digital',
                'platform_id' => $wp->id,
                'demo_url' => 'https://flavor.flavor-flavor.ru',
                'template_type' => 'multipage',
                'features' => ['Кейсы', 'Блог', 'Тарифы', 'CRM', 'Анимации'],
                'tags' => ['digital', 'агентство', 'маркетинг'],
                'image' => 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=500&fit=crop',
            ],
        ];

        foreach ($templates as $data) {
            $catSlug = $data['category'];
            unset($data['category']);

            $imageSrc = $data['image'];
            unset($data['image']);

            $t = Template::create([
                ...$data,
                'category_id' => $cats[$catSlug]->id,
                'status' => 'published',
                'is_featured' => true,
                'published_at' => now(),
            ]);

            TemplateImage::create([
                'template_id' => $t->id,
                'path' => $imageSrc,
                'alt' => $t->title,
                'is_main' => true,
            ]);
        }

        // ─── Категории блога ───
        $this->call(PostCategorySeeder::class);

        // ─── Планы подписок ───
        $this->call(SubscriptionPlanSeeder::class);
    }
}
