<?php

namespace App\Filament\Widgets;

use App\Models\Category;
use App\Models\Template;
use Filament\Widgets\ChartWidget;

class CategoryChart extends ChartWidget
{
    protected static ?string $heading = 'Шаблоны по категориям';
    protected static ?int $sort = 4;
    protected int|string|array $columnSpan = 1;
    protected static ?string $maxHeight = '250px';

    protected function getData(): array
    {
        $categories = Category::withCount('publishedTemplates')
            ->having('published_templates_count', '>', 0)
            ->orderByDesc('published_templates_count')
            ->limit(8)
            ->get();

        $colors = [
            '#8b5cf6', '#22d3ee', '#f59e0b', '#10b981',
            '#f43f5e', '#6366f1', '#ec4899', '#14b8a6',
        ];

        return [
            'datasets' => [
                [
                    'data' => $categories->pluck('published_templates_count')->toArray(),
                    'backgroundColor' => array_slice($colors, 0, $categories->count()),
                    'borderWidth' => 0,
                ],
            ],
            'labels' => $categories->pluck('name')->toArray(),
        ];
    }

    protected function getOptions(): array
    {
        return [
            'plugins' => [
                'legend' => [
                    'position' => 'right',
                    'labels' => ['boxWidth' => 12, 'padding' => 8],
                ],
            ],
        ];
    }

    protected function getType(): string
    {
        return 'doughnut';
    }
}
