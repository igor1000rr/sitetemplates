<?php

namespace App\Filament\Resources\UserResource\Pages;

use App\Filament\Resources\UserResource;
use App\Models\User;
use Filament\Actions;
use Filament\Resources\Pages\ListRecords;
use Illuminate\Support\Facades\Response;

class ListUsers extends ListRecords
{
    protected static string $resource = UserResource::class;

    protected function getHeaderActions(): array
    {
        return [
            Actions\Action::make('export')
                ->label('Экспорт CSV')
                ->icon('heroicon-o-arrow-down-tray')
                ->color('gray')
                ->action(function () {
                    $users = User::withCount('orders')
                        ->orderByDesc('created_at')
                        ->limit(5000)
                        ->get();

                    $csv = "ID;Имя;Email;Роль;Заказов;Реф. код;Дата регистрации\n";
                    foreach ($users as $u) {
                        $csv .= implode(';', [
                            $u->id,
                            '"' . str_replace('"', '""', $u->name) . '"',
                            $u->email,
                            $u->role,
                            $u->orders_count,
                            $u->referral_code ?? '',
                            $u->created_at->format('d.m.Y H:i'),
                        ]) . "\n";
                    }

                    return Response::streamDownload(function () use ($csv) {
                        echo "\xEF\xBB\xBF" . $csv;
                    }, 'users-' . now()->format('Y-m-d') . '.csv', [
                        'Content-Type' => 'text/csv; charset=utf-8',
                    ]);
                }),
        ];
    }
}
