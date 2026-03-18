<?php

namespace App\Http\Controllers\Author;

use App\Http\Controllers\Controller;
use App\Models\AuthorEarning;
use App\Models\Template;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class AuthorDashboardController extends Controller
{
    /**
     * GET /api/author/dashboard
     */
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();
        $profile = $user->authorProfile;

        // Статистика
        $totalTemplates = Template::where('author_id', $user->id)->count();
        $publishedTemplates = Template::where('author_id', $user->id)->published()->count();
        $pendingTemplates = Template::where('author_id', $user->id)->where('status', 'pending')->count();

        // Продажи за месяц
        $monthEarnings = AuthorEarning::where('author_id', $user->id)
            ->where('created_at', '>=', now()->startOfMonth())
            ->sum('author_amount');

        $monthSales = AuthorEarning::where('author_id', $user->id)
            ->where('created_at', '>=', now()->startOfMonth())
            ->count();

        // Продажи за сегодня
        $todayEarnings = AuthorEarning::where('author_id', $user->id)
            ->where('created_at', '>=', now()->startOfDay())
            ->sum('author_amount');

        // Последние продажи
        $recentSales = AuthorEarning::where('author_id', $user->id)
            ->with('template:id,title,slug')
            ->orderByDesc('created_at')
            ->limit(10)
            ->get()
            ->map(fn ($e) => [
                'id' => $e->id,
                'template' => $e->template?->title,
                'template_slug' => $e->template?->slug,
                'sale_amount_rub' => $e->sale_amount / 100,
                'author_amount_rub' => $e->author_amount / 100,
                'date' => $e->created_at->format('d.m.Y H:i'),
            ]);

        // Топ шаблоны
        $topTemplates = AuthorEarning::where('author_id', $user->id)
            ->select('template_id', DB::raw('COUNT(*) as sales'), DB::raw('SUM(author_amount) as total'))
            ->groupBy('template_id')
            ->with('template:id,title,slug')
            ->orderByDesc('sales')
            ->limit(5)
            ->get()
            ->map(fn ($e) => [
                'template' => $e->template?->title,
                'template_slug' => $e->template?->slug,
                'sales' => $e->sales,
                'total_rub' => $e->total / 100,
            ]);

        // Заявки на вывод
        $pendingPayouts = $user->payouts()->pending()->sum('amount');

        // Ежемесячный график (последние 6 мес)
        $monthlyChart = AuthorEarning::where('author_id', $user->id)
            ->where('created_at', '>=', now()->subMonths(6)->startOfMonth())
            ->select(
                DB::raw("TO_CHAR(created_at, 'YYYY-MM') as month"),
                DB::raw('SUM(author_amount) as total'),
                DB::raw('COUNT(*) as sales')
            )
            ->groupBy('month')
            ->orderBy('month')
            ->get()
            ->map(fn ($e) => [
                'month' => $e->month,
                'total_rub' => round($e->total / 100),
                'sales' => $e->sales,
            ]);

        // Заполняем пустые месяцы нулями
        $chartData = [];
        for ($i = 5; $i >= 0; $i--) {
            $m = now()->subMonths($i)->format('Y-m');
            $found = $monthlyChart->firstWhere('month', $m);
            $chartData[] = [
                'month' => $m,
                'label' => now()->subMonths($i)->translatedFormat('M'),
                'total_rub' => $found['total_rub'] ?? 0,
                'sales' => $found['sales'] ?? 0,
            ];
        }

        return response()->json([
            'profile' => [
                'display_name' => $profile->display_name,
                'slug' => $profile->slug,
                'avatar' => $profile->avatar,
                'commission' => $profile->commission,
                'is_verified' => $profile->is_verified,
            ],
            'stats' => [
                'balance_rub' => $profile->balance / 100,
                'total_earned_rub' => $profile->total_earned / 100,
                'total_sales' => $profile->total_sales,
                'total_templates' => $totalTemplates,
                'published_templates' => $publishedTemplates,
                'pending_templates' => $pendingTemplates,
                'month_earnings_rub' => $monthEarnings / 100,
                'month_sales' => $monthSales,
                'today_earnings_rub' => $todayEarnings / 100,
                'pending_payouts_rub' => $pendingPayouts / 100,
            ],
            'recent_sales' => $recentSales,
            'top_templates' => $topTemplates,
            'chart' => $chartData,
        ]);
    }
}
