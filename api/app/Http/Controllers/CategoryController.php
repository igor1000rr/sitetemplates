<?php
// ═══ app/Http/Controllers/CategoryController.php ═══

namespace App\Http\Controllers;

use App\Models\Category;
use Illuminate\Support\Facades\Cache;

class CategoryController extends Controller
{
    public function index()
    {
        return Cache::remember('categories:all', 600, function () {
            return Category::active()
                ->withCount('publishedTemplates as templates_count')
                ->get();
        });
    }
}
