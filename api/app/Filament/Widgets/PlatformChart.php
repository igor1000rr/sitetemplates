<?php

namespace App\Filament\Widgets;

use App\Models\OrderItem;
use App\Models\Platform;
use Filament\Widgets\ChartWidget;
use Illuminate\Support\Facades\DB;

class PlatformChart extends ChartWidget
{
    protected static ?string $heading = 'Продажи по платформам';
    protected static ?int $sort = 7;
    protected int|string|array $columnSpan = 1;
    protected static ?string $maxHeight = '250px';

    protected function getData(): array
    {
        $data = DB::table('order_items')
            ->join('templates', 'order_items.template_id', '=', 'templates.id')
            ->join('orders', 'order_items.order_id', '=', 'orders.id')
            ->join('platforms', 'templates.platform_id', '=', 'platforms.id')
            ->where('orders.status', 'paid')
            ->select('platforms.name', DB::raw('COUNT(*) as count'), DB::raw('SUM(order_items.price) as revenue'))
            ->groupBy('platforms.name')
            ->orderByDesc('count')
            ->get();

        if ($data->isEmpty()) {
            // Fallback: показываем шаблоны по платформам
            $data = Platform::withCount('templates')
                ->having('templates_count', '>', 0)
                ->orderByDesc('templates_count')
                ->get()
                ->map(fn ($p) => (object) ['name' => $p->name, 'count' => $p->templates_count]);
        }

        $colors = ['#8b5cf6', '#f59e0b', '#10b981', '#f43f5e', '#6366f1'];

        return [
            'datasets' => [
                [
                    'data' => $data->pluck('count')->toArray(),
                    'backgroundColor' => array_slice($colors, 0, $data->count()),
                    'borderWidth' => 0,
                ],
            ],
            'labels' => $data->pluck('name')->toArray(),
        ];
    }

    protected function getType(): string
    {
        return 'pie';
    }
}
