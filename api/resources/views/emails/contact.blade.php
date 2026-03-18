@extends('emails.layout')

@section('content')
<h2 style="color: #fff; margin-bottom: 8px;">Обратная связь</h2>

<div style="background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.06); border-radius: 12px; padding: 16px; margin: 16px 0;">
    <p style="color: rgba(255,255,255,0.3); font-size: 11px; margin: 0 0 4px;">От:</p>
    <p style="color: rgba(255,255,255,0.7); margin: 0 0 12px;">{{ $name }} ({{ $email }})</p>

    <p style="color: rgba(255,255,255,0.3); font-size: 11px; margin: 0 0 4px;">Тема:</p>
    <p style="color: rgba(255,255,255,0.7); margin: 0 0 12px;">{{ $subject }}</p>

    <p style="color: rgba(255,255,255,0.3); font-size: 11px; margin: 0 0 4px;">Сообщение:</p>
    <p style="color: rgba(255,255,255,0.5); white-space: pre-line; margin: 0;">{{ $message }}</p>
</div>
@endsection
