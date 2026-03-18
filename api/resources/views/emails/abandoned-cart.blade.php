@extends('emails.layout')
@section('subject', 'Вы забыли шаблоны в корзине')

@section('content')
<h1>{{ $name }}, вы кое-что забыли 🛒</h1>

<p>Вы добавили шаблоны в корзину, но не завершили покупку. Они всё ещё ждут вас!</p>

<table class="items-table">
  @foreach($items as $item)
  <tr>
    <td>{{ $item['title'] }}</td>
    <td class="price">{{ number_format($item['price'] / 100, 0, '.', ' ') }} ₽</td>
  </tr>
  @endforeach
  <tr class="total-row">
    <td>Итого</td>
    <td class="price">{{ number_format($total / 100, 0, '.', ' ') }} ₽</td>
  </tr>
</table>

<p style="text-align: center; margin-top: 24px;">
  <a href="{{ config('app.frontend_url') }}/cart" class="btn">Завершить покупку →</a>
</p>

<p class="muted" style="margin-top: 20px; text-align: center;">
  Или оформите <a href="{{ config('app.frontend_url') }}/pricing" style="color: #a78bfa;">подписку</a> — и скачивайте все шаблоны без ограничений
</p>
@endsection

@section('unsubscribe')
{{ config('app.frontend_url') }}/account/settings
@endsection
