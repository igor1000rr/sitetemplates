<!DOCTYPE html>
<html lang="ru">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>@yield('subject', 'TemplateName')</title>
<style>
  body { margin: 0; padding: 0; background: #07070f; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #e2e2e8; }
  .wrapper { max-width: 600px; margin: 0 auto; padding: 40px 20px; }
  .header { text-align: center; margin-bottom: 32px; }
  .logo { display: inline-flex; align-items: center; gap: 8px; text-decoration: none; color: #fff; font-size: 18px; font-weight: 800; }
  .logo-icon { width: 28px; height: 28px; background: #8b5cf6; border-radius: 8px; display: inline-flex; align-items: center; justify-content: center; }
  .logo .accent { color: #c4b5fd; }
  .card { background: #121220; border: 1px solid rgba(255,255,255,0.05); border-radius: 16px; padding: 32px; margin-bottom: 24px; }
  h1 { font-size: 24px; font-weight: 700; margin: 0 0 16px; letter-spacing: -0.02em; }
  p { color: rgba(255,255,255,0.45); font-size: 15px; line-height: 1.6; margin: 0 0 16px; }
  .btn { display: inline-block; background: #8b5cf6; color: #fff !important; text-decoration: none; padding: 12px 28px; border-radius: 12px; font-size: 14px; font-weight: 700; }
  .btn:hover { background: #7c3aed; }
  .btn-outline { background: transparent; border: 1px solid rgba(255,255,255,0.1); color: rgba(255,255,255,0.5) !important; }
  .items-table { width: 100%; border-collapse: collapse; margin: 16px 0; }
  .items-table td { padding: 10px 0; border-bottom: 1px solid rgba(255,255,255,0.04); font-size: 14px; }
  .items-table .price { text-align: right; color: #c4b5fd; font-weight: 700; }
  .total-row td { border-bottom: none; padding-top: 12px; font-weight: 700; font-size: 16px; }
  .total-row .price { color: #c4b5fd; font-size: 20px; }
  .footer { text-align: center; margin-top: 32px; color: rgba(255,255,255,0.15); font-size: 12px; line-height: 1.8; }
  .footer a { color: rgba(255,255,255,0.25); text-decoration: none; }
  .highlight { color: #c4b5fd; }
  .muted { color: rgba(255,255,255,0.2); font-size: 13px; }
</style>
</head>
<body>
<div class="wrapper">
  <div class="header">
    <a href="{{ config('app.frontend_url') }}" class="logo">
      <span class="logo-icon">⚡</span>
      Template<span class="accent">Name</span>
    </a>
  </div>

  <div class="card">
    @yield('content')
  </div>

  <div class="footer">
    <p>© {{ date('Y') }} TemplateName. Все права защищены.</p>
    <p>
      <a href="{{ config('app.frontend_url') }}">Сайт</a> &nbsp;·&nbsp;
      <a href="{{ config('app.frontend_url') }}/templates">Каталог</a> &nbsp;·&nbsp;
      <a href="{{ config('app.frontend_url') }}/blog">Блог</a>
    </p>
    @hasSection('unsubscribe')
    <p style="margin-top: 16px;">
      <a href="@yield('unsubscribe')" style="color: rgba(255,255,255,0.12);">Отписаться от рассылки</a>
    </p>
    @endif
  </div>
</div>
</body>
</html>
