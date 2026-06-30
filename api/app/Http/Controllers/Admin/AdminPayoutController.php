<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Payout;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminPayoutController extends Controller
{
    /**
     * GET /api/admin/payouts
     */
    public function index(Request $request): JsonResponse
    {
        $query = Payout::with('author:id,name,email')
            ->orderByDesc('created_at');

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        $payouts = $query->paginate(20);

        return response()->json([
            'data' => $payouts->map(fn ($p) => [
                'id' => $p->id,
                'author' => [
                    'id' => $p->author->id,
                    'name' => $p->author->name,
                    'email' => $p->author->email,
                ],
                'amount_rub' => $p->amount / 100,
                'method' => $p->method,
                'details' => $p->details,
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
            'pending_count' => Payout::pending()->count(),
            'pending_total_rub' => Payout::pending()->sum('amount') / 100,
        ]);
    }

    /**
     * PUT /api/admin/payouts/{payout} — обновить статус
     */
    public function update(Request $request, Payout $payout): JsonResponse
    {
        $data = $request->validate([
            'status' => 'required|in:processing,completed,rejected',
            'admin_note' => 'nullable|string|max:500',
        ]);

        // completed/rejected — терминальные статусы. Из них переход запрещён,
        // иначе rejected→processing→rejected повторно возвращал бы деньги автору.
        if (in_array($payout->status, ['completed', 'rejected'], true)) {
            return response()->json([
                'message' => 'Заявка уже в финальном статусе и не может быть изменена.',
            ], 422);
        }

        \Illuminate\Support\Facades\DB::transaction(function () use ($payout, $data) {
            $locked = Payout::whereKey($payout->id)->lockForUpdate()->first();
            if (in_array($locked->status, ['completed', 'rejected'], true)) {
                return;
            }

            // Возвращаем деньги на баланс автора только при первом переходе в rejected
            if ($data['status'] === 'rejected') {
                $profile = $locked->author->authorProfile;
                if ($profile) {
                    $profile->increment('balance', $locked->amount);
                }
            }

            $locked->update([
                'status' => $data['status'],
                'admin_note' => $data['admin_note'] ?? $locked->admin_note,
                'completed_at' => $data['status'] === 'completed' ? now() : $locked->completed_at,
            ]);
        });

        return response()->json(['message' => 'Статус обновлён', 'status' => $payout->fresh()->status]);
    }
}
