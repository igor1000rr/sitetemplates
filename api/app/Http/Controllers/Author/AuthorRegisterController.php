<?php

namespace App\Http\Controllers\Author;

use App\Http\Controllers\Controller;
use App\Models\AuthorProfile;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AuthorRegisterController extends Controller
{
    /**
     * POST /api/author/register — стать автором
     */
    public function register(Request $request): JsonResponse
    {
        $user = $request->user();

        if ($user->isAuthor()) {
            return response()->json(['message' => 'Вы уже являетесь автором'], 422);
        }

        $data = $request->validate([
            'display_name' => 'required|string|max:100',
            'bio' => 'nullable|string|max:1000',
            'specialization' => 'nullable|string|in:WordPress,Tilda,Оба',
            'website' => 'nullable|url|max:500',
            'social_links' => 'nullable|array',
            'social_links.telegram' => 'nullable|string|max:100',
            'social_links.vk' => 'nullable|string|max:200',
            'social_links.github' => 'nullable|string|max:200',
        ]);

        $profile = AuthorProfile::create([
            'user_id' => $user->id,
            'display_name' => $data['display_name'],
            'slug' => AuthorProfile::generateSlug($data['display_name']),
            'bio' => $data['bio'] ?? null,
            'specialization' => $data['specialization'] ?? null,
            'website' => $data['website'] ?? null,
            'social_links' => $data['social_links'] ?? null,
            'commission' => 70, // 70% автору по умолчанию
        ]);

        $user->update(['role' => 'author']);

        return response()->json([
            'message' => 'Вы зарегистрированы как автор!',
            'profile' => $this->formatProfile($profile),
        ], 201);
    }

    private function formatProfile(AuthorProfile $p): array
    {
        return [
            'display_name' => $p->display_name,
            'slug' => $p->slug,
            'bio' => $p->bio,
            'avatar' => $p->avatar,
            'specialization' => $p->specialization,
            'website' => $p->website,
            'social_links' => $p->social_links,
            'commission' => $p->commission,
            'is_verified' => $p->is_verified,
        ];
    }
}
