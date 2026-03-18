@extends('emails.layout')

@section('content')
<h2 style="color: #fff; margin-bottom: 8px;">Сброс пароля</h2>
<p style="color: rgba(255,255,255,0.4); margin-bottom: 20px;">
    {{ $user->name }}, мы получили запрос на сброс пароля для вашего аккаунта.
</p>

<div style="text-align: center; margin: 30px 0;">
    <a href="{{ $resetUrl }}"
       style="display: inline-block; background: #8b5cf6; color: #fff; padding: 14px 36px; border-radius: 12px; text-decoration: none; font-weight: 700; font-size: 14px;">
        Сбросить пароль
    </a>
</div>

<p style="color: rgba(255,255,255,0.25); font-size: 12px; margin-top: 20px;">
    Ссылка действительна 60 минут. Если вы не запрашивали сброс — просто проигнорируйте это письмо.
</p>
@endsection
