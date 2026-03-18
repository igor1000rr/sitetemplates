<?php

namespace App\Http\Controllers\Author;

use App\Http\Controllers\Controller;
use App\Http\Resources\TemplateResource;
use App\Models\Template;
use App\Models\TemplateImage;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class AuthorTemplateController extends Controller
{
    /**
     * GET /api/author/templates — мои шаблоны
     */
    public function index(Request $request): JsonResponse
    {
        $templates = Template::where('author_id', $request->user()->id)
            ->with(['category', 'platform', 'mainImage'])
            ->orderByDesc('created_at')
            ->paginate(12);

        return response()->json([
            'data' => $templates->map(fn ($t) => [
                'id' => $t->id,
                'title' => $t->title,
                'slug' => $t->slug,
                'status' => $t->status,
                'price_rub' => $t->price / 100,
                'sales_count' => $t->sales_count,
                'rating' => $t->rating,
                'reviews_count' => $t->reviews_count,
                'category' => $t->category->name,
                'platform' => $t->platform->name,
                'image' => $t->mainImage?->path,
                'created_at' => $t->created_at->format('d.m.Y'),
            ]),
            'meta' => [
                'current_page' => $templates->currentPage(),
                'last_page' => $templates->lastPage(),
                'total' => $templates->total(),
            ],
        ]);
    }

    /**
     * GET /api/author/templates/{id} — показать шаблон
     */
    public function show(Request $request, int $id): JsonResponse
    {
        $template = Template::where('author_id', $request->user()->id)
            ->with(['category', 'platform', 'images'])
            ->findOrFail($id);

        return response()->json(['data' => new TemplateResource($template)]);
    }

    /**
     * POST /api/author/templates — создать шаблон (отправить на модерацию)
     */
    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'title' => 'required|string|max:200',
            'description' => 'nullable|string|max:5000',
            'short_desc' => 'nullable|string|max:300',
            'price' => 'required|integer|min:9900', // мин 99₽
            'old_price' => 'nullable|integer|gt:price',
            'category_id' => 'required|exists:categories,id',
            'platform_id' => 'required|exists:platforms,id',
            'template_type' => 'required|in:landing,multipage,shop,quiz',
            'demo_url' => 'nullable|url|max:500',
            'zip_path' => 'required|string|max:500', // S3 path после загрузки
            'features' => 'nullable|array|max:10',
            'features.*' => 'string|max:50',
            'tags' => 'nullable|array|max:10',
            'tags.*' => 'string|max:50',
            'tech_specs' => 'nullable|array',
            'images' => 'nullable|array|max:8',
            'images.*.path' => 'required|string|max:500',
            'images.*.alt' => 'nullable|string|max:200',
        ]);

        $slug = Str::slug($data['title']);
        $n = 1;
        while (Template::where('slug', $slug)->exists()) {
            $slug = Str::slug($data['title']) . '-' . $n++;
        }

        $template = Template::create([
            'title' => $data['title'],
            'slug' => $slug,
            'description' => $data['description'] ?? null,
            'short_desc' => $data['short_desc'] ?? null,
            'price' => $data['price'],
            'old_price' => $data['old_price'] ?? null,
            'category_id' => $data['category_id'],
            'platform_id' => $data['platform_id'],
            'author_id' => $request->user()->id,
            'template_type' => $data['template_type'],
            'demo_url' => $data['demo_url'] ?? null,
            'zip_path' => $data['zip_path'],
            'features' => $data['features'] ?? [],
            'tags' => $data['tags'] ?? [],
            'tech_specs' => $data['tech_specs'] ?? [],
            'version' => '1.0',
            'status' => 'pending', // На модерацию!
        ]);

        // Сохраняем изображения
        if (!empty($data['images'])) {
            foreach ($data['images'] as $i => $img) {
                TemplateImage::create([
                    'template_id' => $template->id,
                    'path' => $img['path'],
                    'alt' => $img['alt'] ?? $template->title,
                    'is_main' => $i === 0,
                    'sort_order' => $i,
                ]);
            }
        }

        return response()->json([
            'message' => 'Шаблон отправлен на модерацию',
            'template' => [
                'id' => $template->id,
                'title' => $template->title,
                'status' => $template->status,
            ],
        ], 201);
    }

    /**
     * PUT /api/author/templates/{id} — обновить шаблон
     */
    public function update(Request $request, int $id): JsonResponse
    {
        $template = Template::where('author_id', $request->user()->id)->findOrFail($id);

        $data = $request->validate([
            'title' => 'sometimes|string|max:200',
            'description' => 'nullable|string|max:5000',
            'short_desc' => 'nullable|string|max:300',
            'price' => 'sometimes|integer|min:9900',
            'old_price' => 'nullable|integer',
            'category_id' => 'sometimes|exists:categories,id',
            'platform_id' => 'sometimes|exists:platforms,id',
            'template_type' => 'sometimes|in:landing,multipage,shop,quiz',
            'demo_url' => 'nullable|url|max:500',
            'zip_path' => 'nullable|string|max:500',
            'features' => 'nullable|array|max:10',
            'tags' => 'nullable|array|max:10',
            'tech_specs' => 'nullable|array',
            'images' => 'nullable|array|max:8',
            'images.*.path' => 'required|string|max:500',
            'images.*.alt' => 'nullable|string|max:200',
        ]);

        // При изменении контента — снова на модерацию
        $contentFields = ['title', 'description', 'zip_path', 'demo_url'];
        $needsReview = false;
        foreach ($contentFields as $field) {
            if (isset($data[$field]) && $data[$field] !== $template->{$field}) {
                $needsReview = true;
                break;
            }
        }

        if ($needsReview && $template->status === 'published') {
            $data['status'] = 'pending';
        }

        $template->update(collect($data)->except('images')->toArray());

        // Обновляем изображения
        if (isset($data['images'])) {
            $template->images()->delete();
            foreach ($data['images'] as $i => $img) {
                TemplateImage::create([
                    'template_id' => $template->id,
                    'path' => $img['path'],
                    'alt' => $img['alt'] ?? $template->title,
                    'is_main' => $i === 0,
                    'sort_order' => $i,
                ]);
            }
        }

        return response()->json([
            'message' => $needsReview ? 'Шаблон обновлён и отправлен на повторную модерацию' : 'Шаблон обновлён',
            'data' => new TemplateResource($template->fresh(['category', 'platform', 'images'])),
        ]);
    }

    /**
     * DELETE /api/author/templates/{id}
     */
    public function destroy(Request $request, int $id): JsonResponse
    {
        $template = Template::where('author_id', $request->user()->id)->findOrFail($id);

        if ($template->sales_count > 0) {
            return response()->json(['message' => 'Нельзя удалить шаблон с продажами. Можно снять с публикации.'], 422);
        }

        $template->images()->delete();
        $template->delete();

        return response()->json(['message' => 'Шаблон удалён']);
    }
}
