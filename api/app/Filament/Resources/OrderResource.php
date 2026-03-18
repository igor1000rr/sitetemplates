<?php

namespace App\Filament\Resources;

use App\Filament\Resources\OrderResource\Pages;
use App\Models\Order;
use Filament\Forms;
use Filament\Forms\Form;
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

    public static function form(Form $form): Form
    {
        return $form->schema([
            Forms\Components\Section::make()->schema([
                Forms\Components\TextInput::make('order_number')->label('Номер')->disabled(),
                Forms\Components\Select::make('user_id')->label('Покупатель')
                    ->relationship('user', 'name')->searchable()->disabled(),
                Forms\Components\Select::make('status')->label('Статус')
                    ->options(['pending' => 'Ожидает', 'processing' => 'Обработка', 'paid' => 'Оплачен', 'cancelled' => 'Отменён', 'refunded' => 'Возврат']),
                Forms\Components\TextInput::make('total')->label('Сумма (коп.)')->disabled(),
                Forms\Components\TextInput::make('payment_method')->label('Способ оплаты')->disabled(),
            ])->columns(2),
        ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\TextColumn::make('order_number')->label('Номер')->searchable()->sortable(),
                Tables\Columns\TextColumn::make('user.name')->label('Покупатель')->searchable(),
                Tables\Columns\TextColumn::make('total')->label('Сумма')
                    ->formatStateUsing(fn ($state) => number_format($state / 100, 0, '.', ' ') . ' ₽')->sortable(),
                Tables\Columns\BadgeColumn::make('status')->label('Статус')
                    ->colors(['warning' => 'pending', 'info' => 'processing', 'success' => 'paid', 'danger' => fn ($state) => in_array($state, ['cancelled', 'refunded'])]),
                Tables\Columns\TextColumn::make('payment_method')->label('Оплата'),
                Tables\Columns\TextColumn::make('created_at')->label('Дата')->dateTime('d.m.Y H:i')->sortable(),
            ])
            ->defaultSort('created_at', 'desc')
            ->filters([
                Tables\Filters\SelectFilter::make('status')
                    ->options(['pending' => 'Ожидает', 'paid' => 'Оплачен', 'cancelled' => 'Отменён', 'refunded' => 'Возврат']),
            ])
            ->actions([Tables\Actions\EditAction::make()]);
    }

    public static function getPages(): array
    {
        return [
            'index' => Pages\ListOrders::route('/'),
            'edit' => Pages\EditOrder::route('/{record}/edit'),
        ];
    }

    public static function canCreate(): bool { return false; }
}
