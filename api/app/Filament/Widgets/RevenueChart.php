<?php

namespace App\Filament\Widgets;

use App\Models\Order;
use Filament\Widgets\ChartWidget;
use Illuminate\Support\Carbon;

class RevenueChart extends ChartWidget
{
    protected static ?string $heading = 'Выручка и заказы';
    protected static ?int $sort = 2;
    protected int|string|array $columnSpan = 'full';
    protected static ?string $maxHeight = '280px';

    public ?string $filter = '30';

    protected function getFilters(): ?array
    {
        return [
            '7' => 'Неделя',
            '30' => 'Месяц',
            '90' => '3 месяца',
            '365' => 'Год',
        ];
    }

    protected function getData(): array
    {
        $days = (int) $this->filter;

        if ($days <= 30) {
            // По дням
            $points = collect(range($days - 1, 0))->map(fn ($i) => now()->subDays($i));
            $labels = $points->map(fn ($d) => $d->format('d.m'))->toArray();

            $revenue = $points->map(fn (Carbon $d) =>
                Order::where('status', 'paid')
                    ->whereDate('created_at', $d->toDateString())
                    ->sum('total') / 100
            )->toArray();

            $orders = $points->map(fn (Carbon $d) =>
                Order::where('status', 'paid')
                    ->whereDate('created_at', $d->toDateString())
                    ->count()
            )->toArray();
        } else {
            // По месяцам
            $months = (int) ceil($days / 30);
            $points = collect(range($months - 1, 0))->map(fn ($i) => now()->subMonths($i));
            $labels = $points->map(fn ($m) => $m->translatedFormat('M'))->toArray();

            $revenue = $points->map(fn (Carbon $m) =>
                Order::where('status', 'paid')
                    ->whereBetween('created_at', [$m->copy()->startOfMonth(), $m->copy()->endOfMonth()])
                    ->sum('total') / 100
            )->toArray();

            $orders = $points->map(fn (Carbon $m) =>
                Order::where('status', 'paid')
                    ->whereBetween('created_at', [$m->copy()->startOfMonth(), $m->copy()->endOfMonth()])
                    ->count()
            )->toArray();
        }

        return [
            'datasets' => [
                [
                    'label' => 'Выручка (₽)',
                    'data' => $revenue,
                    'borderColor' => '#8b5cf6',
                    'backgroundColor' => 'rgba(139, 92, 246, 0.08)',
                    'fill' => true,
                    'tension' => 0.4,
                    'yAxisID' => 'y',
                ],
                [
                    'label' => 'Заказов',
                    'data' => $orders,
                    'borderColor' => '#22d3ee',
                    'backgroundColor' => 'rgba(34, 211, 238, 0.08)',
                    'fill' => true,
                    'tension' => 0.4,
                    'yAxisID' => 'y1',
                ],
            ],
            'labels' => $labels,
        ];
    }

    protected function getOptions(): array
    {
        return [
            'scales' => [
                'y' => [
                    'position' => 'left',
                    'grid' => ['display' => false],
                ],
                'y1' => [
                    'position' => 'right',
                    'grid' => ['display' => false],
                ],
            ],
            'plugins' => [
                'legend' => ['position' => 'top'],
            ],
        ];
    }

    protected function getType(): string
    {
        return 'line';
    }
}
