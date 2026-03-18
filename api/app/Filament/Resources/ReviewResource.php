<?php

namespace App\Filament\Resources;

use App\Filament\Resources\ReviewResource\Pages;
use App\Models\Review;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;

class ReviewResource extends Resource
{
    protected static ?string $model = Review::class;
    protected static ?string $navigationIcon = 'heroicon-o-chat-bubble-left-ellipsis';
    protected static ?string $navigationGroup = 'Каталог';
    protected static ?string $modelLabel = 'Отзыв';
    protected static ?string $pluralModelLabel = 'Отзывы';
    protected static ?int $navigationSort = 3;

    public static function form(Form $form): Form
    {
        return $form->schema([
            Forms\Components\Select::make('user_id')->relationship('user', 'name')->label('Пользователь')->disabled(),
            Forms\Components\Select::make('template_id')->relationship('template', 'title')->label('Шаблон')->disabled(),
            Forms\Components\TextInput::make('rating')->label('Оценка')->disabled(),
            Forms\Components\Textarea::make('text')->label('Текст')->rows(4),
            Forms\Components\Select::make('status')->label('Статус')
                ->options(['pending' => 'На модерации', 'approved' => 'Одобрен', 'rejected' => 'Отклонён']),
        ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\TextColumn::make('user.name')->label('Автор')->searchable(),
                Tables\Columns\TextColumn::make('template.title')->label('Шаблон')->searchable()->limit(30),
                Tables\Columns\TextColumn::make('rating')->label('★')->sortable(),
                Tables\Columns\TextColumn::make('text')->label('Текст')->limit(50),
                Tables\Columns\BadgeColumn::make('status')->label('Статус')
                    ->colors(['warning' => 'pending', 'success' => 'approved', 'danger' => 'rejected']),
                Tables\Columns\TextColumn::make('created_at')->label('Дата')->dateTime('d.m.Y')->sortable(),
            ])
            ->defaultSort('created_at', 'desc')
            ->filters([
                Tables\Filters\SelectFilter::make('status')
                    ->options(['pending' => 'На модерации', 'approved' => 'Одобрен', 'rejected' => 'Отклонён']),
            ])
            ->actions([Tables\Actions\EditAction::make()]);
    }

    public static function getPages(): array
    {
        return [
            'index' => Pages\ListReviews::route('/'),
            'edit' => Pages\EditReview::route('/{record}/edit'),
        ];
    }

    public static function canCreate(): bool { return false; }
}
