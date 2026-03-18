<?php

namespace App\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;

class ContactController extends Controller
{
    public function send(Request $request): JsonResponse
    {
        $data = $request->validate([
            'name' => 'required|string|max:100',
            'email' => 'required|email|max:255',
            'subject' => 'required|string|max:200',
            'message' => 'required|string|max:5000',
        ]);

        Mail::send('emails.contact', $data, function ($mail) use ($data) {
            $mail->to(config('mail.from.address'))
                ->replyTo($data['email'], $data['name'])
                ->subject('Обратная связь: ' . $data['subject']);
        });

        return response()->json(['message' => 'Сообщение отправлено. Мы ответим в течение 24 часов.']);
    }
}
