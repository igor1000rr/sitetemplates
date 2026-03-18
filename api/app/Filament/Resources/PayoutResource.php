<?php

namespace App\Filament\Resources;

use App\Filament\Resources\PayoutResource\Pages;
use App\Models\Payout;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;

class PayoutResource extends Resource
{
    protected static ?string $model = Payout::class;
    protected static ?string $navigationIcon = 'heroicon-o-banknotes';
    protected static ?string $navigationGroup = 'Продажи';
    protected static ?string $modelLabel = 'Выплата';
    protected static ?string $pluralModelLabel = 'Выплаты авторам';
    protected static ?int $navigationSort = 4;

    public static function form(Form $form): Form
    {
        return $form->schema([
            Forms\Components\Select::make('author_id')->relationship('author', 'name')->label('Автор')->disabled(),
            Forms\Components\TextInput::make('amount')->label('Сумма (коп.)')->disabled(),
            Forms\Components\Select::make('status')->label('Статус')
                ->options(['pending' => 'Ожидает', 'processing' => 'Обработка', 'completed' => 'Выплачено', 'rejected' => 'Отклонено']),
            Forms\Components\Textarea::make('admin_note')->label('Комментарий админа'),
        ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\TextColumn::make('author.name')->label('Автор')->searchable(),
                Tables\Columns\TextColumn::make('amount')->label('Сумма')
                    ->formatStateUsing(fn ($state) => number_format($state / 100, 0, '.', ' ') . ' ₽')->sortable(),
                Tables\Columns\BadgeColumn::make('status')->label('Статус')
                    ->colors(['warning' => 'pending', 'info' => 'processing', 'success' => 'completed', 'danger' => 'rejected']),
                Tables\Columns\TextColumn::make('created_at')->label('Дата')->dateTime('d.m.Y H:i')->sortable(),
            ])
            ->defaultSort('created_at', 'desc')
            ->filters([
                Tables\Filters\SelectFilter::make('status')
                    ->options(['pending' => 'Ожидает', 'completed' => 'Выплачено', 'rejected' => 'Отклонено']),
            ])
            ->actions([Tables\Actions\EditAction::make()]);
    }

    public static function getPages(): array
    {
        return [
            'index' => Pages\ListPayouts::route('/'),
            'edit' => Pages\EditPayout::route('/{record}/edit'),
        ];
    }

    public static function canCreate(): bool { return false; }
}
