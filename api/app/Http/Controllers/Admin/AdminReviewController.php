<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Review;
use Illuminate\Http\Request;

class AdminReviewController extends Controller
{
    public function index(Request $request)
    {
        $query = Review::with(['user:id,name,email', 'template:id,title,slug']);

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        } else {
            $query->where('status', 'pending');
        }

        return $query->orderBy('created_at', 'desc')->paginate(20);
    }

    public function update(Request $request, Review $review)
    {
        $data = $request->validate([
            'status' => 'required|in:approved,rejected',
        ]);

        $review->update($data);

        // Пересчитать рейтинг шаблона
        if ($data['status'] === 'approved') {
            $review->template->recalculateRating();
        }

        return response()->json($review->load(['user:id,name', 'template:id,title']));
    }
}
