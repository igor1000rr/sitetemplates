@extends('emails.layout')
@section('subject', 'Добро пожаловать в TemplateName!')

@section('content')
<h1>Добро пожаловать, {{ $name }}! 👋</h1>

<p>Вы зарегистрировались на TemplateName — платформе готовых шаблонов для любого бизнеса.</p>

<p>Вот что вы можете сделать:</p>

<table class="items-table">
  <tr><td>🎨</td><td>Выбрать шаблон из <strong>{{ $templatesCount }}+ вариантов</strong></td></tr>
  <tr><td>👁</td><td>Посмотреть <strong>Live Preview</strong> перед покупкой</td></tr>
  <tr><td>🤖</td><td>Попросить <strong>AI-помощника</strong> подобрать шаблон</td></tr>
  <tr><td>💰</td><td>Оформить <strong>подписку</strong> для безлимитного доступа</td></tr>
</table>

<p style="text-align: center; margin-top: 24px;">
  <a href="{{ config('app.frontend_url') }}/templates" class="btn">Перейти в каталог →</a>
</p>

<p class="muted" style="margin-top: 24px; text-align: center;">
  Есть вопросы? Напишите нам в <a href="#" style="color: #a78bfa;">Telegram</a>
</p>
@endsection
