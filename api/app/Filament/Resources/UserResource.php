<?php

namespace App\Filament\Resources;

use App\Filament\Resources\UserResource\Pages;
use App\Models\User;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;

class UserResource extends Resource
{
    protected static ?string $model = User::class;
    protected static ?string $navigationIcon = 'heroicon-o-users';
    protected static ?string $navigationGroup = 'Пользователи';
    protected static ?string $modelLabel = 'Пользователь';
    protected static ?string $pluralModelLabel = 'Пользователи';

    public static function form(Form $form): Form
    {
        return $form->schema([
            Forms\Components\TextInput::make('name')->label('Имя')->required(),
            Forms\Components\TextInput::make('email')->label('Email')->email()->required()->unique(ignoreRecord: true),
            Forms\Components\Select::make('role')->label('Роль')
                ->options(['user' => 'Пользователь', 'author' => 'Автор', 'admin' => 'Админ']),
            Forms\Components\TextInput::make('referral_code')->label('Реферальный код')->disabled(),
            Forms\Components\TextInput::make('referral_balance')->label('Реф. баланс (коп.)')->numeric()->disabled(),
        ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\TextColumn::make('id')->label('#')->sortable(),
                Tables\Columns\TextColumn::make('name')->label('Имя')->searchable()->sortable(),
                Tables\Columns\TextColumn::make('email')->label('Email')->searchable(),
                Tables\Columns\BadgeColumn::make('role')->label('Роль')
                    ->colors(['gray' => 'user', 'info' => 'author', 'danger' => 'admin']),
                Tables\Columns\TextColumn::make('orders_count')->label('Заказов')->counts('orders'),
                Tables\Columns\TextColumn::make('referral_code')->label('Реф. код'),
                Tables\Columns\TextColumn::make('created_at')->label('Регистрация')->dateTime('d.m.Y')->sortable(),
            ])
            ->defaultSort('created_at', 'desc')
            ->filters([
                Tables\Filters\SelectFilter::make('role')
                    ->options(['user' => 'Пользователь', 'author' => 'Автор', 'admin' => 'Админ']),
            ])
            ->actions([Tables\Actions\EditAction::make()]);
    }

    public static function getPages(): array
    {
        return [
            'index' => Pages\ListUsers::route('/'),
            'edit' => Pages\EditUser::route('/{record}/edit'),
        ];
    }

    public static function canCreate(): bool { return false; }
}
