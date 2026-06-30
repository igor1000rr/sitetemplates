@extends('emails.layout')

@section('content')
<h2 style="color: #fff; margin-bottom: 8px;">Подтвердите подписку</h2>
<p style="color: rgba(255,255,255,0.4); margin-bottom: 20px;">
    Спасибо за интерес к AITempl! Чтобы получать подборки шаблонов и ваш промокод на скидку 10%,
    подтвердите подписку — это займёт секунду.
</p>

<div style="text-align: center; margin: 30px 0;">
    <a href="{{ $confirmUrl }}"
       style="display: inline-block; background: #8b5cf6; color: #fff; padding: 14px 36px; border-radius: 12px; text-decoration: none; font-weight: 700; font-size: 14px;">
        Подтвердить подписку
    </a>
</div>

<p style="color: rgba(255,255,255,0.25); font-size: 12px; margin-top: 20px;">
    Если вы не подписывались на рассылку AITempl — просто проигнорируйте это письмо, подписка не будет оформлена.
</p>
@endsection
