<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\Template;
use App\Models\User;
use App\Models\Download;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    public function index()
    {
        $today = now()->startOfDay();
        $month = now()->startOfMonth();

        return response()->json([
            'stats' => [
                'total_revenue' => Order::where('status', 'paid')->sum('total'),
                'month_revenue' => Order::where('status', 'paid')->where('paid_at', '>=', $month)->sum('total'),
                'today_revenue' => Order::where('status', 'paid')->where('paid_at', '>=', $today)->sum('total'),
                'total_orders' => Order::where('status', 'paid')->count(),
                'month_orders' => Order::where('status', 'paid')->where('paid_at', '>=', $month)->count(),
                'today_orders' => Order::where('status', 'paid')->where('paid_at', '>=', $today)->count(),
                'total_users' => User::count(),
                'month_users' => User::where('created_at', '>=', $month)->count(),
                'total_templates' => Template::where('status', 'published')->count(),
                'total_downloads' => Download::count(),
                'pending_orders' => Order::where('status', 'pending')->count(),
                'pending_reviews' => \App\Models\Review::where('status', 'pending')->count(),
            ],
            'recent_orders' => Order::with('user:id,name,email', 'items.template:id,title,slug')
                ->orderBy('created_at', 'desc')
                ->limit(10)
                ->get()
                ->map(fn ($o) => [
                    'id' => $o->id,
                    'order_number' => $o->order_number,
                    'status' => $o->status,
                    'total' => $o->total,
                    'total_rub' => $o->total / 100,
                    'user' => $o->user?->name ?? $o->user?->email,
                    'items_count' => $o->items->count(),
                    'created_at' => $o->created_at->format('d.m.Y H:i'),
                ]),
            'top_templates' => Template::where('status', 'published')
                ->orderBy('sales_count', 'desc')
                ->limit(5)
                ->get(['id', 'title', 'slug', 'sales_count', 'views_count', 'rating', 'price']),
        ]);
    }
}
