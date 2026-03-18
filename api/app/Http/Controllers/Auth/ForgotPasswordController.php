<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;
use Illuminate\Validation\Rules\Password;

class ForgotPasswordController extends Controller
{
    /**
     * POST /api/auth/forgot-password — отправить ссылку сброса
     */
    public function sendResetLink(Request $request): JsonResponse
    {
        $request->validate(['email' => 'required|email']);

        $user = User::where('email', $request->email)->first();
        if (!$user) {
            // Не раскрываем наличие аккаунта
            return response()->json(['message' => 'Если аккаунт существует, мы отправили ссылку для сброса.']);
        }

        $token = Str::random(64);

        // Сохраняем токен
        DB::table('password_reset_tokens')->updateOrInsert(
            ['email' => $user->email],
            ['token' => Hash::make($token), 'created_at' => now()]
        );

        $resetUrl = config('app.frontend_url') . '/auth/reset-password?token=' . $token . '&email=' . urlencode($user->email);

        // Отправляем письмо
        Mail::send('emails.reset-password', [
            'user' => $user,
            'resetUrl' => $resetUrl,
        ], function ($mail) use ($user) {
            $mail->to($user->email, $user->name)
                ->subject('Сброс пароля — TemplateName');
        });

        return response()->json(['message' => 'Если аккаунт существует, мы отправили ссылку для сброса.']);
    }

    /**
     * POST /api/auth/reset-password — сбросить пароль по токену
     */
    public function resetPassword(Request $request): JsonResponse
    {
        $request->validate([
            'email' => 'required|email',
            'token' => 'required|string',
            'password' => ['required', 'confirmed', Password::min(8)],
        ]);

        $record = DB::table('password_reset_tokens')
            ->where('email', $request->email)
            ->first();

        if (!$record || !Hash::check($request->token, $record->token)) {
            return response()->json(['message' => 'Недействительный или просроченный токен.'], 422);
        }

        // Токен старше 60 минут
        if (now()->diffInMinutes($record->created_at) > 60) {
            DB::table('password_reset_tokens')->where('email', $request->email)->delete();
            return response()->json(['message' => 'Токен истёк. Запросите сброс заново.'], 422);
        }

        $user = User::where('email', $request->email)->first();
        if (!$user) {
            return response()->json(['message' => 'Пользователь не найден.'], 404);
        }

        $user->update(['password' => Hash::make($request->password)]);

        // Удаляем использованный токен
        DB::table('password_reset_tokens')->where('email', $request->email)->delete();

        // Отзываем все токены (безопасность)
        $user->tokens()->delete();

        return response()->json(['message' => 'Пароль успешно изменён. Войдите с новым паролем.']);
    }
}
