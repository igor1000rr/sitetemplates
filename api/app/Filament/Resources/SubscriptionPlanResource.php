<?php

namespace App\Filament\Resources;

use App\Filament\Resources\SubscriptionPlanResource\Pages;
use App\Models\SubscriptionPlan;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;

class SubscriptionPlanResource extends Resource
{
    protected static ?string $model = SubscriptionPlan::class;
    protected static ?string $navigationIcon = 'heroicon-o-credit-card';
    protected static ?string $navigationGroup = 'Настройки';
    protected static ?string $modelLabel = 'Тариф';
    protected static ?string $pluralModelLabel = 'Тарифы';

    public static function form(Form $form): Form
    {
        return $form->schema([
            Forms\Components\TextInput::make('name')->label('Название')->required(),
            Forms\Components\TextInput::make('slug')->label('Slug')->required()->unique(ignoreRecord: true),
            Forms\Components\Textarea::make('description')->label('Описание'),
            Forms\Components\TextInput::make('price')->label('Цена/мес (коп.)')->numeric()->required(),
            Forms\Components\TextInput::make('annual_price')->label('Цена/год (коп.)')->numeric(),
            Forms\Components\TextInput::make('downloads_per_month')->label('Скачиваний/мес (-1=безлим)')->numeric()->default(-1),
            Forms\Components\TagsInput::make('features')->label('Фичи'),
            Forms\Components\Toggle::make('is_popular')->label('Популярный'),
            Forms\Components\Toggle::make('is_active')->label('Активен')->default(true),
            Forms\Components\TextInput::make('sort_order')->label('Сортировка')->numeric()->default(0),
        ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\TextColumn::make('name')->label('Название')->sortable(),
                Tables\Columns\TextColumn::make('price')->label('Месяц')
                    ->formatStateUsing(fn ($state) => number_format($state / 100, 0, '.', ' ') . ' ₽'),
                Tables\Columns\TextColumn::make('annual_price')->label('Год')
                    ->formatStateUsing(fn ($state) => $state ? number_format($state / 100, 0, '.', ' ') . ' ₽' : '—'),
                Tables\Columns\TextColumn::make('downloads_per_month')->label('Скач./мес')
                    ->formatStateUsing(fn ($state) => $state === -1 ? '∞' : $state),
                Tables\Columns\IconColumn::make('is_popular')->label('★')->boolean(),
                Tables\Columns\IconColumn::make('is_active')->label('Акт.')->boolean(),
                Tables\Columns\TextColumn::make('subscriptions_count')->label('Подписок')->counts('subscriptions'),
            ])
            ->reorderable('sort_order')
            ->actions([Tables\Actions\EditAction::make()])
            ->bulkActions([Tables\Actions\DeleteBulkAction::make()]);
    }

    public static function getPages(): array
    {
        return [
            'index' => Pages\ListSubscriptionPlans::route('/'),
            'create' => Pages\CreateSubscriptionPlan::route('/create'),
            'edit' => Pages\EditSubscriptionPlan::route('/{record}/edit'),
        ];
    }
}
