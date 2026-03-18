<?php

namespace App\Filament\Widgets;

use App\Models\Order;
use Filament\Tables;
use Filament\Tables\Table;
use Filament\Widgets\TableWidget as BaseWidget;

class LatestOrders extends BaseWidget
{
    protected static ?string $heading = 'Последние заказы';
    protected static ?int $sort = 3;
    protected int|string|array $columnSpan = 'full';

    public function table(Table $table): Table
    {
        return $table
            ->query(Order::query()->with(['user', 'items.template'])->latest()->limit(10))
            ->columns([
                Tables\Columns\TextColumn::make('order_number')->label('Номер'),
                Tables\Columns\TextColumn::make('user.name')->label('Покупатель'),
                Tables\Columns\TextColumn::make('total')->label('Сумма')
                    ->formatStateUsing(fn ($state) => number_format($state / 100, 0, '.', ' ') . ' ₽'),
                Tables\Columns\BadgeColumn::make('status')->label('Статус')
                    ->colors(['warning' => 'pending', 'success' => 'paid', 'danger' => fn ($s) => in_array($s, ['cancelled', 'refunded'])]),
                Tables\Columns\TextColumn::make('created_at')->label('Дата')->dateTime('d.m.Y H:i'),
            ])
            ->paginated(false);
    }
}
