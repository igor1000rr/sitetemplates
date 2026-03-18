<?php

namespace App\Filament\Resources;

use App\Filament\Resources\NewsletterResource\Pages;
use App\Models\NewsletterSubscriber;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;

class NewsletterResource extends Resource
{
    protected static ?string $model = NewsletterSubscriber::class;

    protected static ?string $navigationIcon = 'heroicon-o-envelope';
    protected static ?string $navigationLabel = 'Подписчики';
    protected static ?string $navigationGroup = 'Маркетинг';
    protected static ?int $navigationSort = 50;

    public static function form(Form $form): Form
    {
        return $form->schema([
            Forms\Components\TextInput::make('email')->email()->required(),
            Forms\Components\TextInput::make('source')->default('admin'),
            Forms\Components\TextInput::make('promo_code'),
            Forms\Components\DateTimePicker::make('subscribed_at')->default(now()),
            Forms\Components\DateTimePicker::make('unsubscribed_at'),
        ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\TextColumn::make('email')
                    ->searchable()
                    ->sortable(),
                Tables\Columns\TextColumn::make('source')
                    ->badge()
                    ->color(fn (string $state) => match ($state) {
                        'popup' => 'info',
                        'footer' => 'gray',
                        'admin' => 'warning',
                        default => 'gray',
                    }),
                Tables\Columns\TextColumn::make('promo_code')
                    ->copyable()
                    ->color('success'),
                Tables\Columns\TextColumn::make('subscribed_at')
                    ->dateTime('d.m.Y H:i')
                    ->sortable(),
                Tables\Columns\IconColumn::make('is_active')
                    ->boolean()
                    ->getStateUsing(fn ($record) => is_null($record->unsubscribed_at))
                    ->label('Активна'),
            ])
            ->filters([
                Tables\Filters\TernaryFilter::make('active')
                    ->label('Активные')
                    ->queries(
                        true: fn ($q) => $q->whereNull('unsubscribed_at'),
                        false: fn ($q) => $q->whereNotNull('unsubscribed_at'),
                    ),
            ])
            ->actions([
                Tables\Actions\EditAction::make(),
                Tables\Actions\DeleteAction::make(),
            ])
            ->bulkActions([
                Tables\Actions\BulkActionGroup::make([
                    Tables\Actions\DeleteBulkAction::make(),
                ]),
            ])
            ->defaultSort('subscribed_at', 'desc');
    }

    public static function getPages(): array
    {
        return [
            'index' => Pages\ListNewsletters::route('/'),
            'create' => Pages\CreateNewsletter::route('/create'),
            'edit' => Pages\EditNewsletter::route('/{record}/edit'),
        ];
    }

    public static function getNavigationBadge(): ?string
    {
        return (string) static::getModel()::whereNull('unsubscribed_at')->count();
    }
}
