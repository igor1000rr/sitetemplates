<?php

namespace App\Filament\Widgets;

use App\Models\Template;
use Filament\Tables;
use Filament\Tables\Table;
use Filament\Widgets\TableWidget as BaseWidget;

class TopTemplates extends BaseWidget
{
    protected static ?string $heading = 'Топ шаблонов по продажам';
    protected static ?int $sort = 5;
    protected int|string|array $columnSpan = 1;

    public function table(Table $table): Table
    {
        return $table
            ->query(
                Template::query()
                    ->where('sales_count', '>', 0)
                    ->with(['category', 'platform'])
                    ->orderByDesc('sales_count')
                    ->limit(8)
            )
            ->columns([
                Tables\Columns\TextColumn::make('title')
                    ->label('Шаблон')
                    ->limit(25)
                    ->weight('bold')
                    ->description(fn ($record) => $record->category?->name),
                Tables\Columns\TextColumn::make('sales_count')
                    ->label('Продаж')
                    ->alignCenter()
                    ->color('success')
                    ->weight('bold'),
                Tables\Columns\TextColumn::make('price')
                    ->label('Цена')
                    ->formatStateUsing(fn ($state) => number_format($state / 100, 0, '.', ' ') . ' ₽')
                    ->color('gray'),
                Tables\Columns\TextColumn::make('rating')
                    ->label('★')
                    ->formatStateUsing(fn ($state) => $state > 0 ? number_format($state, 1) : '—')
                    ->color('warning'),
            ])
            ->paginated(false);
    }
}
