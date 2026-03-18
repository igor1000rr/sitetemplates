<?php

namespace App\Filament\Resources;

use App\Models\Service;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;

class ServiceResource extends Resource
{
    protected static ?string $model = Service::class;
    protected static ?string $navigationIcon = 'heroicon-o-wrench-screwdriver';
    protected static ?string $navigationLabel = 'Услуги';
    protected static ?string $navigationGroup = 'Каталог';
    protected static ?int $navigationSort = 15;

    public static function form(Form $form): Form
    {
        return $form->schema([
            Forms\Components\TextInput::make('name')->required()->maxLength(255)->label('Название'),
            Forms\Components\TextInput::make('slug')->required()->maxLength(255)->unique(ignoreRecord: true)->label('Slug'),
            Forms\Components\Textarea::make('short_description')->maxLength(500)->label('Краткое описание'),
            Forms\Components\RichEditor::make('description')->label('Полное описание'),
            Forms\Components\TextInput::make('price')->required()->numeric()->label('Цена (копейки)')
                ->helperText('Например: 299900 = 2 999 ₽'),
            Forms\Components\TextInput::make('icon')->maxLength(100)->label('Иконка (lucide)')
                ->placeholder('monitor-cog'),
            Forms\Components\Select::make('category')->options([
                'installation' => 'Установка',
                'seo' => 'SEO',
                'content' => 'Контент',
                'analytics' => 'Аналитика',
                'support' => 'Поддержка',
                'other' => 'Другое',
            ])->label('Категория'),
            Forms\Components\TextInput::make('estimated_days')->numeric()->default(3)->label('Срок (дней)'),
            Forms\Components\Toggle::make('is_popular')->label('Популярное'),
            Forms\Components\Toggle::make('is_active')->default(true)->label('Активна'),
            Forms\Components\TextInput::make('sort_order')->numeric()->default(0)->label('Сортировка'),
        ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\TextColumn::make('name')->searchable()->sortable()->label('Название'),
                Tables\Columns\TextColumn::make('category')->badge()
                    ->colors([
                        'primary' => 'installation',
                        'success' => 'seo',
                        'warning' => 'content',
                        'info' => 'analytics',
                    ])->label('Категория'),
                Tables\Columns\TextColumn::make('price')
                    ->formatStateUsing(fn ($state) => number_format($state / 100, 0, '.', ' ') . ' R')
                    ->sortable()->label('Цена'),
                Tables\Columns\TextColumn::make('estimated_days')->suffix(' дн.')->label('Срок'),
                Tables\Columns\IconColumn::make('is_popular')->boolean()->label('Популярное'),
                Tables\Columns\IconColumn::make('is_active')->boolean()->label('Активна'),
                Tables\Columns\TextColumn::make('sort_order')->sortable()->label('Порядок'),
            ])
            ->defaultSort('sort_order')
            ->actions([Tables\Actions\EditAction::make()])
            ->bulkActions([Tables\Actions\DeleteBulkAction::make()]);
    }

    public static function getPages(): array
    {
        return [
            'index' => ServiceResource\Pages\ListServices::route('/'),
            'create' => ServiceResource\Pages\CreateService::route('/create'),
            'edit' => ServiceResource\Pages\EditService::route('/{record}/edit'),
        ];
    }
}
