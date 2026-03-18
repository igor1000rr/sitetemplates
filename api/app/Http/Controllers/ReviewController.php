<?php

namespace App\Http\Controllers;

use App\Models\Review;
use App\Models\Template;
use Illuminate\Http\Request;

class ReviewController extends Controller
{
    /**
     * Global reviews list (for homepage, etc.)
     */
    public function all(Request $request)
    {
        $query = Review::where('status', 'approved')
            ->with(['user:id,name', 'template:id,title']);

        if ($request->sort === 'best') {
            $query->where('rating', '>=', 4)->orderByDesc('rating')->orderByDesc('created_at');
        } else {
            $query->orderByDesc('created_at');
        }

        return $query->paginate($request->integer('per_page', 10))
            ->through(fn ($r) => [
                'id' => $r->id,
                'name' => $r->user?->name ?? 'Пользователь',
                'text' => $r->text,
                'rating' => $r->rating,
                'template_title' => $r->template?->title,
                'created_at' => $r->created_at,
            ]);
    }

    public function index(Template $template)
    {
        return $template->approvedReviews()
            ->with('user:id,name,avatar')
            ->orderBy('created_at', 'desc')
            ->paginate(10);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'template_id' => 'required|exists:templates,id',
            'rating' => 'required|integer|between:1,5',
            'text' => 'required|string|min:10|max:2000',
        ]);

        // Проверяем: пользователь купил этот шаблон
        $hasPurchased = $request->user()->orders()
            ->where('status', 'paid')
            ->whereHas('items', fn ($q) => $q->where('template_id', $data['template_id']))
            ->exists();

        if (!$hasPurchased) {
            return response()->json(['message' => 'Оставить отзыв можно только после покупки'], 403);
        }

        $review = Review::create([
            ...$data,
            'user_id' => $request->user()->id,
            'status' => 'pending',
        ]);

        // Telegram уведомление админу
        try {
            app(\App\Services\TelegramService::class)->notifyNewReview(
                $review->load(['template', 'user'])
            );
        } catch (\Throwable $e) {}

        // Email админу о новом отзыве
        try {
            $admin = \App\Models\User::where('role', 'admin')->first();
            if ($admin) {
                $admin->notify(new \App\Notifications\NewReviewNotification($review->load(['template', 'user'])));
            }
        } catch (\Throwable $e) {}

        return response()->json($review, 201);
    }
}
