<?php

namespace App\Http\Controllers;

use App\Models\Platform;

class PlatformController extends Controller
{
    public function index()
    {
        return Platform::active()->get();
    }
}
