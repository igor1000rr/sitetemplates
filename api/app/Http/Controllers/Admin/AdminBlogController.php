<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Post;
use App\Models\PostCategory;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminBlogController extends Controller
{
    /**
     * GET /api/admin/posts
     */
    public function index(Request $request): JsonResponse
    {
        $query = Post::with(['author:id,name', 'category:id,name,slug'])
            ->orderByDesc('created_at');

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        $posts = $query->paginate(20);

        return response()->json([
            'data' => $posts->map(fn ($p) => [
                'id' => $p->id,
                'title' => $p->title,
                'slug' => $p->slug,
                'status' => $p->status,
                'category' => $p->category?->name,
                'author' => $p->author?->name,
                'views_count' => $p->views_count,
                'published_at' => $p->published_at?->format('d.m.Y'),
                'created_at' => $p->created_at->format('d.m.Y'),
            ]),
            'meta' => [
                'current_page' => $posts->currentPage(),
                'last_page' => $posts->lastPage(),
                'total' => $posts->total(),
            ],
        ]);
    }

    /**
     * GET /api/admin/posts/{id}
     */
    public function show(int $id): JsonResponse
    {
        $post = Post::with(['author:id,name', 'category'])->findOrFail($id);

        return response()->json(['data' => $post]);
    }

    /**
     * POST /api/admin/posts
     */
    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'title' => 'required|string|max:300',
            'excerpt' => 'nullable|string|max:500',
            'content' => 'required|string',
            'cover_image' => 'nullable|string|max:500',
            'category_id' => 'nullable|exists:post_categories,id',
            'tags' => 'nullable|array|max:10',
            'tags.*' => 'string|max:50',
            'status' => 'in:draft,published',
            'meta_title' => 'nullable|string|max:200',
            'meta_desc' => 'nullable|string|max:500',
        ]);

        $post = Post::create([
            ...$data,
            'author_id' => $request->user()->id,
            'slug' => Post::generateSlug($data['title']),
            'reading_time' => Post::calculateReadingTime($data['content']),
            'published_at' => ($data['status'] ?? 'draft') === 'published' ? now() : null,
        ]);

        return response()->json([
            'message' => 'Статья создана',
            'data' => $post,
        ], 201);
    }

    /**
     * PUT /api/admin/posts/{id}
     */
    public function update(Request $request, int $id): JsonResponse
    {
        $post = Post::findOrFail($id);

        $data = $request->validate([
            'title' => 'sometimes|string|max:300',
            'excerpt' => 'nullable|string|max:500',
            'content' => 'sometimes|string',
            'cover_image' => 'nullable|string|max:500',
            'category_id' => 'nullable|exists:post_categories,id',
            'tags' => 'nullable|array|max:10',
            'status' => 'in:draft,published',
            'meta_title' => 'nullable|string|max:200',
            'meta_desc' => 'nullable|string|max:500',
        ]);

        // Авто reading time при обновлении контента
        if (isset($data['content'])) {
            $data['reading_time'] = Post::calculateReadingTime($data['content']);
        }

        // Авто published_at при первой публикации
        if (($data['status'] ?? null) === 'published' && !$post->published_at) {
            $data['published_at'] = now();
        }

        $post->update($data);

        return response()->json([
            'message' => 'Статья обновлена',
            'data' => $post->fresh(['category']),
        ]);
    }

    /**
     * DELETE /api/admin/posts/{id}
     */
    public function destroy(int $id): JsonResponse
    {
        Post::findOrFail($id)->delete();
        return response()->json(['message' => 'Статья удалена']);
    }

    // ─── Categories ───

    /**
     * GET /api/admin/post-categories
     */
    public function categories(): JsonResponse
    {
        $cats = PostCategory::withCount('posts')->orderBy('sort_order')->get();
        return response()->json(['data' => $cats]);
    }

    /**
     * POST /api/admin/post-categories
     */
    public function categoryStore(Request $request): JsonResponse
    {
        $data = $request->validate([
            'name' => 'required|string|max:100',
            'slug' => 'required|string|max:100|unique:post_categories,slug',
            'description' => 'nullable|string|max:500',
        ]);

        $cat = PostCategory::create($data);
        return response()->json(['message' => 'Категория создана', 'data' => $cat], 201);
    }

    /**
     * PUT /api/admin/post-categories/{id}
     */
    public function categoryUpdate(Request $request, int $id): JsonResponse
    {
        $cat = PostCategory::findOrFail($id);
        $data = $request->validate([
            'name' => 'sometimes|string|max:100',
            'slug' => "sometimes|string|max:100|unique:post_categories,slug,{$id}",
            'description' => 'nullable|string|max:500',
        ]);
        $cat->update($data);
        return response()->json(['message' => 'Обновлено']);
    }

    /**
     * DELETE /api/admin/post-categories/{id}
     */
    public function categoryDestroy(int $id): JsonResponse
    {
        PostCategory::findOrFail($id)->delete();
        return response()->json(['message' => 'Удалено']);
    }
}
