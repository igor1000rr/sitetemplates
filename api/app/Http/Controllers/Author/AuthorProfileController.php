<?php

namespace App\Http\Controllers\Author;

use App\Http\Controllers\Controller;
use App\Models\AuthorProfile;
use App\Models\Template;
use App\Http\Resources\TemplateListResource;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AuthorProfileController extends Controller
{
    /**
     * GET /api/author/profile — мой профиль
     */
    public function show(Request $request): JsonResponse
    {
        $profile = $request->user()->authorProfile;

        return response()->json([
            'profile' => [
                'display_name' => $profile->display_name,
                'slug' => $profile->slug,
                'bio' => $profile->bio,
                'avatar' => $profile->avatar,
                'specialization' => $profile->specialization,
                'website' => $profile->website,
                'social_links' => $profile->social_links,
                'portfolio_images' => $profile->portfolio_images,
                'payout_method' => $profile->payout_method,
                'payout_details' => $profile->payout_details ? '****' . substr($profile->payout_details, -4) : null,
                'commission' => $profile->commission,
                'is_verified' => $profile->is_verified,
            ],
        ]);
    }

    /**
     * PUT /api/author/profile — обновить профиль
     */
    public function update(Request $request): JsonResponse
    {
        $data = $request->validate([
            'display_name' => 'sometimes|string|max:100',
            'bio' => 'nullable|string|max:1000',
            'avatar' => 'nullable|string|max:500',
            'specialization' => 'nullable|string|in:WordPress,Tilda,Оба',
            'website' => 'nullable|url|max:500',
            'social_links' => 'nullable|array',
            'social_links.telegram' => 'nullable|string|max:100',
            'social_links.vk' => 'nullable|string|max:200',
            'social_links.github' => 'nullable|string|max:200',
            'portfolio_images' => 'nullable|array|max:6',
            'portfolio_images.*' => 'string|max:500',
            'payout_method' => 'sometimes|in:card,sbp,yoomoney',
            'payout_details' => 'nullable|string|max:200',
        ]);

        $profile = $request->user()->authorProfile;
        $profile->update($data);

        return response()->json(['message' => 'Профиль обновлён']);
    }

    /**
     * GET /api/authors/{slug} — публичный профиль автора
     */
    public function publicProfile(string $slug): JsonResponse
    {
        $profile = AuthorProfile::where('slug', $slug)
            ->verified()
            ->firstOrFail();

        $templates = Template::where('author_id', $profile->user_id)
            ->published()
            ->with(['category', 'platform', 'mainImage'])
            ->orderByDesc('sales_count')
            ->paginate(12);

        return response()->json([
            'author' => [
                'display_name' => $profile->display_name,
                'slug' => $profile->slug,
                'bio' => $profile->bio,
                'avatar' => $profile->avatar,
                'specialization' => $profile->specialization,
                'website' => $profile->website,
                'social_links' => $profile->social_links,
                'total_sales' => $profile->total_sales,
                'is_verified' => $profile->is_verified,
                'templates_count' => $templates->total(),
            ],
            'templates' => TemplateListResource::collection($templates),
        ]);
    }
}
