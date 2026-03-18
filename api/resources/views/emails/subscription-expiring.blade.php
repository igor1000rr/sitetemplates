@extends('emails.layout')
@section('subject', 'Подписка заканчивается через {{ $daysLeft }} дн.')

@section('content')
<h1>{{ $name }}, подписка скоро истечёт ⏰</h1>

<p>Ваша подписка <strong class="highlight">{{ $planName }}</strong> заканчивается через <strong>{{ $daysLeft }}</strong> {{ $daysWord }}.</p>

@if($isCancelled)
<p>Вы ранее отменили автопродление. После окончания периода доступ к скачиванию шаблонов будет закрыт.</p>

<p style="text-align: center; margin-top: 24px;">
  <a href="{{ config('app.frontend_url') }}/pricing" class="btn">Возобновить подписку →</a>
</p>
@else
<p>Не переживайте — подписка продлится автоматически. Убедитесь, что на карте достаточно средств.</p>

<p style="text-align: center; margin-top: 24px;">
  <a href="{{ config('app.frontend_url') }}/account/subscription" class="btn-outline btn">Управление подпиской</a>
</p>
@endif
@endsection

@section('unsubscribe')
{{ config('app.frontend_url') }}/account/settings
@endsection
