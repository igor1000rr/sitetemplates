<?php

namespace App\Http\Controllers;

use App\Services\AiService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AiChatController extends Controller
{
    public function chat(Request $request, AiService $ai): JsonResponse
    {
        $validated = $request->validate([
            'message' => 'required|string|max:500',
            'history' => 'array|max:20',
            'history.*.role' => 'required|string|in:user,ai',
            'history.*.text' => 'required|string|max:1000',
        ]);

        $result = $ai->matchTemplates(
            $validated['message'],
            $validated['history'] ?? []
        );

        return response()->json($result);
    }
}
