<?php

namespace App\Http\Controllers;

use App\Models\CustomRequest;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class CustomRequestController extends Controller
{
    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|max:255',
            'phone' => 'nullable|string|max:30',
            'company' => 'nullable|string|max:255',
            'business_type' => 'nullable|string|max:100',
            'budget_range' => 'nullable|string|max:50',
            'deadline' => 'nullable|string|max:100',
            'description' => 'required|string|max:5000',
            'reference_urls' => 'nullable|string|max:2000',
            'preferred_platform' => 'nullable|string|max:50',
        ]);

        $cr = CustomRequest::create($data);

        try {
            $name = htmlspecialchars((string) $cr->name, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
            $email = htmlspecialchars((string) $cr->email, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
            $text = "🧩 <b>Новая заявка на разработку</b>\n\n👤 {$name}\n✉️ {$email}";
            app(\App\Services\TelegramService::class)->send($text);
        } catch (\Throwable $e) {
            Log::warning('Telegram custom request: ' . $e->getMessage());
        }

        return response()->json([
            'message' => 'Заявка отправлена! Мы свяжемся с вами в течение 24 часов.',
            'id' => $cr->id,
        ], 201);
    }
}
