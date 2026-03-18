@extends('emails.layout')
@section('subject', 'Подписка активирована!')

@section('content')
<h1>Подписка оформлена! 🎉</h1>

<p>{{ $name }}, ваша подписка <strong class="highlight">{{ $planName }}</strong> активирована.</p>

<table class="items-table">
  <tr><td>Тариф</td><td class="price">{{ $planName }}</td></tr>
  <tr><td>Период</td><td class="price">{{ $cycle === 'annual' ? 'Годовая' : 'Ежемесячная' }}</td></tr>
  <tr><td>Стоимость</td><td class="price">{{ number_format($pricePaid / 100, 0, '.', ' ') }} ₽</td></tr>
  <tr><td>Действует до</td><td class="price">{{ $periodEnd }}</td></tr>
</table>

<p>Теперь вам доступны все шаблоны каталога. Скачивайте и используйте!</p>

<p style="text-align: center; margin-top: 24px;">
  <a href="{{ config('app.frontend_url') }}/templates" class="btn">Перейти в каталог →</a>
</p>
@endsection
