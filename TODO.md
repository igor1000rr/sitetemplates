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
- [ ] **Почта (SMTP)** — `MAIL_USERNAME`, `MAIL_PASSWORD` (email-цепочки);
- [ ] **OpenAI** — `OPENAI_API_KEY` (AI-чат и AI-подбор);
- [ ] **OAuth Google** — `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`;
- [ ] **OAuth Яндекс** — `YANDEX_CLIENT_ID`, `YANDEX_CLIENT_SECRET`;
- [ ] **Аналитика** — `NEXT_PUBLIC_YM_ID` (Яндекс.Метрика), `NEXT_PUBLIC_GA_ID` (GA4).

### 3. Брендинг
- [ ] Заменить дефолтные иконки / favicon на брендированные (см. `project-summary.md`).

---

## 🟢 Сделано без ключей (в ветке, активируется на деплое)
- [x] Проводка инжекта ключей S3 из GitHub Secrets + `use_path_style=true` (`3c8fd33`);
- [x] Аналитика: `NEXT_PUBLIC_*` переданы как **build-args** в `web/Dockerfile` + compose
      (раньше инлайнились пустыми на build → YM/GA не включились бы даже при заданных ID);
- [x] `diag:launch` — расширенная диагностика готовности (S3 + все интеграции,
      SET/EMPTY, без вывода секретов).

---

## 🧹 После проверки запуска
- [ ] Убрать временную диагностику: команда `diag:launch` в `api/routes/console.php`
      + её вызов в `.github/workflows/main.yml`.
