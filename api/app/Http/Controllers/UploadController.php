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
            // mimes проверяет тип по реальному содержимому (guessed MIME), а не по
            // имени файла от клиента. SVG намеренно исключён (встроенный JS → XSS).
            'file' => 'required|file|max:512000|mimes:zip,rar,7z,jpg,jpeg,png,webp,gif,pdf', // 500MB
            'folder' => 'nullable|string|max:100',
        ]);

        $file = $request->file('file');
        // Расширение определяем по содержимому, а не из имени, которое подконтрольно клиенту
        $ext = strtolower($file->extension() ?: $file->getClientOriginalExtension());
        $folder = $request->input('folder', 'templates');

        $allowed = ['zip', 'rar', '7z', 'jpg', 'jpeg', 'png', 'webp', 'gif', 'pdf'];
        if (!in_array($ext, $allowed)) {
            return response()->json(['message' => "Тип файла .{$ext} не разрешён"], 422);
        }

        // Определяем подпапку по типу файла
        $subfolder = match (true) {
            in_array($ext, ['zip', 'rar', '7z']) => "{$folder}/zips",
            in_array($ext, ['jpg', 'jpeg', 'png', 'webp', 'gif']) => "{$folder}/images",
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
