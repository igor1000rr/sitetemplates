<?php

use App\Http\Controllers\Auth\LoginController;
use App\Http\Controllers\Auth\RegisterController;
use App\Http\Controllers\Auth\ForgotPasswordController;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\DownloadController;
use App\Http\Controllers\OrderController;
use App\Http\Controllers\PaymentController;
use App\Http\Controllers\PlatformController;
use App\Http\Controllers\PromoCodeController;
use App\Http\Controllers\ReviewController;
use App\Http\Controllers\TemplateController;
use App\Http\Controllers\Admin\DashboardController;
use App\Http\Controllers\Admin\AdminTemplateController;
use App\Http\Controllers\Admin\AdminOrderController;
use App\Http\Controllers\Admin\AdminPromoController;
use App\Http\Controllers\UploadController;
use App\Http\Controllers\AiChatController;
use Illuminate\Support\Facades\Route;

// ─── HEALTH CHECK ───

Route::get('/health', function () {
    $checks = [
        'status' => 'ok',
        'timestamp' => now()->toIso8601String(),
    ];

    // Database
    try {
        \Illuminate\Support\Facades\DB::connection()->getPdo();
        $checks['database'] = 'ok';
    } catch (\Throwable $e) {
        $checks['database'] = 'error';
        $checks['status'] = 'degraded';
    }

    // Redis
    try {
        \Illuminate\Support\Facades\Cache::store('redis')->put('health_check', true, 10);
        $checks['redis'] = 'ok';
    } catch (\Throwable $e) {
        $checks['redis'] = 'error';
        $checks['status'] = 'degraded';
    }

    // S3
    try {
        \Illuminate\Support\Facades\Storage::disk('s3')->exists('health_check');
        $checks['storage'] = 'ok';
    } catch (\Throwable $e) {
        $checks['storage'] = 'error';
    }

    $code = $checks['status'] === 'ok' ? 200 : 503;
    return response()->json($checks, $code);
});

// ─── PUBLIC ───

Route::post('/auth/register', [RegisterController::class, 'register'])->middleware('throttle:auth');
Route::post('/auth/login', [LoginController::class, 'login'])->middleware('throttle:auth');
Route::post('/auth/forgot-password', [ForgotPasswordController::class, 'sendResetLink'])->middleware('throttle:auth');
Route::post('/auth/reset-password', [ForgotPasswordController::class, 'resetPassword'])->middleware('throttle:5,1');

// Обратная связь
Route::post('/contact', [\App\Http\Controllers\ContactController::class, 'send'])->middleware('throttle:3,1');

Route::get('/categories', [CategoryController::class, 'index']);
Route::get('/platforms', [PlatformController::class, 'index']);

Route::get('/templates', [TemplateController::class, 'index']);
Route::get('/templates/featured', [TemplateController::class, 'featured']);
Route::get('/templates/{slug}', [TemplateController::class, 'show']);

Route::get('/reviews', [ReviewController::class, 'all']);
Route::get('/reviews/{template}', [ReviewController::class, 'index']);

Route::post('/promo/validate', [PromoCodeController::class, 'validate'])->middleware('throttle:10,1');

// Блог (публичный)
Route::get('/blog', [\App\Http\Controllers\BlogController::class, 'index']);
Route::get('/blog/categories', [\App\Http\Controllers\BlogController::class, 'categories']);
Route::get('/blog/{slug}', [\App\Http\Controllers\BlogController::class, 'show']);

// Подписки (публичный список планов)
Route::get('/subscriptions/plans', [\App\Http\Controllers\SubscriptionController::class, 'plans']);

// Сравнение шаблонов (публичный)
Route::get('/compare', [\App\Http\Controllers\CompareController::class, 'compare']);

// AI-подбор шаблона (публичный, без авторизации) — ограничиваем расход OpenAI
Route::post('/ai/chat', [AiChatController::class, 'chat'])->middleware('throttle:20,1');

