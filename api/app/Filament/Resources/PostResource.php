<?php

namespace App\Filament\Resources;

use App\Filament\Resources\PostResource\Pages;
use App\Models\Post;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;

class PostResource extends Resource
{
    protected static ?string $model = Post::class;
    protected static ?string $navigationIcon = 'heroicon-o-document-text';
    protected static ?string $navigationGroup = 'Контент';
    protected static ?string $modelLabel = 'Статья';
    protected static ?string $pluralModelLabel = 'Блог';
    protected static ?int $navigationSort = 1;

    public static function form(Form $form): Form
    {
        return $form->schema([
            Forms\Components\Section::make('Статья')->schema([
                Forms\Components\TextInput::make('title')->label('Заголовок')->required()
                    ->live(onBlur: true)
                    ->afterStateUpdated(fn ($state, $set) => $set('slug', \Illuminate\Support\Str::slug($state))),
                Forms\Components\TextInput::make('slug')->label('Slug')->required()->unique(ignoreRecord: true),
                Forms\Components\Select::make('category_id')->label('Категория')
                    ->relationship('category', 'name')->searchable()->preload(),
                Forms\Components\Textarea::make('excerpt')->label('Анонс')->rows(2),
                Forms\Components\RichEditor::make('content')->label('Контент')->required()->columnSpanFull(),
                Forms\Components\TextInput::make('cover_image')->label('Обложка (URL)'),
                Forms\Components\TagsInput::make('tags')->label('Теги'),
            ])->columns(2),

            Forms\Components\Section::make('SEO')->schema([
                Forms\Components\TextInput::make('meta_title')->label('Meta Title'),
                Forms\Components\Textarea::make('meta_description')->label('Meta Description')->rows(2),
            ]),

            Forms\Components\Section::make('Публикация')->schema([
                Forms\Components\Select::make('status')->label('Статус')
                    ->options(['draft' => 'Черновик', 'published' => 'Опубликован'])->default('draft'),
                Forms\Components\TextInput::make('reading_time')->label('Время чтения (мин)')->numeric()->disabled(),
                Forms\Components\TextInput::make('views_count')->label('Просмотры')->numeric()->disabled(),
            ])->columns(3),
        ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\TextColumn::make('title')->label('Заголовок')->searchable()->sortable()->limit(40),
                Tables\Columns\TextColumn::make('category.name')->label('Категория')->sortable(),
                Tables\Columns\BadgeColumn::make('status')->label('Статус')
                    ->colors(['warning' => 'draft', 'success' => 'published']),
                Tables\Columns\TextColumn::make('views_count')->label('👁')->sortable(),
                Tables\Columns\TextColumn::make('reading_time')->label('⏱')->suffix(' мин'),
                Tables\Columns\TextColumn::make('published_at')->label('Опубликован')->dateTime('d.m.Y')->sortable(),
            ])
            ->defaultSort('created_at', 'desc')
            ->filters([
                Tables\Filters\SelectFilter::make('status')->options(['draft' => 'Черновик', 'published' => 'Опубликован']),
                Tables\Filters\SelectFilter::make('category_id')->relationship('category', 'name')->label('Категория'),
            ])
            ->actions([Tables\Actions\EditAction::make(), Tables\Actions\DeleteAction::make()])
            ->bulkActions([Tables\Actions\DeleteBulkAction::make()]);
    }

    public static function getPages(): array
    {
        return [
            'index' => Pages\ListPosts::route('/'),
            'create' => Pages\CreatePost::route('/create'),
            'edit' => Pages\EditPost::route('/{record}/edit'),
        ];
    }
}
