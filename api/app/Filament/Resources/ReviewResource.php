<?php

namespace App\Filament\Resources;

use App\Filament\Resources\ReviewResource\Pages;
use App\Models\Review;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;
use Filament\Notifications\Notification;

class ReviewResource extends Resource
{
    protected static ?string $model = Review::class;
    protected static ?string $navigationIcon = 'heroicon-o-chat-bubble-left-ellipsis';
    protected static ?string $navigationGroup = 'Каталог';
    protected static ?string $modelLabel = 'Отзыв';
    protected static ?string $pluralModelLabel = 'Отзывы';
    protected static ?int $navigationSort = 3;

    public static function getNavigationBadge(): ?string
    {
        return (string) Review::where('status', 'pending')->count() ?: null;
    }

    public static function getNavigationBadgeColor(): string|array|null
    {
        return 'danger';
    }

    public static function getGloballySearchableAttributes(): array
    {
        return ['text', 'user.name', 'template.title'];
    }

    public static function form(Form $form): Form
    {
        return $form->schema([
            Forms\Components\Section::make('Отзыв')->schema([
                Forms\Components\Select::make('user_id')->relationship('user', 'name')->label('Автор')->disabled(),
                Forms\Components\Select::make('template_id')->relationship('template', 'title')->label('Шаблон')->disabled(),
                Forms\Components\TextInput::make('rating')->label('Оценка')->disabled(),
                Forms\Components\Select::make('status')->label('Статус')
                    ->options(['pending' => 'На модерации', 'approved' => 'Одобрен', 'rejected' => 'Отклонён']),
            ])->columns(2),
            Forms\Components\Section::make('Текст')->schema([
                Forms\Components\Textarea::make('text')->label('Текст отзыва')->rows(4),
            ]),
        ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\TextColumn::make('user.name')->label('Автор')->searchable()->sortable(),
                Tables\Columns\TextColumn::make('template.title')->label('Шаблон')->searchable()->limit(25)
                    ->url(fn ($record) => $record->template ? "/panel/templates/{$record->template->id}/edit" : null),
                Tables\Columns\TextColumn::make('rating')->label('★')
                    ->formatStateUsing(fn ($state) => str_repeat('★', $state) . str_repeat('☆', 5 - $state))
                    ->color('warning')
                    ->sortable(),
                Tables\Columns\TextColumn::make('text')->label('Текст')->limit(60)->wrap(),
                Tables\Columns\BadgeColumn::make('status')->label('Статус')
                    ->colors(['warning' => 'pending', 'success' => 'approved', 'danger' => 'rejected']),
                Tables\Columns\TextColumn::make('created_at')->label('Дата')->dateTime('d.m.Y H:i')->sortable(),
            ])
            ->defaultSort('created_at', 'desc')
            ->filters([
                Tables\Filters\SelectFilter::make('status')
                    ->options(['pending' => 'На модерации', 'approved' => 'Одобрен', 'rejected' => 'Отклонён'])
                    ->default('pending'),
                Tables\Filters\SelectFilter::make('rating')
                    ->options([1 => '★', 2 => '★★', 3 => '★★★', 4 => '★★★★', 5 => '★★★★★']),
            ])
            ->actions([
                Tables\Actions\Action::make('approve')
                    ->label('Одобрить')
                    ->icon('heroicon-o-check-circle')
                    ->color('success')
                    ->requiresConfirmation()
                    ->visible(fn ($record) => $record->status !== 'approved')
                    ->action(function ($record) {
                        $record->update(['status' => 'approved']);
                        $record->template?->recalculateRating();
                        Notification::make()->title('Отзыв одобрен')->success()->send();
                    }),
                Tables\Actions\Action::make('reject')
                    ->label('Отклонить')
                    ->icon('heroicon-o-x-circle')
                    ->color('danger')
                    ->requiresConfirmation()
                    ->visible(fn ($record) => $record->status !== 'rejected')
                    ->action(function ($record) {
                        $record->update(['status' => 'rejected']);
                        $record->template?->recalculateRating();
                        Notification::make()->title('Отзыв отклонён')->warning()->send();
                    }),
                Tables\Actions\EditAction::make(),
            ])
            ->bulkActions([
                Tables\Actions\BulkAction::make('approveAll')
                    ->label('Одобрить выбранные')
                    ->icon('heroicon-o-check-circle')
                    ->color('success')
                    ->requiresConfirmation()
                    ->action(function ($records) {
                        $records->each(function ($r) {
                            $r->update(['status' => 'approved']);
                            $r->template?->recalculateRating();
                        });
                        Notification::make()->title("Одобрено: {$records->count()}")->success()->send();
                    }),
                Tables\Actions\DeleteBulkAction::make(),
            ]);
    }

    public static function getPages(): array
    {
        return [
            'index' => Pages\ListReviews::route('/'),
            'edit' => Pages\EditReview::route('/{record}/edit'),
        ];
    }
}
