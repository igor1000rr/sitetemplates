<?php

namespace App\Filament\Resources;

use App\Filament\Resources\TemplateResource\Pages;
use App\Models\Template;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Notifications\Notification;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;
use Illuminate\Support\Str;

class TemplateResource extends Resource
{
    protected static ?string $model = Template::class;
    protected static ?string $navigationIcon = 'heroicon-o-squares-2x2';
    protected static ?string $navigationGroup = 'Каталог';
    protected static ?string $modelLabel = 'Шаблон';
    protected static ?string $pluralModelLabel = 'Шаблоны';
    protected static ?int $navigationSort = 1;

    public static function getNavigationBadge(): ?string
    {
        return (string) Template::count();
    }

    public static function getGloballySearchableAttributes(): array
    {
        return ['title', 'slug', 'description', 'tags'];
    }

    public static function form(Form $form): Form
    {
        return $form->schema([
            Forms\Components\Group::make()->schema([
                Forms\Components\Section::make('Основное')->schema([
                    Forms\Components\TextInput::make('title')
                        ->label('Название')
                        ->required()
                        ->maxLength(255)
                        ->live(onBlur: true)
                        ->afterStateUpdated(function ($state, $set, $get) {
                            if (!$get('slug') || Str::slug($get('title_old') ?? '') === $get('slug')) {
                                $set('slug', Str::slug($state));
                            }
                        }),
                    Forms\Components\TextInput::make('slug')
                        ->label('Slug')
                        ->required()
                        ->unique(ignoreRecord: true)
                        ->helperText('URL-адрес шаблона'),
                    Forms\Components\Select::make('category_id')
                        ->label('Категория')
                        ->relationship('category', 'name')
                        ->searchable()
                        ->preload()
                        ->required(),
                    Forms\Components\Select::make('platform_id')
                        ->label('Платформа')
                        ->relationship('platform', 'name')
                        ->searchable()
                        ->preload()
                        ->required(),
                    Forms\Components\Select::make('template_type')
                        ->label('Тип')
                        ->options([
                            'landing' => 'Лендинг',
                            'multipage' => 'Многостраничный',
                            'shop' => 'Интернет-магазин',
                            'quiz' => 'Квиз',
                        ])
                        ->required(),
                    Forms\Components\Select::make('author_id')
                        ->label('Автор')
                        ->relationship('author', 'name')
                        ->searchable()
                        ->nullable(),
                ])->columns(2),

                Forms\Components\Section::make('Описание')->schema([
                    Forms\Components\Textarea::make('short_desc')
                        ->label('Краткое описание')
                        ->rows(2)
                        ->maxLength(500)
                        ->helperText('Для карточки каталога (до 500 символов)')
                        ->columnSpanFull(),
                    Forms\Components\RichEditor::make('description')
                        ->label('Полное описание')
                        ->columnSpanFull(),
                ]),

                Forms\Components\Section::make('SEO')->schema([
                    Forms\Components\TextInput::make('meta_title')
                        ->label('Meta Title')
                        ->maxLength(70)
                        ->helperText(fn ($state) => ($state ? strlen($state) : 0) . '/70 символов'),
                    Forms\Components\Textarea::make('meta_desc')
                        ->label('Meta Description')
                        ->rows(2)
                        ->maxLength(160)
                        ->helperText(fn ($state) => ($state ? strlen($state) : 0) . '/160 символов'),
                    Forms\Components\TagsInput::make('tags')->label('Теги'),
                ])->collapsible(),
            ])->columnSpan(['lg' => 2]),

            // Правая колонка
            Forms\Components\Group::make()->schema([
                Forms\Components\Section::make('Статус')->schema([
                    Forms\Components\Select::make('status')
                        ->label('Статус')
                        ->options([
                            'draft' => '📝 Черновик',
                            'published' => '✅ Опубликован',
                            'archived' => '📦 Архив',
                        ])
                        ->default('draft')
                        ->required(),
                    Forms\Components\Toggle::make('is_featured')
                        ->label('Рекомендуемый')
                        ->helperText('Показывать на главной'),
                    Forms\Components\TextInput::make('sort_order')
                        ->label('Сортировка')
                        ->numeric()
                        ->default(0),
                ]),

                Forms\Components\Section::make('Цены')->schema([
                    Forms\Components\TextInput::make('price')
                        ->label('Цена (копейки)')
                        ->numeric()
                        ->required()
                        ->prefix('₽')
                        ->helperText('Например: 499000 = 4 990 ₽'),
                    Forms\Components\TextInput::make('old_price')
                        ->label('Старая цена (копейки)')
                        ->numeric()
                        ->nullable()
                        ->prefix('₽')
                        ->helperText('Для показа скидки'),
                ]),

                Forms\Components\Section::make('Файлы')->schema([
                    Forms\Components\TextInput::make('zip_path')
                        ->label('ZIP путь (S3)')
                        ->helperText('Загрузите через S3'),
                    Forms\Components\TextInput::make('demo_url')
                        ->label('Demo URL')
                        ->url()
                        ->suffixAction(
                            Forms\Components\Actions\Action::make('openDemo')
                                ->icon('heroicon-o-arrow-top-right-on-square')
                                ->url(fn ($state) => $state, shouldOpenInNewTab: true)
                                ->visible(fn ($state) => filled($state))
                        ),
                    Forms\Components\TextInput::make('version')
                        ->label('Версия')
                        ->default('1.0.0'),
                ]),

                Forms\Components\Section::make('Фичи')->schema([
                    Forms\Components\TagsInput::make('features')
                        ->label('Включено в шаблон')
                        ->helperText('Напр: Адаптивный, WooCommerce, SEO'),
                ])->collapsible(),

                Forms\Components\Section::make('Тех. требования')->schema([
                    Forms\Components\KeyValue::make('tech_specs')
                        ->label('')
                        ->keyLabel('Параметр')
                        ->valueLabel('Значение')
                        ->addButtonLabel('Добавить')
                        ->helperText('PHP, MySQL, WordPress и т.д.'),
                ])->collapsible()->collapsed(),
            ])->columnSpan(['lg' => 1]),
        ])->columns(3);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\ImageColumn::make('mainImage.path')
                    ->label('')
                    ->size(50)
                    ->rounded(),
                Tables\Columns\TextColumn::make('title')
                    ->label('Название')
                    ->searchable()
                    ->sortable()
                    ->description(fn ($record) => $record->slug)
                    ->weight('bold'),
                Tables\Columns\TextColumn::make('category.name')
                    ->label('Категория')
                    ->sortable()
                    ->badge()
                    ->color('info'),
                Tables\Columns\TextColumn::make('platform.name')
                    ->label('Платформа')
                    ->badge()
                    ->color('gray'),
                Tables\Columns\TextColumn::make('price')
                    ->label('Цена')
                    ->formatStateUsing(fn ($state) => number_format($state / 100, 0, '.', ' ') . ' ₽')
                    ->sortable()
                    ->color('success')
                    ->weight('bold'),
                Tables\Columns\TextColumn::make('old_price')
                    ->label('Старая')
                    ->formatStateUsing(fn ($state) => $state ? number_format($state / 100, 0, '.', ' ') . ' ₽' : '—')
                    ->color('gray')
                    ->size('xs'),
                Tables\Columns\TextColumn::make('sales_count')
                    ->label('Продаж')
                    ->sortable()
                    ->alignCenter(),
                Tables\Columns\TextColumn::make('views_count')
                    ->label('Просм.')
                    ->sortable()
                    ->alignCenter()
                    ->color('gray'),
                Tables\Columns\TextColumn::make('rating')
                    ->label('★')
                    ->formatStateUsing(fn ($state) => $state > 0 ? number_format($state, 1) : '—')
                    ->sortable()
                    ->alignCenter(),
                Tables\Columns\BadgeColumn::make('status')
                    ->label('Статус')
                    ->colors([
                        'warning' => 'draft',
                        'success' => 'published',
                        'gray' => 'archived',
                    ]),
                Tables\Columns\IconColumn::make('is_featured')
                    ->label('★')
                    ->boolean()
                    ->trueIcon('heroicon-s-star')
                    ->falseIcon('heroicon-o-star')
                    ->trueColor('warning'),
            ])
            ->defaultSort('created_at', 'desc')
            ->filters([
                Tables\Filters\SelectFilter::make('status')
                    ->options([
                        'draft' => 'Черновик',
                        'published' => 'Опубликован',
                        'archived' => 'Архив',
                    ]),
                Tables\Filters\SelectFilter::make('category_id')
                    ->relationship('category', 'name')
                    ->label('Категория')
                    ->searchable()
                    ->preload(),
                Tables\Filters\SelectFilter::make('platform_id')
                    ->relationship('platform', 'name')
                    ->label('Платформа')
                    ->preload(),
                Tables\Filters\TernaryFilter::make('is_featured')
                    ->label('Рекомендуемый'),
            ])
            ->actions([
                Tables\Actions\Action::make('publish')
                    ->label('Опубликовать')
                    ->icon('heroicon-o-check-circle')
                    ->color('success')
                    ->visible(fn ($record) => $record->status !== 'published')
                    ->requiresConfirmation()
                    ->action(function ($record) {
                        $record->update(['status' => 'published', 'published_at' => now()]);
                        Notification::make()->title('Шаблон опубликован')->success()->send();
                    }),
                Tables\Actions\Action::make('preview')
                    ->label('Превью')
                    ->icon('heroicon-o-eye')
                    ->color('gray')
                    ->url(fn ($record) => "https://aitempl.ru/templates/{$record->slug}", shouldOpenInNewTab: true)
                    ->visible(fn ($record) => $record->status === 'published'),
                Tables\Actions\EditAction::make(),
                Tables\Actions\DeleteAction::make(),
            ])
            ->bulkActions([
                Tables\Actions\BulkAction::make('publishAll')
                    ->label('Опубликовать')
                    ->icon('heroicon-o-check-circle')
                    ->color('success')
                    ->requiresConfirmation()
                    ->action(fn ($records) => $records->each(fn ($r) => $r->update(['status' => 'published', 'published_at' => now()]))),
                Tables\Actions\BulkAction::make('archiveAll')
                    ->label('В архив')
                    ->icon('heroicon-o-archive-box')
                    ->color('gray')
                    ->requiresConfirmation()
                    ->action(fn ($records) => $records->each(fn ($r) => $r->update(['status' => 'archived']))),
                Tables\Actions\DeleteBulkAction::make(),
            ])
            ->striped()
            ->paginated([10, 25, 50]);
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
