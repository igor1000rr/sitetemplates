<?php

namespace App\Filament\Resources\OrderResource\Pages;

use App\Filament\Resources\OrderResource;
use App\Models\Order;
use Filament\Actions;
use Filament\Resources\Pages\ListRecords;
use Illuminate\Support\Facades\Response;

class ListOrders extends ListRecords
{
    protected static string $resource = OrderResource::class;

    protected function getHeaderActions(): array
    {
        return [
            Actions\Action::make('export')
                ->label('Экспорт CSV')
                ->icon('heroicon-o-arrow-down-tray')
                ->color('gray')
                ->action(function () {
                    $orders = Order::with(['user', 'items.template'])
                        ->where('status', 'paid')
                        ->orderByDesc('created_at')
                        ->limit(1000)
                        ->get();

                    $csv = "Номер;Покупатель;Email;Сумма (₽);Статус;Шаблоны;Дата\n";
                    foreach ($orders as $o) {
                        $templates = $o->items->map(fn ($i) => $i->template?->title)->filter()->join(', ');
                        $csv .= implode(';', [
                            $o->order_number,
                            $o->user?->name ?? '',
                            $o->user?->email ?? '',
                            number_format($o->total / 100, 0, '.', ''),
                            $o->status,
                            '"' . str_replace('"', '""', $templates) . '"',
                            $o->created_at->format('d.m.Y H:i'),
                        ]) . "\n";
                    }

                    return Response::streamDownload(function () use ($csv) {
                        echo "\xEF\xBB\xBF" . $csv; // BOM для Excel
                    }, 'orders-' . now()->format('Y-m-d') . '.csv', [
                        'Content-Type' => 'text/csv; charset=utf-8',
                    ]);
                }),
        ];
    }
}
