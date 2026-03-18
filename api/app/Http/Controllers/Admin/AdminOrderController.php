<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Resources\OrderResource;
use App\Models\Order;
use Illuminate\Http\Request;

class AdminOrderController extends Controller
{
    public function index(Request $request)
    {
        $query = Order::with(['user:id,name,email', 'items.template:id,title,slug']);

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('order_number', 'ilike', "%{$search}%")
                  ->orWhereHas('user', fn ($u) => $u->where('email', 'ilike', "%{$search}%")->orWhere('name', 'ilike', "%{$search}%"));
            });
        }

        return OrderResource::collection(
            $query->orderBy('created_at', 'desc')->paginate(20)
        );
    }

    public function show(Order $order)
    {
        return new OrderResource(
            $order->load(['user', 'items.template.mainImage', 'promoCode', 'downloads'])
        );
    }

    public function update(Request $request, Order $order)
    {
        $data = $request->validate([
            'status' => 'required|in:pending,processing,paid,cancelled,refunded',
        ]);

        $order->update($data);

        if ($data['status'] === 'paid' && !$order->paid_at) {
            $order->update(['paid_at' => now()]);
            foreach ($order->items as $item) {
                $item->template()->increment('sales_count');
            }
        }

        return new OrderResource($order->fresh(['user', 'items.template']));
    }
}
