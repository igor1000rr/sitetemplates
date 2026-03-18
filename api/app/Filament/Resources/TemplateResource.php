<?php

namespace App\Filament\Resources;

use App\Filament\Resources\TemplateResource\Pages;
use App\Models\Template;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;

class TemplateResource extends Resource
{
    protected static ?string $model = Template::class;
    protected static ?string $navigationIcon = 'heroicon-o-squares-2x2';
    protected static ?string $navigationGroup = 'Каталог';
    protected static ?string $modelLabel = 'Шаблон';
    protected static ?string $pluralModelLabel = 'Шаблоны';
    protected static ?int $navigationSort = 1;

    public static function form(Form $form): Form
    {
        return $form->schema([
            Forms\Components\Section::make('Основное')->schema([
                Forms\Components\TextInput::make('title')->label('Название')->required()->maxLength(255),
                Forms\Components\TextInput::make('slug')->label('Slug')->required()->unique(ignoreRecord: true),
                Forms\Components\Select::make('category_id')->label('Категория')
                    ->relationship('category', 'name')->searchable()->preload(),
                Forms\Components\Select::make('platform_id')->label('Платформа')
                    ->relationship('platform', 'name')->searchable()->preload(),
                Forms\Components\Select::make('author_id')->label('Автор')
                    ->relationship('author', 'name')->searchable()->nullable(),
                Forms\Components\Textarea::make('description')->label('Описание')->rows(3),
                Forms\Components\RichEditor::make('features')->label('Особенности'),
            ])->columns(2),

            Forms\Components\Section::make('Цены и файлы')->schema([
                Forms\Components\TextInput::make('price')->label('Цена (коп.)')->numeric()->required(),
                Forms\Components\TextInput::make('old_price')->label('Старая цена (коп.)')->numeric()->nullable(),
                Forms\Components\TextInput::make('zip_path')->label('ZIP путь (S3)'),
                Forms\Components\TextInput::make('demo_url')->label('Demo URL')->url(),
                Forms\Components\TextInput::make('preview_image')->label('Превью (URL)'),
            ])->columns(2),

            Forms\Components\Section::make('SEO')->schema([
                Forms\Components\TextInput::make('meta_title')->label('Meta Title'),
                Forms\Components\Textarea::make('meta_description')->label('Meta Description')->rows(2),
                Forms\Components\TagsInput::make('tags')->label('Теги'),
            ]),

            Forms\Components\Section::make('Статус')->schema([
                Forms\Components\Select::make('status')->label('Статус')
                    ->options(['draft' => 'Черновик', 'published' => 'Опубликован', 'archived' => 'Архив'])
                    ->default('draft'),
                Forms\Components\Toggle::make('is_featured')->label('Рекомендуемый'),
            ])->columns(2),
        ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\ImageColumn::make('preview_image')->label('')->size(40)->circular(),
                Tables\Columns\TextColumn::make('title')->label('Название')->searchable()->sortable(),
                Tables\Columns\TextColumn::make('category.name')->label('Категория')->sortable(),
                Tables\Columns\TextColumn::make('platform.name')->label('Платформа')->sortable(),
                Tables\Columns\TextColumn::make('price')->label('Цена')
                    ->formatStateUsing(fn ($state) => number_format($state / 100, 0, '.', ' ') . ' ₽')->sortable(),
                Tables\Columns\TextColumn::make('sales_count')->label('Продаж')->sortable(),
                Tables\Columns\BadgeColumn::make('status')->label('Статус')
                    ->colors(['warning' => 'draft', 'success' => 'published', 'gray' => 'archived']),
                Tables\Columns\IconColumn::make('is_featured')->label('★')->boolean(),
                Tables\Columns\TextColumn::make('created_at')->label('Создан')->dateTime('d.m.Y')->sortable(),
            ])
            ->defaultSort('created_at', 'desc')
            ->filters([
                Tables\Filters\SelectFilter::make('status')
                    ->options(['draft' => 'Черновик', 'published' => 'Опубликован', 'archived' => 'Архив']),
                Tables\Filters\SelectFilter::make('category_id')->relationship('category', 'name')->label('Категория'),
                Tables\Filters\SelectFilter::make('platform_id')->relationship('platform', 'name')->label('Платформа'),
            ])
            ->actions([
                Tables\Actions\EditAction::make(),
                Tables\Actions\DeleteAction::make(),
            ])
            ->bulkActions([
                Tables\Actions\BulkActionGroup::make([
                    Tables\Actions\DeleteBulkAction::make(),
                ]),
            ]);
    }

    public static function getPages(): array
    {
        return [
            'index' => Pages\ListTemplates::route('/'),
            'create' => Pages\CreateTemplate::route('/create'),
            'edit' => Pages\EditTemplate::route('/{record}/edit'),
        ];
    }
}
