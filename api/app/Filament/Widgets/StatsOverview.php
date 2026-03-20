<?php

namespace App\Filament\Widgets;

use App\Models\Order;
use App\Models\Review;
use App\Models\Subscription;
use App\Models\Template;
use App\Models\User;
use App\Models\CustomRequest;
use Filament\Widgets\StatsOverviewWidget;
use Filament\Widgets\StatsOverviewWidget\Stat;

class StatsOverview extends StatsOverviewWidget
{
    protected static ?int $sort = 1;
    protected int|string|array $columnSpan = 'full';

    protected function getStats(): array
    {
        $revenue = Order::where('status', 'paid')->sum('total');
        $revenueMonth = Order::where('status', 'paid')
            ->where('created_at', '>=', now()->startOfMonth())->sum('total');
        $revenueToday = Order::where('status', 'paid')
            ->where('created_at', '>=', now()->startOfDay())->sum('total');

        $ordersMonth = Order::where('status', 'paid')
            ->where('created_at', '>=', now()->startOfMonth())->count();
        $ordersToday = Order::where('status', 'paid')
            ->where('created_at', '>=', now()->startOfDay())->count();

        // Тренд: сравниваем с прошлым месяцем
        $lastMonthRevenue = Order::where('status', 'paid')
            ->whereBetween('created_at', [
                now()->subMonth()->startOfMonth(),
                now()->subMonth()->endOfMonth()
            ])->sum('total');

        $trend = $lastMonthRevenue > 0
            ? round(($revenueMonth - $lastMonthRevenue) / $lastMonthRevenue * 100)
            : 0;

        $pendingReviews = Review::where('status', 'pending')->count();
        $pendingRequests = CustomRequest::where('status', 'new')->count();

        return [
            Stat::make('Выручка за месяц', number_format($revenueMonth / 100, 0, '.', ' ') . ' ₽')
                ->description($trend >= 0 ? "+{$trend}% к прошлому месяцу" : "{$trend}% к прошлому месяцу")
                ->descriptionIcon($trend >= 0 ? 'heroicon-m-arrow-trending-up' : 'heroicon-m-arrow-trending-down')
                ->icon('heroicon-o-currency-dollar')
                ->chart($this->getRevenueChart())
                ->color($trend >= 0 ? 'success' : 'danger'),

            Stat::make('Заказы сегодня', $ordersToday)
                ->description("За месяц: {$ordersMonth} · Всего: " . Order::where('status', 'paid')->count())
                ->icon('heroicon-o-shopping-cart')
                ->color('info'),

            Stat::make('Пользователи', User::count())
                ->description('Новых за месяц: ' . User::where('created_at', '>=', now()->startOfMonth())->count())
                ->icon('heroicon-o-users')
                ->chart($this->getUsersChart())
                ->color('warning'),

            Stat::make('Активных подписок', Subscription::where('status', 'active')->count())
                ->description('Шаблонов: ' . Template::published()->count())
                ->icon('heroicon-o-arrow-path')
                ->color('primary'),

            Stat::make('На модерации', $pendingReviews)
                ->description('Отзывов ждут проверки')
                ->icon('heroicon-o-chat-bubble-left-ellipsis')
                ->color($pendingReviews > 0 ? 'danger' : 'success'),

            Stat::make('Заявки', $pendingRequests)
                ->description('Новых на разработку')
                ->icon('heroicon-o-paint-brush')
                ->color($pendingRequests > 0 ? 'danger' : 'success'),
        ];
    }

    private function getRevenueChart(): array
    {
        return collect(range(6, 0))->map(function ($i) {
            return Order::where('status', 'paid')
                ->where('created_at', '>=', now()->subDays($i)->startOfDay())
                ->where('created_at', '<', now()->subDays($i)->endOfDay())
                ->sum('total') / 100;
        })->toArray();
    }

    private function getUsersChart(): array
    {
        return collect(range(6, 0))->map(function ($i) {
            return User::where('created_at', '>=', now()->subDays($i)->startOfDay())
                ->where('created_at', '<', now()->subDays($i)->endOfDay())
                ->count();
        })->toArray();
    }
}
