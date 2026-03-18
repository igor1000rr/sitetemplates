<?php

namespace App\Http\Controllers;

use App\Models\Download;
use App\Models\Order;
use App\Models\Subscription;
use App\Models\Template;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class DownloadController extends Controller
{
    /**
     * GET /api/download/{order}/{template}
     * Скачать ZIP шаблона (по заказу)
     */
    public function download(Request $request, Order $order, Template $template)
    {
        $user = $request->user();

        // Проверяем: заказ принадлежит пользователю
        if ($order->user_id !== $user->id) {
            abort(403, 'Доступ запрещён');
        }

        // Проверяем: заказ оплачен
        if (!$order->isPaid()) {
            abort(403, 'Заказ не оплачен');
        }

        // Проверяем: шаблон есть в заказе
        $hasTemplate = $order->items()->where('template_id', $template->id)->exists();
        if (!$hasTemplate) {
            abort(404, 'Шаблон не найден в заказе');
        }

        return $this->generateDownload($request, $template);
    }

    /**
     * GET /api/download/subscription/{template}
     * Скачать ZIP шаблона (по подписке)
     */
    public function downloadBySubscription(Request $request, Template $template): JsonResponse
    {
        $user = $request->user();

        // Проверяем активную подписку
        $sub = Subscription::where('user_id', $user->id)->active()->first();

        if (!$sub) {
            return response()->json(['message' => 'Нет активной подписки'], 403);
        }

        if (!$sub->canDownload()) {
            return response()->json([
                'message' => 'Достигнут лимит скачиваний в этом месяце',
                'downloads_used' => $sub->downloads_used,
                'downloads_limit' => $sub->plan->downloads_per_month,
            ], 429);
        }

        // Записываем использование
        $sub->recordDownload();

        return $this->generateDownload($request, $template);
    }

    /**
     * GET /api/download/check/{template}
     * Проверить доступ к шаблону (покупка или подписка)
     */
    public function checkAccess(Request $request, Template $template): JsonResponse
    {
        $user = $request->user();

        // 1. Куплен через заказ?
        $purchased = $user->orders()
            ->where('status', 'paid')
            ->whereHas('items', fn ($q) => $q->where('template_id', $template->id))
            ->exists();

        // 2. Есть активная подписка?
        $hasSubscription = $user->hasActiveSubscription();

        return response()->json([
            'has_access' => $purchased || $hasSubscription,
            'purchased' => $purchased,
            'has_subscription' => $hasSubscription,
        ]);
    }

    // ─── Private ───

    private function generateDownload(Request $request, Template $template): JsonResponse
    {
        if (!$template->zip_path) {
            return response()->json(['message' => 'Файл не найден'], 404);
        }

        // Логируем скачивание
        Download::create([
            'order_id' => null,
            'user_id' => $request->user()->id,
            'template_id' => $template->id,
            'ip' => $request->ip(),
        ]);

        // Инкрементим счётчик скачиваний
        $template->increment('downloads_count');

        // Генерируем signed URL (5 минут)
        $url = Storage::disk('s3')->temporaryUrl($template->zip_path, now()->addMinutes(5));

        return response()->json(['download_url' => $url]);
    }
}
