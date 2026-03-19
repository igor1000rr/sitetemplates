<?php

namespace App\Http\Controllers;

use App\Models\Platform;
use Illuminate\Support\Facades\Cache;

class PlatformController extends Controller
{
    public function index()
    {
        return Cache::remember('platforms:all', 600, function () {
            return Platform::active()->get();
        });
    }
}
