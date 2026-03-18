<?php

namespace App\Filament\Resources;

use App\Models\CustomRequest;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;

class CustomRequestResource extends Resource
{
    protected static ?string $model = CustomRequest::class;
    protected static ?string $navigationIcon = 'heroicon-o-paint-brush';
    protected static ?string $navigationLabel = 'Заявки на разработку';
    protected static ?string $navigationGroup = 'Продажи';
    protected static ?int $navigationSort = 25;

    public static function getNavigationBadge(): ?string
    {
        return (string) CustomRequest::where('status', 'new')->count() ?: null;
    }

    public static function getNavigationBadgeColor(): string|array|null
    {
        return 'danger';
    }

    public static function form(Form $form): Form
    {
        return $form->schema([
            Forms\Components\Section::make('Клиент')->schema([
                Forms\Components\TextInput::make('name')->label('Имя')->disabled(),
                Forms\Components\TextInput::make('email')->label('Email')->disabled(),
                Forms\Components\TextInput::make('phone')->label('Телефон')->disabled(),
                Forms\Components\TextInput::make('company')->label('Компания')->disabled(),
            ])->columns(2),

            Forms\Components\Section::make('Детали проекта')->schema([
                Forms\Components\TextInput::make('business_type')->label('Тип бизнеса')->disabled(),
                Forms\Components\TextInput::make('budget_range')->label('Бюджет')->disabled(),
                Forms\Components\TextInput::make('deadline')->label('Сроки')->disabled(),
                Forms\Components\TextInput::make('preferred_platform')->label('Платформа')->disabled(),
                Forms\Components\Textarea::make('description')->label('Описание')->disabled()->columnSpanFull(),
                Forms\Components\Textarea::make('reference_urls')->label('Примеры сайтов')->disabled()->columnSpanFull(),
            ])->columns(2),

            Forms\Components\Section::make('Управление')->schema([
                Forms\Components\Select::make('status')->options([
                    'new' => 'Новая',
                    'contacted' => 'Связались',
                    'in_progress' => 'В работе',
                    'proposal_sent' => 'КП отправлено',
                    'approved' => 'Одобрено',
                    'completed' => 'Завершено',
                    'cancelled' => 'Отменено',
                ])->label('Статус'),
                Forms\Components\Select::make('assigned_to')
                    ->relationship('assignee', 'name')
                    ->searchable()->preload()
                    ->label('Назначено'),
                Forms\Components\TextInput::make('estimated_price')
                    ->numeric()->label('Оценка (копейки)'),
                Forms\Components\Textarea::make('admin_notes')->label('Заметки')->columnSpanFull(),
            ])->columns(2),
        ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\TextColumn::make('name')->searchable()->label('Имя'),
                Tables\Columns\TextColumn::make('email')->searchable()->label('Email'),
                Tables\Columns\TextColumn::make('business_type')->label('Бизнес'),
                Tables\Columns\TextColumn::make('budget_range')->label('Бюджет'),
                Tables\Columns\TextColumn::make('status')->badge()
                    ->colors([
                        'danger' => 'new',
                        'warning' => 'contacted',
                        'primary' => 'in_progress',
                        'info' => 'proposal_sent',
                        'success' => 'approved',
                        'gray' => 'cancelled',
                    ])->label('Статус'),
                Tables\Columns\TextColumn::make('assignee.name')->label('Исполнитель'),
                Tables\Columns\TextColumn::make('created_at')->dateTime('d.m.Y H:i')->sortable()->label('Дата'),
            ])
            ->defaultSort('created_at', 'desc')
            ->filters([
                Tables\Filters\SelectFilter::make('status')->options([
                    'new' => 'Новая',
                    'contacted' => 'Связались',
                    'in_progress' => 'В работе',
                    'proposal_sent' => 'КП отправлено',
                ]),
            ])
            ->actions([Tables\Actions\EditAction::make()]);
    }

    public static function getPages(): array
    {
        return [
            'index' => CustomRequestResource\Pages\ListCustomRequests::route('/'),
            'edit' => CustomRequestResource\Pages\EditCustomRequest::route('/{record}/edit'),
        ];
    }
}
