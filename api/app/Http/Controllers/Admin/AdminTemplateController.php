<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Resources\TemplateResource;
use App\Models\Template;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class AdminTemplateController extends Controller
{
    public function index(Request $request)
    {
        $query = Template::with(['category', 'platform', 'mainImage']);

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }
        if ($request->filled('search')) {
            $query->search($request->search);
        }

        return $query->orderBy('created_at', 'desc')->paginate(20);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'title' => 'required|string|max:255',
            'slug' => 'nullable|string|max:255|unique:templates',
            'description' => 'nullable|string',
            'short_desc' => 'nullable|string|max:500',
            'price' => 'required|integer|min:0',
            'old_price' => 'nullable|integer|min:0',
            'category_id' => 'required|exists:categories,id',
            'platform_id' => 'required|exists:platforms,id',
            'template_type' => 'required|in:landing,multipage,shop,quiz',
            'zip_path' => 'nullable|string',
            'zip_size' => 'nullable|integer',
            'demo_url' => 'nullable|url',
            'features' => 'nullable|array',
            'tags' => 'nullable|array',
            'tech_specs' => 'nullable|array',
            'meta_title' => 'nullable|string|max:255',
            'meta_desc' => 'nullable|string|max:500',
            'status' => 'nullable|in:draft,review,published,archived',
            'is_featured' => 'nullable|boolean',
            'images' => 'nullable|array',
            'images.*.path' => 'required|string',
            'images.*.alt' => 'nullable|string',
            'images.*.is_main' => 'nullable|boolean',
        ]);

        if (empty($data['slug'])) {
            $data['slug'] = Str::slug($data['title']);
        }

        if (($data['status'] ?? 'draft') === 'published' && empty($data['published_at'])) {
            $data['published_at'] = now();
        }

        $images = $data['images'] ?? [];
        unset($data['images']);

        $template = Template::create($data);

        foreach ($images as $i => $img) {
            $template->images()->create([
                'path' => $img['path'],
                'alt' => $img['alt'] ?? $template->title,
                'sort_order' => $i,
                'is_main' => $img['is_main'] ?? ($i === 0),
            ]);
        }

        return new TemplateResource($template->load(['category', 'platform', 'images']));
    }

    public function show(Template $template)
    {
        return new TemplateResource($template->load(['category', 'platform', 'images', 'approvedReviews.user']));
    }

    public function update(Request $request, Template $template)
    {
        $data = $request->validate([
            'title' => 'sometimes|string|max:255',
            'slug' => 'sometimes|string|max:255|unique:templates,slug,' . $template->id,
            'description' => 'nullable|string',
            'short_desc' => 'nullable|string|max:500',
            'price' => 'sometimes|integer|min:0',
            'old_price' => 'nullable|integer|min:0',
            'category_id' => 'sometimes|exists:categories,id',
            'platform_id' => 'sometimes|exists:platforms,id',
            'template_type' => 'sometimes|in:landing,multipage,shop,quiz',
            'zip_path' => 'nullable|string',
            'zip_size' => 'nullable|integer',
            'demo_url' => 'nullable|url',
            'features' => 'nullable|array',
            'tags' => 'nullable|array',
            'tech_specs' => 'nullable|array',
            'meta_title' => 'nullable|string|max:255',
            'meta_desc' => 'nullable|string|max:500',
            'status' => 'nullable|in:draft,review,published,archived',
            'is_featured' => 'nullable|boolean',
            'images' => 'nullable|array',
            'images.*.path' => 'required|string',
            'images.*.alt' => 'nullable|string',
            'images.*.is_main' => 'nullable|boolean',
        ]);

        // Если публикуем впервые
        if (($data['status'] ?? null) === 'published' && !$template->published_at) {
            $data['published_at'] = now();
        }

        $images = $data['images'] ?? null;
        unset($data['images']);

        $template->update($data);

        // Если передали images — перезаписываем
        if ($images !== null) {
            $template->images()->delete();
            foreach ($images as $i => $img) {
                $template->images()->create([
                    'path' => $img['path'],
                    'alt' => $img['alt'] ?? $template->title,
                    'sort_order' => $i,
                    'is_main' => $img['is_main'] ?? ($i === 0),
                ]);
            }
        }

        return new TemplateResource($template->fresh(['category', 'platform', 'images']));
    }

    public function destroy(Template $template)
    {
        $template->delete();
        return response()->json(['message' => 'Удалён']);
    }
}
