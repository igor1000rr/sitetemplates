<?php

namespace App\Filament\Resources;

use App\Filament\Resources\SubscriptionResource\Pages;
use App\Models\Subscription;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;

class SubscriptionResource extends Resource
{
    protected static ?string $model = Subscription::class;
    protected static ?string $navigationIcon = 'heroicon-o-arrow-path';
    protected static ?string $navigationGroup = 'Продажи';
    protected static ?string $modelLabel = 'Подписка';
    protected static ?string $pluralModelLabel = 'Подписки';
    protected static ?int $navigationSort = 2;

    public static function form(Form $form): Form
    {
        return $form->schema([
            Forms\Components\Select::make('user_id')->relationship('user', 'name')->label('Пользователь')->disabled(),
            Forms\Components\Select::make('plan_id')->relationship('plan', 'name')->label('Тариф')->disabled(),
            Forms\Components\Select::make('billing_cycle')->label('Период')
                ->options(['monthly' => 'Ежемесячно', 'annual' => 'Ежегодно'])->disabled(),
            Forms\Components\Select::make('status')->label('Статус')
                ->options(['active' => 'Активна', 'cancelled' => 'Отменена', 'expired' => 'Истекла', 'past_due' => 'Просрочена']),
            Forms\Components\TextInput::make('price_paid')->label('Оплачено (коп.)')->disabled(),
            Forms\Components\TextInput::make('downloads_used')->label('Скачиваний использовано')->numeric(),
            Forms\Components\DateTimePicker::make('current_period_start')->label('Начало периода')->disabled(),
            Forms\Components\DateTimePicker::make('current_period_end')->label('Конец периода')->disabled(),
            Forms\Components\DateTimePicker::make('cancelled_at')->label('Отменена')->disabled(),
        ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\TextColumn::make('user.name')->label('Пользователь')->searchable(),
                Tables\Columns\TextColumn::make('plan.name')->label('Тариф')->sortable(),
                Tables\Columns\TextColumn::make('billing_cycle')->label('Период'),
                Tables\Columns\BadgeColumn::make('status')->label('Статус')
                    ->colors(['success' => 'active', 'warning' => 'cancelled', 'gray' => 'expired', 'danger' => 'past_due']),
                Tables\Columns\TextColumn::make('price_paid')->label('Сумма')
                    ->formatStateUsing(fn ($state) => number_format($state / 100, 0, '.', ' ') . ' ₽'),
                Tables\Columns\TextColumn::make('current_period_end')->label('До')->dateTime('d.m.Y')->sortable(),
                Tables\Columns\TextColumn::make('downloads_used')->label('Скач.'),
            ])
            ->defaultSort('created_at', 'desc')
            ->filters([
                Tables\Filters\SelectFilter::make('status')
                    ->options(['active' => 'Активна', 'cancelled' => 'Отменена', 'expired' => 'Истекла']),
            ])
            ->actions([Tables\Actions\EditAction::make()]);
    }

    public static function getPages(): array
    {
        return [
            'index' => Pages\ListSubscriptions::route('/'),
            'edit' => Pages\EditSubscription::route('/{record}/edit'),
        ];
    }

    public static function canCreate(): bool { return false; }
}