// Newsletter
Route::post('/newsletter/subscribe', [\App\Http\Controllers\NewsletterController::class, 'subscribe'])->middleware('throttle:5,1');
Route::post('/newsletter/unsubscribe', [\App\Http\Controllers\NewsletterController::class, 'unsubscribe'])->middleware('throttle:5,1');

// Recent purchases for social proof (anonymized, cached)
Route::get('/social-proof/recent', [\App\Http\Controllers\SocialProofController::class, 'recent']);

// Live purchases (social proof)
Route::get('/live-purchases', [\App\Http\Controllers\LivePurchaseController::class, 'recent']);

// Social Auth (OAuth)
Route::get('/auth/social/{provider}', [\App\Http\Controllers\Auth\SocialAuthController::class, 'redirect']);
Route::get('/auth/social/{provider}/callback', [\App\Http\Controllers\Auth\SocialAuthController::class, 'callback']);
// Обмен одноразового кода (из колбэка) на токен — токен не передаётся через URL
Route::post('/auth/social/exchange', [\App\Http\Controllers\Auth\SocialAuthController::class, 'exchange'])->middleware('throttle:10,1');

// Публичный профиль автора
Route::get('/authors/{slug}', [\App\Http\Controllers\Author\AuthorProfileController::class, 'publicProfile']);

// SEO
Route::get('/sitemap.xml', [\App\Http\Controllers\SitemapController::class, 'index']);
Route::get('/robots.txt', [\App\Http\Controllers\SitemapController::class, 'robots']);

// ─── WEBHOOK (без авторизации, IP whitelist) ───

Route::post('/payment/webhook', [PaymentController::class, 'webhook'])
    ->withoutMiddleware(['throttle:api'])
    ->middleware('throttle:120,1');

