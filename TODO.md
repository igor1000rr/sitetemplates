# TODO — доведение AITempl до запуска (прод)

Ветка разработки: `claude/vigilant-keller-v33133`.
Всё готовится здесь и вливается в `main` (= деплой) одним заходом, когда будут
ключи/значения от владельца.

---

## 🔴 Ждёт владельца (ключи / значения)

### 1. S3 (Timeweb) — хранилище файлов шаблонов
Диагностика с прод-сервера (деплой `69feedd`) показала:
- `key=EMPTY`, `secret=EMPTY` — ключи не заданы;
- `use_path_style=false` — неверно (нужно `true`);
- `bucket=templatename` — **похоже на заглушку!** (в `.env.example` — `aitempl`).
  Без правильного имени бакета даже с ключами S3 не заработает.

Проводка готова (коммит `3c8fd33`): инжект `AWS_ACCESS_KEY_ID` /
`AWS_SECRET_ACCESS_KEY` из GitHub Secrets + `use_path_style=true` форсирован в compose.

**Нужно от владельца:**
- [ ] **Access Key ID** + **Secret Access Key** (панель Timeweb → S3 → ключи доступа);
- [ ] **точное имя бакета** (на сервере сейчас `templatename` — подтвердить или дать верное).

**Шаги завершения (делаю я):**
1. Выставить GitHub Secrets `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`;
2. прописать реальный бакет в compose (`api.environment: AWS_BUCKET`);
3. влить ветку → `main` (деплой);
4. проверить `diag:launch` → `S3_CHECK=OK`.

### 2. Остальные интеграции запуска
Все пустые в `.env.example`. Реальное состояние на сервере покажет `diag:launch`
на ближайшем деплое (SET/EMPTY). От владельца нужны значения тех, что окажутся EMPTY:
- [ ] **ЮKassa** — `YUKASSA_SHOP_ID`, `YUKASSA_SECRET_KEY` (приём платежей);
- [ ] **Telegram-бот** — `TELEGRAM_BOT_TOKEN`, `TELEGRAM_ADMIN_CHAT_ID` (уведомления админу);
- [ ] **OpenAI** — `OPENAI_API_KEY` (AI-чат и AI-подбор);
- [ ] **OAuth Google** — `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`;
- [ ] **OAuth Яндекс** — `YANDEX_CLIENT_ID`, `YANDEX_CLIENT_SECRET`;
- [ ] **Аналитика** — `NEXT_PUBLIC_YM_ID` (Яндекс.Метрика), `NEXT_PUBLIC_GA_ID` (GA4).

> 📧 **Почта — на стороне агентства (Resend), у заказчика не запрашиваем.**
> Нужно: `RESEND_API_KEY` (re_…) от агентства → выставить как GitHub Secret +
> подтвердить домен `aitempl.ru` в Resend (DNS: SPF/DKIM). Проводка уже готова
> (Resend по SMTP, инжект ключа в деплое).

### 3. Брендинг
- [ ] Заменить дефолтные иконки / favicon на брендированные (см. `project-summary.md`).

---

## 📍 Где брать ключи (инструкция владельцу)

Все сразу не нужны. Минимум для старта продаж — **S3** + **ЮKassa**.

| Сервис | Где взять | Что получите |
|---|---|---|
| **S3 (Timeweb)** | timeweb.cloud → Облачное хранилище S3 → создать/открыть бакет → «Ключи доступа» | Access Key ID, Secret Key, имя бакета |
| **ЮKassa** | yookassa.ru → личный кабинет → Настройки / Интеграция | shopId, секретный ключ |
| **Telegram** | @BotFather → `/newbot` (токен); написать @userinfobot (ваш chat_id) | bot token, admin chat_id |
| **Почта (Resend)** ⚙️агентство | resend.com → API Keys (+ подтвердить домен в разделе Domains) | RESEND_API_KEY (re_…) |
| **OpenAI** | platform.openai.com → API keys → Create secret key | api key |
| **OAuth Google** | console.cloud.google.com → новый проект → Credentials → OAuth client (тип Web) | client id + secret |
| **OAuth Яндекс** | oauth.yandex.ru → зарегистрировать приложение | client id + secret |
| **Метрика / GA** | metrika.yandex.ru (номер счётчика); analytics.google.com (Measurement ID `G-…`) | YM_ID, GA_ID |

Redirect URI для OAuth: `https://aitempl.ru/api/auth/google/callback` и `https://aitempl.ru/api/auth/yandex/callback`.
Почта (Resend) — на стороне агентства: нужен `RESEND_API_KEY` + подтверждённый домен `aitempl.ru`.

**Приоритет:** 1) S3 + ЮKassa (продажи и выдача файлов) → 2) Telegram (уведомления;
почта Resend уже настроена) → 3) OpenAI / OAuth / аналитика (можно после старта).

---

## 🟢 Сделано без ключей (в ветке, активируется на деплое)
- [x] Проводка инжекта ключей S3 из GitHub Secrets + `use_path_style=true` (`3c8fd33`);
- [x] Аналитика: `NEXT_PUBLIC_*` переданы как **build-args** в `web/Dockerfile` + compose
      (раньше инлайнились пустыми на build → YM/GA не включились бы даже при заданных ID);
- [x] `diag:launch` — расширенная диагностика готовности (S3 + все интеграции,
      SET/EMPTY, без вывода секретов);
- [x] Почта переведена на **Resend** (SMTP): несекретные настройки в compose,
      `RESEND_API_KEY` инжектится из GitHub Secret; ждёт ключ от агентства.

---

## 🧹 После проверки запуска
- [ ] Убрать временную диагностику: команда `diag:launch` в `api/routes/console.php`
      + её вызов в `.github/workflows/main.yml`.
