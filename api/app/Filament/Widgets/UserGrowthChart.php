<?php

namespace App\Filament\Widgets;

use App\Models\User;
use Filament\Widgets\ChartWidget;

class UserGrowthChart extends ChartWidget
{
    protected static ?string $heading = 'Рост пользователей';
    protected static ?int $sort = 6;
    protected int|string|array $columnSpan = 1;
    protected static ?string $maxHeight = '250px';

    protected function getData(): array
    {
        $months = collect(range(5, 0))->map(fn ($i) => now()->subMonths($i));

        $newUsers = $months->map(fn ($m) =>
            User::whereBetween('created_at', [
                $m->copy()->startOfMonth(),
                $m->copy()->endOfMonth()
            ])->count()
        )->toArray();

        $cumulative = [];
        $total = User::where('created_at', '<', $months->first()->startOfMonth())->count();
        foreach ($newUsers as $count) {
            $total += $count;
            $cumulative[] = $total;
        }

        return [
            'datasets' => [
                [
                    'label' => 'Новых',
                    'data' => $newUsers,
                    'backgroundColor' => '#8b5cf6',
                    'borderRadius' => 6,
                ],
                [
                    'label' => 'Всего',
                    'data' => $cumulative,
                    'type' => 'line',
                    'borderColor' => '#22d3ee',
                    'backgroundColor' => 'transparent',
                    'tension' => 0.4,
                    'pointRadius' => 3,
                ],
            ],
            'labels' => $months->map(fn ($m) => $m->translatedFormat('M'))->toArray(),
        ];
    }

    protected function getType(): string
    {
        return 'bar';
    }
}
