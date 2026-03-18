<?php

namespace App\Http\Controllers;

use App\Models\Notification;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class NotificationController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $notifications = Notification::where('user_id', $request->user()->id)
            ->orderByDesc('created_at')
            ->limit(30)
            ->get();

        return response()->json(['data' => $notifications]);
    }

    public function unreadCount(Request $request): JsonResponse
    {
        $count = Notification::where('user_id', $request->user()->id)
            ->unread()
            ->count();

        return response()->json(['count' => $count]);
    }

    public function markRead(Request $request): JsonResponse
    {
        $request->validate([
            'ids' => 'sometimes|array',
            'ids.*' => 'integer',
        ]);

        $query = Notification::where('user_id', $request->user()->id)->unread();

        if ($request->has('ids')) {
            $query->whereIn('id', $request->ids);
        }

        $query->update(['read_at' => now()]);

        return response()->json(['message' => 'ok']);
    }
}
