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

    public static function getNavigationBadge(): ?string
    {
        return (string) User::count();
    }

    public static function getGloballySearchableAttributes(): array
    {
        return ['name', 'email', 'referral_code'];
    }

    public static function form(Form $form): Form
    {
        return $form->schema([
            Forms\Components\Section::make('Профиль')->schema([
                Forms\Components\TextInput::make('name')->label('Имя')->required(),
                Forms\Components\TextInput::make('email')->label('Email')->email()->required()->unique(ignoreRecord: true),
                Forms\Components\TextInput::make('phone')->label('Телефон'),
                Forms\Components\Select::make('role')->label('Роль')
                    ->options([
                        'customer' => '👤 Покупатель',
                        'author' => '✍️ Автор',
                        'admin' => '🛡️ Админ',
                    ])
                    ->required(),
            ])->columns(2),
            Forms\Components\Section::make('Реферальная программа')->schema([
                Forms\Components\TextInput::make('referral_code')->label('Реферальный код')->disabled(),
                Forms\Components\TextInput::make('referral_balance')
                    ->label('Реф. баланс')
                    ->formatStateUsing(fn ($state) => number_format(($state ?? 0) / 100, 0, '.', ' ') . ' ₽')
                    ->disabled(),
                Forms\Components\TextInput::make('referred_by')->label('Привёл (код)')->disabled(),
            ])->columns(3)->collapsible(),
        ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\TextColumn::make('id')->label('#')->sortable(),
                Tables\Columns\TextColumn::make('name')
                    ->label('Имя')
                    ->searchable()
                    ->sortable()
                    ->weight('bold'),
                Tables\Columns\TextColumn::make('email')
                    ->label('Email')
                    ->searchable()
                    ->copyable()
                    ->copyMessage('Email скопирован'),
                Tables\Columns\BadgeColumn::make('role')
                    ->label('Роль')
                    ->colors([
                        'gray' => 'customer',
                        'info' => 'author',
                        'danger' => 'admin',
                    ])
                    ->formatStateUsing(fn ($state) => match ($state) {
                        'customer' => 'Покупатель',
                        'author' => 'Автор',
                        'admin' => 'Админ',
                        default => $state,
                    }),
                Tables\Columns\TextColumn::make('orders_count')
                    ->label('Заказов')
                    ->counts('orders')
                    ->alignCenter()
                    ->sortable(),
                Tables\Columns\TextColumn::make('referral_code')
                    ->label('Реф.')
                    ->copyable()
                    ->color('warning')
                    ->size('xs'),
                Tables\Columns\TextColumn::make('created_at')
                    ->label('Регистрация')
                    ->dateTime('d.m.Y')
                    ->sortable()
                    ->size('xs'),
            ])
            ->defaultSort('created_at', 'desc')
            ->filters([
                Tables\Filters\SelectFilter::make('role')
                    ->options([
                        'customer' => 'Покупатель',
                        'author' => 'Автор',
                        'admin' => 'Админ',
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
            ->actions([Tables\Actions\EditAction::make()])
            ->striped()
            ->paginated([10, 25, 50, 100]);
    }

    public static function getPages(): array
    {
        return [
            'index' => Pages\ListUsers::route('/'),
            'edit' => Pages\EditUser::route('/{record}/edit'),
        ];
    }
}
