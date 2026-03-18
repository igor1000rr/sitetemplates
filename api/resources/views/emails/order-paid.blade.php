@extends('emails.layout')
@section('subject', "Заказ {$orderNumber} оплачен")

@section('content')
<h1>Спасибо за покупку! ✅</h1>

<p>{{ $name }}, ваш заказ <strong class="highlight">{{ $orderNumber }}</strong> успешно оплачен.</p>

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
  <a href="{{ config('app.frontend_url') }}/checkout/success?order={{ $orderNumber }}" class="btn">Скачать шаблоны →</a>
</p>

<p class="muted" style="margin-top: 20px;">
  Шаблоны также доступны в разделе <a href="{{ config('app.frontend_url') }}/account" style="color: #a78bfa;">«Мои покупки»</a>.
  Ссылки для скачивания действительны бессрочно.
</p>
@endsection
