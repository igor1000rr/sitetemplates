<?php

namespace App\Filament\Resources;

use App\Filament\Resources\DeploymentResource\Pages;
use App\Models\Deployment;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;

class DeploymentResource extends Resource
{
    protected static ?string $model = Deployment::class;
    protected static ?string $navigationIcon = 'heroicon-o-cloud-arrow-up';
    protected static ?string $navigationGroup = 'Каталог';
    protected static ?string $modelLabel = 'Деплой';
    protected static ?string $pluralModelLabel = 'Деплои';
    protected static ?int $navigationSort = 4;

    public static function form(Form $form): Form
    {
        return $form->schema([
            Forms\Components\Select::make('user_id')->relationship('user', 'name')->label('Пользователь')->disabled(),
            Forms\Components\Select::make('template_id')->relationship('template', 'title')->label('Шаблон')->disabled(),
            Forms\Components\TextInput::make('method')->label('Метод')->disabled(),
            Forms\Components\TextInput::make('host')->label('Хост')->disabled(),
            Forms\Components\TextInput::make('remote_path')->label('Путь')->disabled(),
            Forms\Components\Select::make('status')->label('Статус')
                ->options(['pending' => 'В очереди', 'deploying' => 'Установка', 'completed' => 'Готово', 'failed' => 'Ошибка']),
            Forms\Components\Textarea::make('log')->label('Лог')->rows(6)->disabled(),
            Forms\Components\Textarea::make('error')->label('Ошибка')->rows(2)->disabled(),
        ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\TextColumn::make('user.name')->label('Пользователь')->searchable(),
                Tables\Columns\TextColumn::make('template.title')->label('Шаблон')->limit(25),
                Tables\Columns\TextColumn::make('method')->label('Метод')->badge(),
                Tables\Columns\TextColumn::make('host')->label('Хост'),
                Tables\Columns\BadgeColumn::make('status')->label('Статус')
                    ->colors(['warning' => 'pending', 'info' => 'deploying', 'success' => 'completed', 'danger' => 'failed']),
                Tables\Columns\TextColumn::make('created_at')->label('Дата')->dateTime('d.m.Y H:i')->sortable(),
            ])
            ->defaultSort('created_at', 'desc')
            ->filters([
                Tables\Filters\SelectFilter::make('status')
                    ->options(['pending' => 'В очереди', 'completed' => 'Готово', 'failed' => 'Ошибка']),
            ])
            ->actions([Tables\Actions\ViewAction::make()]);
    }

    public static function getPages(): array
    {
        return [
            'index' => Pages\ListDeployments::route('/'),
            'edit' => Pages\EditDeployment::route('/{record}/edit'),
        ];
    }

    public static function canCreate(): bool { return false; }
}
