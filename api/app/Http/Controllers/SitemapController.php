<?php

namespace App\Http\Controllers;

use App\Models\Template;
use App\Models\Category;
use App\Models\Post;
use Illuminate\Http\Response;

class SitemapController extends Controller
{
    public function index(): Response
    {
        $templates = Template::published()
            ->select('slug', 'updated_at')
            ->orderBy('updated_at', 'desc')
            ->get();

        $categories = Category::where('is_active', true)
            ->select('slug', 'updated_at')
            ->get();

        $xml = '<?xml version="1.0" encoding="UTF-8"?>' . "\n";
        $xml .= '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">' . "\n";

        $siteUrl = config('app.frontend_url', 'https://aitempl.ru');

        // Static pages
        $staticPages = [
            ['loc' => '/', 'priority' => '1.0', 'changefreq' => 'daily'],
            ['loc' => '/templates', 'priority' => '0.9', 'changefreq' => 'daily'],
            ['loc' => '/blog', 'priority' => '0.8', 'changefreq' => 'daily'],
        ];

        foreach ($staticPages as $page) {
            $xml .= $this->urlEntry($siteUrl . $page['loc'], now()->toW3cString(), $page['changefreq'], $page['priority']);
        }

        // Categories
        foreach ($categories as $cat) {
            $xml .= $this->urlEntry(
                $siteUrl . '/templates?category=' . $cat->slug,
                $cat->updated_at->toW3cString(),
                'weekly',
                '0.8'
            );
        }

        // Templates
        foreach ($templates as $t) {
            $xml .= $this->urlEntry(
                $siteUrl . '/templates/' . $t->slug,
                $t->updated_at->toW3cString(),
                'weekly',
                '0.7'
            );
        }

        // Blog posts
        $posts = Post::published()
            ->select('slug', 'updated_at')
            ->orderByDesc('published_at')
            ->get();

        foreach ($posts as $post) {
            $xml .= $this->urlEntry(
                $siteUrl . '/blog/' . $post->slug,
                $post->updated_at->toW3cString(),
                'monthly',
                '0.6'
            );
        }

        $xml .= '</urlset>';

        return response($xml, 200, [
            'Content-Type' => 'application/xml',
        ]);
    }

    public function robots(): Response
    {
        $siteUrl = config('app.frontend_url', 'https://aitempl.ru');

        $robots = implode("\n", [
            'User-agent: *',
            'Allow: /',
            'Disallow: /account',
            'Disallow: /cart',
            'Disallow: /checkout',
            'Disallow: /auth',
            'Disallow: /admin',
            'Disallow: /author',
            '',
            "Sitemap: {$siteUrl}/sitemap.xml",
            '',
            'User-agent: Googlebot',
            'Allow: /',
            '',
            'User-agent: YandexBot',
            'Allow: /',
            "Host: {$siteUrl}",
        ]);

        return response($robots, 200, [
            'Content-Type' => 'text/plain',
        ]);
    }

    private function urlEntry(string $loc, string $lastmod, string $changefreq, string $priority): string
    {
        return "  <url>\n" .
            "    <loc>{$loc}</loc>\n" .
            "    <lastmod>{$lastmod}</lastmod>\n" .
            "    <changefreq>{$changefreq}</changefreq>\n" .
            "    <priority>{$priority}</priority>\n" .
            "  </url>\n";
    }
}
