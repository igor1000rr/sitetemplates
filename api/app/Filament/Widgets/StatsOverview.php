<?php

namespace App\Filament\Widgets;

use App\Models\Order;
use App\Models\Subscription;
use App\Models\Template;
use App\Models\User;
use Filament\Widgets\StatsOverviewWidget;
use Filament\Widgets\StatsOverviewWidget\Stat;

class StatsOverview extends StatsOverviewWidget
{
    protected static ?int $sort = 1;

    protected function getStats(): array
    {
        $revenue = Order::where('status', 'paid')->sum('total');
        $revenueMonth = Order::where('status', 'paid')
            ->where('created_at', '>=', now()->startOfMonth())->sum('total');

        return [
            Stat::make('Выручка за месяц', number_format($revenueMonth / 100, 0, '.', ' ') . ' ₽')
                ->description('Общая: ' . number_format($revenue / 100, 0, '.', ' ') . ' ₽')
                ->icon('heroicon-o-currency-dollar')
                ->color('success'),

            Stat::make('Заказов (оплачено)', Order::where('status', 'paid')->count())
                ->description('За месяц: ' . Order::where('status', 'paid')
                    ->where('created_at', '>=', now()->startOfMonth())->count())
                ->icon('heroicon-o-shopping-cart')
                ->color('info'),

            Stat::make('Активных подписок', Subscription::active()->count())
                ->description('Всего пользователей: ' . User::count())
                ->icon('heroicon-o-arrow-path')
                ->color('warning'),

            Stat::make('Шаблонов', Template::published()->count())
                ->description('Всего: ' . Template::count() . ' (вкл. черновики)')
                ->icon('heroicon-o-squares-2x2')
                ->color('primary'),
        ];
    }
}
