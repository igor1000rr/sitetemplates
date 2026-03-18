@extends('emails.layout')
@section('subject', 'Как вам шаблон? Оставьте отзыв')

@section('content')
<h1>{{ $name }}, как вам шаблон? ⭐</h1>

<p>Прошло несколько дней с покупки шаблона <strong class="highlight">{{ $templateTitle }}</strong>. Надеемся, всё работает отлично!</p>

<p>Ваш отзыв поможет другим пользователям сделать правильный выбор, а нам — стать лучше.</p>

<p style="text-align: center; margin-top: 24px;">
  <a href="{{ config('app.frontend_url') }}/templates/{{ $templateSlug }}#reviews" class="btn">Оставить отзыв →</a>
</p>

<p class="muted" style="margin-top: 20px; text-align: center;">
  Это займёт меньше минуты
</p>
@endsection

@section('unsubscribe')
{{ config('app.frontend_url') }}/account/settings
@endsection
