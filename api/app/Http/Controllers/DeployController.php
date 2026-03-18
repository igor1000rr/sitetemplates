<?php

namespace App\Http\Controllers;

use App\Jobs\ProcessDeployment;
use App\Models\Deployment;
use App\Models\Subscription;
use App\Models\Template;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DeployController extends Controller
{
    /**
     * POST /api/deploy — запустить деплой шаблона на хостинг
     */
    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'template_id' => 'required|exists:templates,id',
            'method' => 'required|in:ftp,sftp',
            'host' => 'required|string|max:255',
            'port' => 'integer|min:1|max:65535',
            'username' => 'required|string|max:255',
            'password' => 'required|string|max:500',
            'remote_path' => 'string|max:500',
        ]);

        $user = $request->user();
        $template = Template::findOrFail($data['template_id']);

        // Проверяем доступ: покупка или подписка
        $purchased = $user->orders()
            ->where('status', 'paid')
            ->whereHas('items', fn ($q) => $q->where('template_id', $template->id))
            ->exists();

        $hasSubscription = $user->hasActiveSubscription();

        if (!$purchased && !$hasSubscription) {
            return response()->json(['message' => 'Нет доступа к шаблону. Купите или оформите подписку.'], 403);
        }

        // Проверяем нет ли активного деплоя
        $active = Deployment::where('user_id', $user->id)
            ->whereIn('status', ['pending', 'deploying'])
            ->exists();

        if ($active) {
            return response()->json(['message' => 'У вас уже есть активный деплой. Дождитесь завершения.'], 422);
        }

        $deployment = Deployment::create([
            'user_id' => $user->id,
            'template_id' => $template->id,
            'method' => $data['method'],
            'host' => $data['host'],
            'port' => $data['port'] ?? ($data['method'] === 'sftp' ? 22 : 21),
            'username' => $data['username'],
            'password_encrypted' => '', // set via mutator
            'remote_path' => $data['remote_path'] ?? '/public_html',
        ]);

        // Encrypt password through mutator
        $deployment->password = $data['password'];
        $deployment->save();

        // Запускаем джоб
        ProcessDeployment::dispatch($deployment);

        return response()->json([
            'message' => 'Деплой запущен! Отслеживайте статус ниже.',
            'deployment' => $this->formatDeployment($deployment),
        ], 201);
    }

    /**
     * GET /api/deploy/{id} — статус деплоя
     */
    public function show(Request $request, int $id): JsonResponse
    {
        $d = Deployment::where('user_id', $request->user()->id)->findOrFail($id);
        return response()->json(['deployment' => $this->formatDeployment($d)]);
    }

    /**
     * GET /api/deploy — история деплоев
     */
    public function index(Request $request): JsonResponse
    {
        $deployments = Deployment::where('user_id', $request->user()->id)
            ->with('template:id,title,slug')
            ->orderByDesc('created_at')
            ->limit(20)
            ->get()
            ->map(fn ($d) => $this->formatDeployment($d));

        return response()->json(['data' => $deployments]);
    }

    private function formatDeployment(Deployment $d): array
    {
        return [
            'id' => $d->id,
            'template' => $d->template ? [
                'title' => $d->template->title,
                'slug' => $d->template->slug,
            ] : null,
            'method' => $d->method,
            'host' => $d->host,
            'remote_path' => $d->remote_path,
            'status' => $d->status,
            'log' => $d->log,
            'error' => $d->error,
            'started_at' => $d->started_at?->format('d.m.Y H:i:s'),
            'completed_at' => $d->completed_at?->format('d.m.Y H:i:s'),
            'created_at' => $d->created_at->format('d.m.Y H:i'),
        ];
    }
}
