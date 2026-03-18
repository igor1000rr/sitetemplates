<?php

namespace App\Filament\Resources;

use App\Filament\Resources\PromoCodeResource\Pages;
use App\Models\PromoCode;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;

class PromoCodeResource extends Resource
{
    protected static ?string $model = PromoCode::class;
    protected static ?string $navigationIcon = 'heroicon-o-tag';
    protected static ?string $navigationGroup = 'Продажи';
    protected static ?string $modelLabel = 'Промокод';
    protected static ?string $pluralModelLabel = 'Промокоды';
    protected static ?int $navigationSort = 3;

    public static function form(Form $form): Form
    {
        return $form->schema([
            Forms\Components\TextInput::make('code')->label('Код')->required()->unique(ignoreRecord: true),
            Forms\Components\Select::make('type')->label('Тип')
                ->options(['percent' => 'Процент', 'fixed' => 'Фиксированная'])->required(),
            Forms\Components\TextInput::make('value')->label('Значение')->numeric()->required()
                ->helperText('Процент (10 = 10%) или сумма в копейках'),
            Forms\Components\TextInput::make('max_uses')->label('Макс. использований')->numeric()->nullable(),
            Forms\Components\TextInput::make('used_count')->label('Использовано')->numeric()->disabled(),
            Forms\Components\DateTimePicker::make('valid_from')->label('Действует с'),
            Forms\Components\DateTimePicker::make('valid_until')->label('Действует до'),
            Forms\Components\Toggle::make('is_active')->label('Активен')->default(true),
        ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\TextColumn::make('code')->label('Код')->searchable()->copyable(),
                Tables\Columns\TextColumn::make('type')->label('Тип'),
                Tables\Columns\TextColumn::make('value')->label('Значение'),
                Tables\Columns\TextColumn::make('used_count')->label('Исп.')->sortable(),
                Tables\Columns\TextColumn::make('max_uses')->label('Макс.'),
                Tables\Columns\IconColumn::make('is_active')->label('Акт.')->boolean(),
                Tables\Columns\TextColumn::make('valid_until')->label('До')->dateTime('d.m.Y'),
            ])
            ->actions([Tables\Actions\EditAction::make(), Tables\Actions\DeleteAction::make()])
            ->bulkActions([Tables\Actions\DeleteBulkAction::make()]);
    }

    public static function getPages(): array
    {
        return [
            'index' => Pages\ListPromoCodes::route('/'),
            'create' => Pages\CreatePromoCode::route('/create'),
            'edit' => Pages\EditPromoCode::route('/{record}/edit'),
        ];
    }
}
