<?php

namespace App\Http\Controllers;

use App\Models\Post;
use App\Models\PostCategory;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class BlogController extends Controller
{
    /**
     * GET /api/blog — список статей
     */
    public function index(Request $request): JsonResponse
    {
        $query = Post::published()
            ->with(['author:id,name,avatar', 'category:id,name,slug'])
            ->orderByDesc('published_at');

        if ($request->filled('category')) {
            $query->byCategory($request->category);
        }

        if ($request->filled('tag')) {
            $query->byTag($request->tag);
        }

        if ($request->filled('search')) {
            $query->search($request->search);
        }

        $posts = $query->paginate(12);

        return response()->json([
            'data' => $posts->map(fn ($p) => $this->formatList($p)),
            'meta' => [
                'current_page' => $posts->currentPage(),
                'last_page' => $posts->lastPage(),
                'total' => $posts->total(),
            ],
        ]);
    }

    /**
     * GET /api/blog/{slug} — одна статья
     */
    public function show(string $slug): JsonResponse
    {
        $post = Post::published()
            ->where('slug', $slug)
            ->with(['author:id,name,avatar', 'category:id,name,slug'])
            ->firstOrFail();

        $post->incrementViews();

        // Похожие статьи (из той же категории)
        $related = Post::published()
            ->where('id', '!=', $post->id)
            ->when($post->category_id, fn ($q) => $q->where('category_id', $post->category_id))
            ->with(['category:id,name,slug'])
            ->orderByDesc('published_at')
            ->limit(3)
            ->get()
            ->map(fn ($p) => $this->formatList($p));

        return response()->json([
            'post' => [
                'id' => $post->id,
                'title' => $post->title,
                'slug' => $post->slug,
                'excerpt' => $post->excerpt,
                'content' => $post->content,
                'cover_image' => $post->cover_image,
                'tags' => $post->tags,
                'views_count' => $post->views_count,
                'reading_time' => $post->reading_time,
                'meta_title' => $post->meta_title,
                'meta_desc' => $post->meta_desc,
                'published_at' => $post->published_at->format('d.m.Y'),
                'author' => [
                    'name' => $post->author->name,
                    'avatar' => $post->author->avatar,
                ],
                'category' => $post->category ? [
                    'name' => $post->category->name,
                    'slug' => $post->category->slug,
                ] : null,
            ],
            'related' => $related,
        ]);
    }

    /**
     * GET /api/blog/categories
     */
    public function categories(): JsonResponse
    {
        $cats = PostCategory::withCount(['posts' => fn ($q) => $q->published()])
            ->orderBy('sort_order')
            ->get()
            ->map(fn ($c) => [
                'id' => $c->id,
                'name' => $c->name,
                'slug' => $c->slug,
                'posts_count' => $c->posts_count,
            ]);

        return response()->json(['data' => $cats]);
    }

    private function formatList(Post $p): array
    {
        return [
            'id' => $p->id,
            'title' => $p->title,
            'slug' => $p->slug,
            'excerpt' => $p->excerpt,
            'cover_image' => $p->cover_image,
            'tags' => $p->tags,
            'reading_time' => $p->reading_time,
            'views_count' => $p->views_count,
            'published_at' => $p->published_at->format('d.m.Y'),
            'author' => $p->author ? ['name' => $p->author->name] : null,
            'category' => $p->category ? [
                'name' => $p->category->name,
                'slug' => $p->category->slug,
            ] : null,
        ];
    }
}
