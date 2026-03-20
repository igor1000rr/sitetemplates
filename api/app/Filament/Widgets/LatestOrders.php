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
                Tables\Columns\TextColumn::make('order_number')
                    ->label('Номер')
                    ->weight('bold')
                    ->copyable()
                    ->copyMessage('Скопировано')
                    ->url(fn ($record) => "/panel/orders/{$record->id}/edit"),
                Tables\Columns\TextColumn::make('user.name')
                    ->label('Покупатель')
                    ->description(fn ($record) => $record->user?->email)
                    ->searchable(),
                Tables\Columns\TextColumn::make('items')
                    ->label('Шаблоны')
                    ->formatStateUsing(fn ($record) =>
                        $record->items->map(fn ($i) => $i->template?->title)->filter()->join(', ')
                    )
                    ->limit(40)
                    ->color('gray'),
                Tables\Columns\TextColumn::make('total')
                    ->label('Сумма')
                    ->formatStateUsing(fn ($state) => number_format($state / 100, 0, '.', ' ') . ' ₽')
                    ->weight('bold')
                    ->color('success'),
                Tables\Columns\BadgeColumn::make('status')
                    ->label('Статус')
                    ->colors([
                        'warning' => 'pending',
                        'info' => 'processing',
                        'success' => 'paid',
                        'danger' => fn ($s) => in_array($s, ['cancelled', 'refunded']),
                    ]),
                Tables\Columns\TextColumn::make('created_at')
                    ->label('Дата')
                    ->dateTime('d.m.Y H:i')
                    ->since()
                    ->size('xs'),
            ])
            ->paginated(false)
            ->striped();
    }
}
