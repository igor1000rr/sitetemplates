<?php

namespace App\Http\Controllers\Author;

use App\Http\Controllers\Controller;
use App\Models\Payout;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AuthorPayoutController extends Controller
{
    /**
     * GET /api/author/payouts — история выводов
     */
    public function index(Request $request): JsonResponse
    {
        $payouts = Payout::where('author_id', $request->user()->id)
            ->orderByDesc('created_at')
            ->paginate(20);

        return response()->json([
            'data' => $payouts->map(fn ($p) => [
                'id' => $p->id,
                'amount_rub' => $p->amount / 100,
                'method' => $p->method,
                'details' => '****' . substr($p->details, -4),
                'status' => $p->status,
                'admin_note' => $p->admin_note,
                'completed_at' => $p->completed_at?->format('d.m.Y H:i'),
                'created_at' => $p->created_at->format('d.m.Y H:i'),
            ]),
            'meta' => [
                'current_page' => $payouts->currentPage(),
                'last_page' => $payouts->lastPage(),
                'total' => $payouts->total(),
            ],
        ]);
    }

    /**
     * POST /api/author/payouts — создать заявку на вывод
     */
    public function store(Request $request): JsonResponse
    {
        $user = $request->user();
        $profile = $user->authorProfile;

        $data = $request->validate([
            'amount' => 'required|integer|min:100000', // мин 1000₽
        ]);

        // Проверяем баланс
        if ($profile->balance < $data['amount']) {
            return response()->json([
                'message' => 'Недостаточно средств. Баланс: ' . ($profile->balance / 100) . ' ₽',
            ], 422);
        }

        // Проверяем есть ли реквизиты
        if (empty($profile->payout_details)) {
            return response()->json([
                'message' => 'Укажите реквизиты для вывода в настройках профиля',
            ], 422);
        }

        // Проверяем нет ли уже pending заявки
        $pendingExists = Payout::where('author_id', $user->id)->pending()->exists();
        if ($pendingExists) {
            return response()->json([
                'message' => 'У вас уже есть активная заявка на вывод. Дождитесь её обработки.',
            ], 422);
        }

        // Списываем с баланса
        $profile->debitPayout($data['amount']);

        $payout = Payout::create([
            'author_id' => $user->id,
            'amount' => $data['amount'],
            'method' => $profile->payout_method,
            'details' => $profile->payout_details,
            'status' => 'pending',
        ]);

        return response()->json([
            'message' => 'Заявка на вывод создана. Обычно обработка занимает 1-3 рабочих дня.',
            'payout' => [
                'id' => $payout->id,
                'amount_rub' => $payout->amount / 100,
                'method' => $payout->method,
                'status' => $payout->status,
            ],
        ], 201);
    }
}
