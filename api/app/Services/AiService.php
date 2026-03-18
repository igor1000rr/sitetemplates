<?php

namespace App\Services;

use App\Models\Category;
use App\Models\Template;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class AiService
{
    private string $apiKey;
    private string $model;

    public function __construct()
    {
        $this->apiKey = config('services.openai.api_key', '');
        $this->model = config('services.openai.model', 'gpt-4o-mini');
    }

    public function isEnabled(): bool
    {
        return !empty($this->apiKey);
    }

    /**
     * Подобрать шаблоны по описанию бизнеса
     */
    public function matchTemplates(string $query, array $history = []): array
    {
        // Получаем все опубликованные шаблоны и категории
        $templates = Template::published()
            ->with(['category', 'platform', 'mainImage'])
            ->get();

        $categories = Category::active()->get();

        if ($templates->isEmpty()) {
            return [
                'message' => 'Пока в каталоге нет шаблонов. Мы скоро добавим!',
                'templates' => [],
            ];
        }

        // Если OpenAI доступен — используем AI
        if ($this->isEnabled()) {
            return $this->matchWithAi($query, $templates, $categories, $history);
        }

        // Fallback: ключевое сопоставление
        return $this->matchWithKeywords($query, $templates, $categories);
    }

    /**
     * AI-подбор через OpenAI
     */
    private function matchWithAi(string $query, $templates, $categories, array $history): array
    {
        $catalogSummary = $templates->map(fn ($t) => [
            'id' => $t->id,
            'title' => $t->title,
            'slug' => $t->slug,
            'category' => $t->category->name,
            'platform' => $t->platform->name,
            'type' => $t->template_type,
            'price_rub' => $t->price / 100,
            'features' => $t->features,
            'short_desc' => $t->short_desc,
            'rating' => $t->rating,
            'sales' => $t->sales_count,
        ])->toArray();

        $categoryList = $categories->pluck('name', 'slug')->toArray();

        $systemPrompt = <<<PROMPT
Ты — AI-консультант маркетплейса шаблонов сайтов. Твоя задача — подобрать идеальный шаблон по описанию бизнеса клиента.

Каталог шаблонов (JSON):
```json
{catalog}
```

Категории: {categories}

Правила:
1. Отвечай на русском, дружелюбно и коротко (2-4 предложения)
2. Рекомендуй 1-3 конкретных шаблона из каталога по ID
3. Объясни ПОЧЕМУ каждый шаблон подходит именно для этого бизнеса
4. Если ничего не подходит идеально — рекомендуй ближайший вариант и скажи что можно доработать
5. Если вопрос не про подбор шаблонов — вежливо верни к теме
6. Упоминай конкретные фичи шаблона, которые полезны клиенту

Формат ответа — строго JSON:
{
  "message": "Текст ответа клиенту с рекомендациями",
  "template_ids": [1, 2, 3],
  "follow_up": "Уточняющий вопрос если нужно (или null)"
}
PROMPT;

        $systemPrompt = str_replace(
            ['{catalog}', '{categories}'],
            [json_encode($catalogSummary, JSON_UNESCAPED_UNICODE), implode(', ', $categoryList)],
            $systemPrompt
        );

        // Формируем историю сообщений
        $messages = [['role' => 'system', 'content' => $systemPrompt]];
        foreach ($history as $msg) {
            $messages[] = [
                'role' => $msg['role'] === 'user' ? 'user' : 'assistant',
                'content' => $msg['text'] ?? $msg['content'] ?? '',
            ];
        }
        $messages[] = ['role' => 'user', 'content' => $query];

        try {
            $response = Http::withToken($this->apiKey)
                ->timeout(30)
                ->post('https://api.openai.com/v1/chat/completions', [
                    'model' => $this->model,
                    'messages' => $messages,
                    'temperature' => 0.7,
                    'max_tokens' => 800,
                    'response_format' => ['type' => 'json_object'],
                ]);

            if (!$response->successful()) {
                Log::error('OpenAI API error', ['status' => $response->status(), 'body' => $response->body()]);
                return $this->matchWithKeywords($query, $templates, $categories);
            }

            $content = $response->json('choices.0.message.content', '{}');
            $parsed = json_decode($content, true);

            if (!$parsed || !isset($parsed['message'])) {
                return $this->matchWithKeywords($query, $templates, $categories);
            }

            // Подгружаем полные данные шаблонов
            $templateIds = $parsed['template_ids'] ?? [];
            $matched = $templates->whereIn('id', $templateIds)->values();

            return [
                'message' => $parsed['message'],
                'templates' => $this->formatTemplates($matched),
                'follow_up' => $parsed['follow_up'] ?? null,
            ];
        } catch (\Throwable $e) {
            Log::error('AI match error: ' . $e->getMessage());
            return $this->matchWithKeywords($query, $templates, $categories);
        }
    }

    /**
     * Fallback: ключевой поиск без AI
     */
    private function matchWithKeywords(string $query, $templates, $categories): array
    {
        $query = mb_strtolower($query);

        // Маппинг ключевых слов → категория
        $keywordMap = [
            'салон' => 'salon', 'красот' => 'salon', 'парикмахер' => 'salon', 'маникюр' => 'salon', 'барбер' => 'salon',
            'строит' => 'construction', 'ремонт' => 'construction', 'мебел' => 'construction', 'кухн' => 'construction', 'бан' => 'construction', 'дом' => 'construction',
            'стоматол' => 'dental', 'зуб' => 'dental', 'дент' => 'dental',
            'недвижим' => 'realty', 'квартир' => 'realty', 'риелтор' => 'realty',
            'авто' => 'auto', 'машин' => 'auto', 'сто' => 'auto', 'шиномонтаж' => 'auto',
            'доставк' => 'food', 'еда' => 'food', 'кафе' => 'food', 'пицц' => 'food', 'суши' => 'food',
            'образован' => 'education', 'курс' => 'education', 'школ' => 'education', 'обучен' => 'education',
            'юрист' => 'legal', 'адвокат' => 'legal', 'право' => 'legal',
            'digital' => 'digital', 'агентств' => 'digital', 'маркетинг' => 'digital', 'smm' => 'digital', 'seo' => 'digital',
            'ресторан' => 'restaurant', 'бар' => 'restaurant',
            'медицин' => 'medical', 'клиник' => 'medical', 'врач' => 'medical',
            'фитнес' => 'fitness', 'спорт' => 'fitness', 'тренер' => 'fitness', 'зал' => 'fitness',
            'магазин' => null, 'интернет-магазин' => null, 'shop' => null,
        ];

        $matchedCategory = null;
        $isShop = false;
        foreach ($keywordMap as $keyword => $catSlug) {
            if (mb_strpos($query, $keyword) !== false) {
                if ($catSlug === null) {
                    $isShop = true;
                } else {
                    $matchedCategory = $catSlug;
                }
                break;
            }
        }

        // Фильтруем шаблоны
        $filtered = $templates;
        if ($matchedCategory) {
            $catFiltered = $templates->filter(fn ($t) => $t->category->slug === $matchedCategory);
            if ($catFiltered->isNotEmpty()) $filtered = $catFiltered;
        }
        if ($isShop) {
            $shopFiltered = $filtered->filter(fn ($t) => $t->template_type === 'shop');
            if ($shopFiltered->isNotEmpty()) $filtered = $shopFiltered;
        }

        // Сортируем по продажам + рейтингу
        $sorted = $filtered->sortByDesc(fn ($t) => $t->sales_count * 10 + $t->rating)->take(3)->values();

        if ($sorted->isEmpty()) {
            $sorted = $templates->sortByDesc('sales_count')->take(3)->values();
        }

        $catName = $matchedCategory
            ? $categories->firstWhere('slug', $matchedCategory)?->name ?? 'вашу нишу'
            : 'вашу нишу';

        $message = $sorted->count() > 0
            ? "Нашёл {$sorted->count()} " . ($sorted->count() === 1 ? 'шаблон' : 'шаблона') . " для категории «{$catName}». " .
              "Вот лучшие варианты — отсортировал по популярности и рейтингу:"
            : "Пока нет точных совпадений, но вот наши самые популярные шаблоны:";

        return [
            'message' => $message,
            'templates' => $this->formatTemplates($sorted),
            'follow_up' => 'Хотите узнать подробнее о каком-то шаблоне? Или опишите бизнес точнее — я уточню подбор.',
        ];
    }

    /**
     * Форматировать шаблоны для фронтенда
     */
    private function formatTemplates($templates): array
    {
        return $templates->map(fn ($t) => [
            'id' => $t->id,
            'title' => $t->title,
            'slug' => $t->slug,
            'price_rub' => $t->price / 100,
            'old_price_rub' => $t->old_price ? $t->old_price / 100 : null,
            'category' => $t->category->name,
            'platform' => $t->platform->name,
            'template_type' => $t->template_type,
            'image' => $t->mainImage?->path,
            'demo_url' => $t->demo_url,
            'rating' => $t->rating,
            'features' => array_slice($t->features ?? [], 0, 4),
        ])->toArray();
    }
}
