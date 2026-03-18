<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class UploadController extends Controller
{
    /**
     * POST /api/admin/upload
     * Загрузка файла в S3 (ZIP шаблона или изображения)
     */
    public function store(Request $request)
    {
        $request->validate([
            'file' => 'required|file|max:512000', // 500MB
            'folder' => 'nullable|string|max:100',
        ]);

        $file = $request->file('file');
        $ext = strtolower($file->getClientOriginalExtension());
        $folder = $request->input('folder', 'templates');

        // Определяем подпапку по типу файла
        $subfolder = match (true) {
            in_array($ext, ['zip', 'rar', '7z']) => "{$folder}/zips",
            in_array($ext, ['jpg', 'jpeg', 'png', 'webp', 'gif', 'svg']) => "{$folder}/images",
            default => $folder,
        };

        $path = $file->store($subfolder, 's3');

        return response()->json([
            'path' => $path,
            'url' => Storage::disk('s3')->url($path),
            'size' => $file->getSize(),
            'name' => $file->getClientOriginalName(),
        ]);
    }
}
