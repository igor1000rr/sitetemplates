<?php

namespace App\Filament\Resources;

use App\Filament\Resources\OrderResource\Pages;
use App\Models\Order;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Infolists;
use Filament\Infolists\Infolist;
use Filament\Notifications\Notification;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;

class OrderResource extends Resource
{
    protected static ?string $model = Order::class;
    protected static ?string $navigationIcon = 'heroicon-o-shopping-cart';
    protected static ?string $navigationGroup = 'Продажи';
    protected static ?string $modelLabel = 'Заказ';
    protected static ?string $pluralModelLabel = 'Заказы';
    protected static ?int $navigationSort = 1;

    public static function getNavigationBadge(): ?string
    {
        return (string) Order::where('status', 'pending')->count() ?: null;
    }

    public static function getNavigationBadgeColor(): string|array|null
    {
        return 'warning';
    }

    public static function getGloballySearchableAttributes(): array
    {
        return ['order_number', 'user.name', 'user.email'];
    }

    public static function form(Form $form): Form
    {
        return $form->schema([
            Forms\Components\Section::make('Заказ')->schema([
                Forms\Components\TextInput::make('order_number')->label('Номер заказа')->disabled(),
                Forms\Components\Select::make('user_id')->label('Покупатель')
                    ->relationship('user', 'name')->searchable()->disabled(),
                Forms\Components\Select::make('status')->label('Статус')
                    ->options([
                        'pending' => '⏳ Ожидает',
                        'processing' => '⚙️ Обработка',
                        'paid' => '✅ Оплачен',
                        'cancelled' => '❌ Отменён',
                        'refunded' => '↩️ Возврат',
                    ]),
                Forms\Components\TextInput::make('total')->label('Сумма')
                    ->formatStateUsing(fn ($state) => number_format($state / 100, 0, '.', ' ') . ' ₽')
                    ->disabled(),
                Forms\Components\TextInput::make('payment_method')->label('Способ оплаты')->disabled(),
                Forms\Components\TextInput::make('promo_code')->label('Промокод')->disabled(),
                Forms\Components\DateTimePicker::make('paid_at')->label('Оплачен')->disabled(),
                Forms\Components\DateTimePicker::make('created_at')->label('Создан')->disabled(),
            ])->columns(2),
        ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\TextColumn::make('order_number')
                    ->label('Номер')
                    ->searchable()
                    ->sortable()
                    ->weight('bold')
                    ->copyable()
                    ->copyMessage('Номер скопирован'),
                Tables\Columns\TextColumn::make('user.name')
                    ->label('Покупатель')
                    ->searchable()
                    ->description(fn ($record) => $record->user?->email),
                Tables\Columns\TextColumn::make('items_count')
                    ->label('Товаров')
                    ->counts('items')
                    ->alignCenter(),
                Tables\Columns\TextColumn::make('total')
                    ->label('Сумма')
                    ->formatStateUsing(fn ($state) => number_format($state / 100, 0, '.', ' ') . ' ₽')
                    ->sortable()
                    ->weight('bold')
                    ->color('success'),
                Tables\Columns\TextColumn::make('promo_code')
                    ->label('Промо')
                    ->placeholder('—')
                    ->color('warning')
                    ->size('xs'),
                Tables\Columns\BadgeColumn::make('status')
                    ->label('Статус')
                    ->colors([
                        'warning' => 'pending',
                        'info' => 'processing',
                        'success' => 'paid',
                        'danger' => fn ($state) => in_array($state, ['cancelled', 'refunded']),
                    ]),
                Tables\Columns\TextColumn::make('payment_method')
                    ->label('Оплата')
                    ->placeholder('—'),
                Tables\Columns\TextColumn::make('created_at')
                    ->label('Дата')
                    ->dateTime('d.m.Y H:i')
                    ->sortable()
                    ->size('xs'),
            ])
            ->defaultSort('created_at', 'desc')
            ->filters([
                Tables\Filters\SelectFilter::make('status')
                    ->options([
                        'pending' => 'Ожидает',
                        'paid' => 'Оплачен',
                        'cancelled' => 'Отменён',
                        'refunded' => 'Возврат',
                    ]),
                Tables\Filters\Filter::make('created_at')
                    ->form([
                        Forms\Components\DatePicker::make('from')->label('С'),
                        Forms\Components\DatePicker::make('until')->label('По'),
                    ])
                    ->query(function ($query, array $data) {
                        return $query
                            ->when($data['from'], fn ($q, $d) => $q->whereDate('created_at', '>=', $d))
                            ->when($data['until'], fn ($q, $d) => $q->whereDate('created_at', '<=', $d));
                    }),
            ])
            ->actions([
                Tables\Actions\Action::make('markPaid')
                    ->label('Оплачен')
                    ->icon('heroicon-o-check-circle')
                    ->color('success')
                    ->visible(fn ($record) => $record->status === 'pending')
                    ->requiresConfirmation()
                    ->action(function ($record) {
                        $record->update(['status' => 'paid', 'paid_at' => now()]);
                        Notification::make()->title('Заказ отмечен как оплаченный')->success()->send();
                    }),
                Tables\Actions\EditAction::make(),
            ])
            ->striped()
            ->paginated([10, 25, 50]);
    }

    public static function getPages(): array
    {
        return [
            'index' => Pages\ListOrders::route('/'),
            'edit' => Pages\EditOrder::route('/{record}/edit'),
        ];
    }

    public static function canCreate(): bool
    {
        return false;
    }
}
