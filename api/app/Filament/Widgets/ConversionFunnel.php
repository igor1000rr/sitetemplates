<?php

namespace App\Filament\Widgets;

use App\Models\Order;
use App\Models\Template;
use App\Models\User;
use Filament\Widgets\ChartWidget;

class ConversionFunnel extends ChartWidget
{
    protected static ?string $heading = 'Воронка конверсии (месяц)';
    protected static ?int $sort = 8;
    protected int|string|array $columnSpan = 1;
    protected static ?string $maxHeight = '250px';

    protected function getData(): array
    {
        $startOfMonth = now()->startOfMonth();

        $visitors = Template::where('updated_at', '>=', $startOfMonth)->sum('views_count') ?: 100;
        $registrations = User::where('created_at', '>=', $startOfMonth)->count();
        $orders = Order::where('created_at', '>=', $startOfMonth)->count();
        $paid = Order::where('status', 'paid')->where('created_at', '>=', $startOfMonth)->count();

        return [
            'datasets' => [
                [
                    'data' => [$visitors, $registrations, $orders, $paid],
                    'backgroundColor' => [
                        'rgba(139, 92, 246, 0.7)',
                        'rgba(34, 211, 238, 0.7)',
                        'rgba(245, 158, 11, 0.7)',
                        'rgba(16, 185, 129, 0.7)',
                    ],
                    'borderRadius' => 6,
                ],
            ],
            'labels' => ['Просмотры', 'Регистрации', 'Заказы', 'Оплачено'],
        ];
    }

    protected function getType(): string
    {
        return 'bar';
    }
}