// ─── AUTH ───

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/auth/logout', [LoginController::class, 'logout']);
    Route::get('/user', fn (\Illuminate\Http\Request $r) => $r->user());
    Route::put('/user', [LoginController::class, 'updateProfile']);
    Route::delete('/user', [LoginController::class, 'deleteAccount']);
    Route::post('/user/password', [LoginController::class, 'changePassword']);

    // Уведомления
    Route::get('/notifications', [\App\Http\Controllers\NotificationController::class, 'index']);
    Route::post('/notifications/read', [\App\Http\Controllers\NotificationController::class, 'markRead']);
    Route::get('/notifications/unread-count', [\App\Http\Controllers\NotificationController::class, 'unreadCount']);

    // Заказы
    Route::post('/orders', [OrderController::class, 'store'])->middleware('throttle:orders');
    Route::get('/orders', [OrderController::class, 'index']);
    Route::get('/orders/find/{orderNumber}', [OrderController::class, 'findByNumber']);
    Route::get('/orders/{order}', [OrderController::class, 'show']);

    // Скачивание (по подписке)
    Route::get('/download/subscription/{template}', [DownloadController::class, 'downloadBySubscription']);
    // Проверка доступа
    Route::get('/download/check/{template}', [DownloadController::class, 'checkAccess']);
    // Скачивание (по заказу) — generic-роут регистрируем последним,
    // иначе он перехватывает /download/subscription и /download/check
    Route::get('/download/{order}/{template}', [DownloadController::class, 'download']);

    // Избранное
    Route::get('/wishlist', [\App\Http\Controllers\WishlistController::class, 'index']);
    Route::post('/wishlist/toggle', [\App\Http\Controllers\WishlistController::class, 'toggle']);
    Route::get('/wishlist/check', [\App\Http\Controllers\WishlistController::class, 'check']);

    // Подписки
    Route::get('/subscriptions/my', [\App\Http\Controllers\SubscriptionController::class, 'my']);
    Route::post('/subscriptions/subscribe', [\App\Http\Controllers\SubscriptionController::class, 'subscribe']);
    Route::post('/subscriptions/cancel', [\App\Http\Controllers\SubscriptionController::class, 'cancel']);

    // Отзывы
    Route::post('/reviews', [ReviewController::class, 'store'])->middleware('throttle:reviews');

    // Реферальная программа
    Route::get('/referral/stats', [\App\Http\Controllers\ReferralController::class, 'stats']);
    Route::get('/referral/rewards', [\App\Http\Controllers\ReferralController::class, 'rewards']);
    Route::post('/referral/generate', [\App\Http\Controllers\ReferralController::class, 'generate']);

    // One-Click Deploy
    Route::get('/deploy', [\App\Http\Controllers\DeployController::class, 'index']);
    Route::post('/deploy', [\App\Http\Controllers\DeployController::class, 'store']);
    Route::get('/deploy/{id}', [\App\Http\Controllers\DeployController::class, 'show']);

    // Abandoned cart tracking
    Route::post('/cart/save', [\App\Http\Controllers\AbandonedCartController::class, 'save']);
    Route::delete('/cart/abandon', [\App\Http\Controllers\AbandonedCartController::class, 'clear']);

    // ─── AUTHOR (стать автором — доступно всем авторизованным) ───
    Route::post('/author/register', [\App\Http\Controllers\Author\AuthorRegisterController::class, 'register'])->middleware('throttle:5,1');

    // ─── AUTHOR PANEL ───
    Route::middleware('author')->prefix('author')->group(function () {
        Route::get('/dashboard', [\App\Http\Controllers\Author\AuthorDashboardController::class, 'index']);
        Route::get('/profile', [\App\Http\Controllers\Author\AuthorProfileController::class, 'show']);
        Route::put('/profile', [\App\Http\Controllers\Author\AuthorProfileController::class, 'update']);
        Route::apiResource('/templates', \App\Http\Controllers\Author\AuthorTemplateController::class);
        Route::get('/payouts', [\App\Http\Controllers\Author\AuthorPayoutController::class, 'index']);
        Route::post('/payouts', [\App\Http\Controllers\Author\AuthorPayoutController::class, 'store']);
        Route::post('/upload', [UploadController::class, 'store']); // Загрузка файлов
    });

    // ─── ADMIN ───
    Route::middleware('admin')->prefix('admin')->group(function () {
        Route::get('/dashboard', [DashboardController::class, 'index']);

        Route::apiResource('/templates', AdminTemplateController::class);
        Route::apiResource('/orders', AdminOrderController::class)->only(['index', 'show', 'update']);

        Route::post('/upload', [UploadController::class, 'store']);

        Route::apiResource('/promo', AdminPromoController::class)->except(['show']);

        Route::get('/reviews', [App\Http\Controllers\Admin\AdminReviewController::class, 'index']);
        Route::put('/reviews/{review}', [App\Http\Controllers\Admin\AdminReviewController::class, 'update']);

        // Управление выплатами авторам
        Route::get('/payouts', [\App\Http\Controllers\Admin\AdminPayoutController::class, 'index']);
        Route::put('/payouts/{payout}', [\App\Http\Controllers\Admin\AdminPayoutController::class, 'update']);

        // Блог
        Route::apiResource('/posts', \App\Http\Controllers\Admin\AdminBlogController::class);
        Route::get('/post-categories', [\App\Http\Controllers\Admin\AdminBlogController::class, 'categories']);
        Route::post('/post-categories', [\App\Http\Controllers\Admin\AdminBlogController::class, 'categoryStore']);
        Route::put('/post-categories/{id}', [\App\Http\Controllers\Admin\AdminBlogController::class, 'categoryUpdate']);
        Route::delete('/post-categories/{id}', [\App\Http\Controllers\Admin\AdminBlogController::class, 'categoryDestroy']);
    });
});


// Services (public)
Route::get('/services', [\App\Http\Controllers\ServiceController::class, 'index']);

// Custom development requests
Route::post('/custom-requests', [\App\Http\Controllers\CustomRequestController::class, 'store'])->middleware('throttle:3,1');
