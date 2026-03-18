<?php
// ═══ app/Http/Controllers/CategoryController.php ═══

namespace App\Http\Controllers;

use App\Models\Category;

class CategoryController extends Controller
{
    public function index()
    {
        return Category::active()
            ->withCount('publishedTemplates as templates_count')
            ->get();
    }
}
