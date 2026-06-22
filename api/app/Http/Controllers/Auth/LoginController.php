<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Support\AuthCookie;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class LoginController extends Controller
{
    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required',
        ]);

        $user = User::where('email', $request->email)->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            return response()->json([
                'message' => 'Неверный email или пароль',
            ], 401);
        }

        // Удаляем старые токены
        $user->tokens()->delete();
        $token = $user->createToken('auth')->plainTextToken;

        return response()->json([
            'user' => $user->only('id', 'name', 'email', 'role', 'phone', 'avatar'),
            'token' => $token,
        ])->withCookie(AuthCookie::make($token));
    }

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json(['message' => 'OK'])->withCookie(AuthCookie::forget());
    }

    public function updateProfile(Request $request)
    {
        $data = $request->validate([
            'name' => 'sometimes|string|max:255',
            'phone' => 'sometimes|nullable|string|max:20',
        ]);

        $request->user()->update($data);

        return response()->json([
            'user' => $request->user()->only('id', 'name', 'email', 'role', 'phone', 'avatar'),
        ]);
    }

    public function changePassword(Request $request)
    {
        $request->validate([
            'current_password' => 'required|string',
            'password' => 'required|string|min:8|confirmed',
        ]);

        if (!Hash::check($request->current_password, $request->user()->password)) {
            return response()->json(['message' => 'Текущий пароль неверный.'], 422);
        }

        $request->user()->update([
            'password' => Hash::make($request->password),
        ]);

        return response()->json(['message' => 'Пароль успешно изменён.']);
    }

    /**
     * DELETE /api/user — soft delete account
     */
    public function deleteAccount(Request $request)
    {
        $user = $request->user();

        // Revoke all tokens
        $user->tokens()->delete();

        // Anonymize personal data (GDPR compliance)
        $user->update([
            'name' => 'Удалённый пользователь',
            'email' => 'deleted_' . $user->id . '@deleted.local',
            'phone' => null,
            'password' => Hash::make(\Illuminate\Support\Str::random(40)),
            'deleted_at' => now(),
        ]);

        return response()->json(['message' => 'Аккаунт удалён.'])->withCookie(AuthCookie::forget());
    }
}
