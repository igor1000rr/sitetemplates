-- TemplateName Marketplace — Схема БД
-- Stack: Next.js (фронт) + Laravel 11 (API) + PostgreSQL
-- Выполнять: php artisan migrate (Laravel сгенерирует из миграций)
-- Этот файл — справочник структуры

-- ─── ПОЛЬЗОВАТЕЛИ ───

CREATE TABLE users (
    id              BIGSERIAL PRIMARY KEY,
    email           VARCHAR(255) UNIQUE NOT NULL,
    password        VARCHAR(255) NOT NULL,
    name            VARCHAR(255),
    phone           VARCHAR(20),
    role            VARCHAR(20) DEFAULT 'customer', -- customer, author, admin
    avatar          VARCHAR(500),
    email_verified_at TIMESTAMP NULL,
    remember_token  VARCHAR(100),
    created_at      TIMESTAMP DEFAULT NOW(),
    updated_at      TIMESTAMP DEFAULT NOW()
);

CREATE TABLE personal_access_tokens (
    id              BIGSERIAL PRIMARY KEY,
    tokenable_type  VARCHAR(255) NOT NULL,
    tokenable_id    BIGINT NOT NULL,
    name            VARCHAR(255) NOT NULL,
    token           VARCHAR(64) UNIQUE NOT NULL,
    abilities       TEXT,
    last_used_at    TIMESTAMP NULL,
    expires_at      TIMESTAMP NULL,
    created_at      TIMESTAMP DEFAULT NOW(),
    updated_at      TIMESTAMP DEFAULT NOW()
);
CREATE INDEX idx_tokens_tokenable ON personal_access_tokens(tokenable_type, tokenable_id);

-- ─── КАТАЛОГ ───

CREATE TABLE categories (
    id          BIGSERIAL PRIMARY KEY,
    name        VARCHAR(255) NOT NULL,      -- "Стоматология", "Автосервис"
    slug        VARCHAR(255) UNIQUE NOT NULL,
    icon        TEXT,                        -- SVG или URL
    description TEXT,
    sort_order  INT DEFAULT 0,
    is_active   BOOLEAN DEFAULT TRUE,
    created_at  TIMESTAMP DEFAULT NOW(),
    updated_at  TIMESTAMP DEFAULT NOW()
);

CREATE TABLE platforms (
    id          BIGSERIAL PRIMARY KEY,
    name        VARCHAR(255) NOT NULL,      -- "WordPress", "Tilda"
    slug        VARCHAR(255) UNIQUE NOT NULL,
    is_active   BOOLEAN DEFAULT TRUE,
    created_at  TIMESTAMP DEFAULT NOW(),
    updated_at  TIMESTAMP DEFAULT NOW()
);

CREATE TABLE templates (
    id              BIGSERIAL PRIMARY KEY,
    title           VARCHAR(255) NOT NULL,
    slug            VARCHAR(255) UNIQUE NOT NULL,
    description     TEXT,
    short_desc      VARCHAR(500),

    -- Цены (в копейках: 4990 руб = 499000)
    price           INT NOT NULL,
    old_price       INT,

    -- Связи
    category_id     BIGINT NOT NULL REFERENCES categories(id),
    platform_id     BIGINT NOT NULL REFERENCES platforms(id),
    author_id       BIGINT REFERENCES users(id),        -- Фаза 4

    -- Тип
    template_type   VARCHAR(20) DEFAULT 'landing',       -- landing, multipage, shop, quiz

    -- Файлы
    zip_path        VARCHAR(500),                        -- Путь в S3
    zip_size        BIGINT,                              -- Размер в байтах
    demo_url        VARCHAR(500),                        -- Ссылка на демо

    -- Мета (JSON массивы)
    features        JSONB DEFAULT '[]',                  -- ["WooCommerce","Квиз"]
    tags            JSONB DEFAULT '[]',
    tech_specs      JSONB DEFAULT '{}',                  -- {"php":"8.2","wp":"6.4"}

    version         VARCHAR(20) DEFAULT '1.0.0',

    -- SEO
    meta_title      VARCHAR(255),
    meta_desc       VARCHAR(500),

    -- Статистика
    sales_count     INT DEFAULT 0,
    views_count     INT DEFAULT 0,
    rating          DECIMAL(2,1) DEFAULT 0,
    reviews_count   INT DEFAULT 0,

    -- Статус
    status          VARCHAR(20) DEFAULT 'draft',         -- draft, review, published, archived
    is_featured     BOOLEAN DEFAULT FALSE,
    sort_order      INT DEFAULT 0,

    created_at      TIMESTAMP DEFAULT NOW(),
    updated_at      TIMESTAMP DEFAULT NOW(),
    published_at    TIMESTAMP
);

CREATE INDEX idx_templates_category ON templates(category_id);
CREATE INDEX idx_templates_platform ON templates(platform_id);
CREATE INDEX idx_templates_status ON templates(status, is_featured);
CREATE INDEX idx_templates_slug ON templates(slug);
CREATE INDEX idx_templates_price ON templates(price);

CREATE TABLE template_images (
    id          BIGSERIAL PRIMARY KEY,
    template_id BIGINT NOT NULL REFERENCES templates(id) ON DELETE CASCADE,
    path        VARCHAR(500) NOT NULL,       -- Путь в S3
    alt         VARCHAR(255),
    sort_order  INT DEFAULT 0,
    is_main     BOOLEAN DEFAULT FALSE,
    created_at  TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_template_images ON template_images(template_id);

-- ─── ЗАКАЗЫ ───

CREATE TABLE orders (
    id              BIGSERIAL PRIMARY KEY,
    order_number    VARCHAR(30) UNIQUE NOT NULL,  -- TN-20260224-0001
    user_id         BIGINT NOT NULL REFERENCES users(id),

    -- Суммы (копейки)
    subtotal        INT NOT NULL,
    discount        INT DEFAULT 0,
    total           INT NOT NULL,

    -- Промокод
    promo_code_id   BIGINT REFERENCES promo_codes(id),

    -- Оплата
    status          VARCHAR(20) DEFAULT 'pending', -- pending, processing, paid, cancelled, refunded
    payment_id      VARCHAR(255),                  -- ID платежа ЮKassa
    payment_method  VARCHAR(50),                   -- bank_card, yoo_money, sbp
    paid_at         TIMESTAMP,

    -- Мета
    ip              VARCHAR(45),
    user_agent      TEXT,

    created_at      TIMESTAMP DEFAULT NOW(),
    updated_at      TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_orders_user ON orders(user_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_number ON orders(order_number);

CREATE TABLE order_items (
    id          BIGSERIAL PRIMARY KEY,
    order_id    BIGINT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    template_id BIGINT NOT NULL REFERENCES templates(id),
    price       INT NOT NULL,                -- Цена на момент покупки
    created_at  TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_order_items_order ON order_items(order_id);

CREATE TABLE downloads (
    id          BIGSERIAL PRIMARY KEY,
    order_id    BIGINT NOT NULL REFERENCES orders(id),
    user_id     BIGINT NOT NULL REFERENCES users(id),
    template_id BIGINT NOT NULL REFERENCES templates(id),
    ip          VARCHAR(45),
    created_at  TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_downloads_order ON downloads(order_id);

-- ─── ПРОМОКОДЫ ───

CREATE TABLE promo_codes (
    id              BIGSERIAL PRIMARY KEY,
    code            VARCHAR(50) UNIQUE NOT NULL,
    discount_type   VARCHAR(10) NOT NULL,        -- percent, fixed
    discount_value  INT NOT NULL,                -- 20 (%) или 100000 (1000 руб)
    min_order       INT,                         -- Мин. сумма заказа
    max_uses        INT,
    used_count      INT DEFAULT 0,
    is_active       BOOLEAN DEFAULT TRUE,
    expires_at      TIMESTAMP,
    created_at      TIMESTAMP DEFAULT NOW(),
    updated_at      TIMESTAMP DEFAULT NOW()
);

-- ─── ОТЗЫВЫ ───

CREATE TABLE reviews (
    id          BIGSERIAL PRIMARY KEY,
    template_id BIGINT NOT NULL REFERENCES templates(id),
    user_id     BIGINT NOT NULL REFERENCES users(id),
    rating      SMALLINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
    text        TEXT NOT NULL,
    status      VARCHAR(20) DEFAULT 'pending', -- pending, approved, rejected
    created_at  TIMESTAMP DEFAULT NOW(),
    updated_at  TIMESTAMP DEFAULT NOW(),

    UNIQUE(template_id, user_id)
);

CREATE INDEX idx_reviews_template ON reviews(template_id, status);

-- ─── НАСТРОЙКИ ───

CREATE TABLE settings (
    id      BIGSERIAL PRIMARY KEY,
    key     VARCHAR(255) UNIQUE NOT NULL,
    value   TEXT,
    group_name VARCHAR(50) DEFAULT 'general'
);

-- ─── ФАЗА 4: АВТОРЫ ───

CREATE TABLE author_profiles (
    id          BIGSERIAL PRIMARY KEY,
    user_id     BIGINT UNIQUE NOT NULL REFERENCES users(id),
    display_name VARCHAR(255) NOT NULL,
    bio         TEXT,
    website     VARCHAR(500),
    commission  INT DEFAULT 70,               -- % автору
    is_verified BOOLEAN DEFAULT FALSE,
    created_at  TIMESTAMP DEFAULT NOW(),
    updated_at  TIMESTAMP DEFAULT NOW()
);

-- ─── SEED: начальные данные ───

INSERT INTO categories (name, slug, icon, sort_order) VALUES
('Салон красоты', 'salon', NULL, 1),
('Строительство', 'construction', NULL, 2),
('Стоматология', 'dental', NULL, 3),
('Недвижимость', 'realty', NULL, 4),
('Автосервис', 'auto', NULL, 5),
('Доставка еды', 'food', NULL, 6),
('Образование', 'education', NULL, 7),
('Юристы', 'legal', NULL, 8),
('Digital', 'digital', NULL, 9),
('Ресторан', 'restaurant', NULL, 10),
('Медицина', 'medical', NULL, 11),
('Фитнес', 'fitness', NULL, 12);

INSERT INTO platforms (name, slug) VALUES
('WordPress', 'wordpress'),
('Tilda', 'tilda');

-- ─── КАТЕГОРИИ БЛОГА ───

CREATE TABLE post_categories (
    id              BIGSERIAL PRIMARY KEY,
    name            VARCHAR(255) NOT NULL,
    slug            VARCHAR(255) UNIQUE NOT NULL,
    description     TEXT,
    sort_order      INTEGER DEFAULT 0,
    created_at      TIMESTAMP,
    updated_at      TIMESTAMP
);

-- ─── СТАТЬИ БЛОГА ───

CREATE TABLE posts (
    id              BIGSERIAL PRIMARY KEY,
    author_id       BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    category_id     BIGINT REFERENCES post_categories(id) ON DELETE SET NULL,
    title           VARCHAR(300) NOT NULL,
    slug            VARCHAR(255) UNIQUE NOT NULL,
    excerpt         TEXT,
    content         TEXT NOT NULL,
    cover_image     VARCHAR(500),
    tags            JSONB,
    status          VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
    meta_title      VARCHAR(200),
    meta_desc       VARCHAR(500),
    views_count     INTEGER DEFAULT 0,
    reading_time    INTEGER DEFAULT 5,
    published_at    TIMESTAMP,
    created_at      TIMESTAMP,
    updated_at      TIMESTAMP
);

CREATE INDEX idx_posts_status_published ON posts(status, published_at);

-- ─── ПЛАНЫ ПОДПИСОК ───

CREATE TABLE subscription_plans (
    id                   BIGSERIAL PRIMARY KEY,
    name                 VARCHAR(255) NOT NULL,
    slug                 VARCHAR(255) UNIQUE NOT NULL,
    description          TEXT,
    price                INTEGER NOT NULL,
    annual_price         INTEGER,
    downloads_per_month  INTEGER DEFAULT -1,
    features             JSONB,
    is_popular           BOOLEAN DEFAULT FALSE,
    is_active            BOOLEAN DEFAULT TRUE,
    sort_order           INTEGER DEFAULT 0,
    created_at           TIMESTAMP,
    updated_at           TIMESTAMP
);

-- ─── ПОДПИСКИ ───

CREATE TABLE subscriptions (
    id                          BIGSERIAL PRIMARY KEY,
    user_id                     BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    plan_id                     BIGINT NOT NULL REFERENCES subscription_plans(id) ON DELETE CASCADE,
    billing_cycle               VARCHAR(20) DEFAULT 'monthly' CHECK (billing_cycle IN ('monthly', 'annual')),
    status                      VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'cancelled', 'expired', 'past_due')),
    yukassa_subscription_id     VARCHAR(255),
    yukassa_payment_method_id   VARCHAR(255),
    price_paid                  INTEGER NOT NULL,
    downloads_used              INTEGER DEFAULT 0,
    current_period_start        TIMESTAMP,
    current_period_end          TIMESTAMP,
    cancelled_at                TIMESTAMP,
    trial_ends_at               TIMESTAMP,
    created_at                  TIMESTAMP,
    updated_at                  TIMESTAMP
);

CREATE INDEX idx_subscriptions_user_status ON subscriptions(user_id, status);
CREATE INDEX idx_subscriptions_period_end ON subscriptions(current_period_end);

-- ─── ABANDONED CARTS ───

CREATE TABLE abandoned_carts (
    id              BIGSERIAL PRIMARY KEY,
    user_id         BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    items           JSONB NOT NULL,
    total           INTEGER NOT NULL,
    reminder_sent   BOOLEAN DEFAULT FALSE,
    recovered       BOOLEAN DEFAULT FALSE,
    reminded_at     TIMESTAMP,
    created_at      TIMESTAMP,
    updated_at      TIMESTAMP
);

CREATE INDEX idx_abandoned_carts_user ON abandoned_carts(user_id, reminder_sent);

-- ─── РЕФЕРАЛЬНАЯ СИСТЕМА ───

ALTER TABLE users ADD COLUMN referral_code VARCHAR(12) UNIQUE;
ALTER TABLE users ADD COLUMN referred_by BIGINT REFERENCES users(id) ON DELETE SET NULL;
ALTER TABLE users ADD COLUMN referral_balance INTEGER DEFAULT 0;
ALTER TABLE users ADD COLUMN referral_total_earned INTEGER DEFAULT 0;

CREATE TABLE referral_rewards (
    id              BIGSERIAL PRIMARY KEY,
    referrer_id     BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    referred_id     BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    order_id        BIGINT REFERENCES orders(id) ON DELETE SET NULL,
    type            VARCHAR(20) DEFAULT 'order_commission' CHECK (type IN ('signup_bonus', 'order_commission')),
    amount          INTEGER NOT NULL,
    description     VARCHAR(255),
    created_at      TIMESTAMP,
    updated_at      TIMESTAMP
);

CREATE INDEX idx_referral_rewards_referrer ON referral_rewards(referrer_id);

-- ─── ДЕПЛОИ ───

CREATE TABLE deployments (
    id                  BIGSERIAL PRIMARY KEY,
    user_id             BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    template_id         BIGINT NOT NULL REFERENCES templates(id) ON DELETE CASCADE,
    method              VARCHAR(10) DEFAULT 'ftp' CHECK (method IN ('ftp', 'sftp', 'api')),
    status              VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'deploying', 'completed', 'failed')),
    host                VARCHAR(255) NOT NULL,
    port                INTEGER DEFAULT 21,
    username            VARCHAR(255) NOT NULL,
    password_encrypted  TEXT NOT NULL,
    remote_path         VARCHAR(500) DEFAULT '/public_html',
    log                 TEXT,
    error               TEXT,
    started_at          TIMESTAMP,
    completed_at        TIMESTAMP,
    created_at          TIMESTAMP,
    updated_at          TIMESTAMP
);

CREATE INDEX idx_deployments_user_status ON deployments(user_id, status);

-- ─── ИЗБРАННОЕ ───

CREATE TABLE wishlists (
    id              BIGSERIAL PRIMARY KEY,
    user_id         BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    template_id     BIGINT NOT NULL REFERENCES templates(id) ON DELETE CASCADE,
    created_at      TIMESTAMP,
    updated_at      TIMESTAMP,
    UNIQUE(user_id, template_id)
);

CREATE INDEX idx_wishlists_user ON wishlists(user_id);

-- ─── Newsletter ───

CREATE TABLE newsletter_subscribers (
    id              BIGSERIAL PRIMARY KEY,
    email           VARCHAR(255) NOT NULL UNIQUE,
    source          VARCHAR(50) DEFAULT 'popup',
    ip              VARCHAR(45),
    promo_code      VARCHAR(50),
    subscribed_at   TIMESTAMP,
    unsubscribed_at TIMESTAMP,
    created_at      TIMESTAMP,
    updated_at      TIMESTAMP
);

CREATE INDEX idx_newsletter_email ON newsletter_subscribers(email);

-- ─── Social Auth ───

CREATE TABLE social_accounts (
    id              BIGSERIAL PRIMARY KEY,
    user_id         BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    provider        VARCHAR(30) NOT NULL,
    provider_id     VARCHAR(255) NOT NULL,
    provider_token  TEXT,
    provider_refresh_token TEXT,
    created_at      TIMESTAMP,
    updated_at      TIMESTAMP,
    UNIQUE(provider, provider_id)
);

CREATE INDEX idx_social_user ON social_accounts(user_id);

-- ─── ДОП. УСЛУГИ ───

CREATE TABLE services (
    id              BIGSERIAL PRIMARY KEY,
    name            VARCHAR(255) NOT NULL,          -- "Установка на хостинг"
    slug            VARCHAR(255) UNIQUE NOT NULL,
    short_description VARCHAR(500),                 -- Краткое описание для карточки
    description     TEXT,                           -- Полное описание
    price           INT NOT NULL,                   -- Цена в копейках
    icon            VARCHAR(100),                   -- lucide icon name: 'monitor-cog'
    category        VARCHAR(50) DEFAULT 'other',    -- installation, seo, content, analytics, support, other
    estimated_days  INT DEFAULT 3,                  -- Примерный срок выполнения (дни)
    is_popular      BOOLEAN DEFAULT FALSE,          -- Отметка "Популярное"
    is_active       BOOLEAN DEFAULT TRUE,
    sort_order      INT DEFAULT 0,
    created_at      TIMESTAMP DEFAULT NOW(),
    updated_at      TIMESTAMP DEFAULT NOW()
);

CREATE TABLE order_item_services (
    id              BIGSERIAL PRIMARY KEY,
    order_item_id   BIGINT NOT NULL REFERENCES order_items(id) ON DELETE CASCADE,
    service_id      BIGINT NOT NULL REFERENCES services(id),
    price           INT NOT NULL,                   -- Цена на момент покупки
    status          VARCHAR(20) DEFAULT 'pending',  -- pending, in_progress, completed
    completed_at    TIMESTAMP NULL,
    created_at      TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_order_item_services_order ON order_item_services(order_item_id);

-- ─── ЗАЯВКИ НА РАЗРАБОТКУ ПОД КЛЮЧ ───

CREATE TABLE custom_requests (
    id              BIGSERIAL PRIMARY KEY,
    name            VARCHAR(255) NOT NULL,
    email           VARCHAR(255) NOT NULL,
    phone           VARCHAR(30),
    company         VARCHAR(255),
    business_type   VARCHAR(100),                   -- Тип бизнеса
    budget_range    VARCHAR(50),                    -- '30000-50000', '50000-100000', '100000+'
    deadline        VARCHAR(100),                   -- 'Не срочно', '1-2 недели', 'Срочно (3-5 дней)'
    description     TEXT NOT NULL,                  -- Что хочет клиент
    reference_urls  TEXT,                           -- Примеры сайтов (через запятую)
    preferred_platform VARCHAR(50),                 -- WordPress, Tilda, не важно
    status          VARCHAR(20) DEFAULT 'new',      -- new, contacted, in_progress, proposal_sent, approved, completed, cancelled
    assigned_to     BIGINT REFERENCES users(id),    -- Какому разработчику назначено
    admin_notes     TEXT,                           -- Внутренние заметки
    estimated_price INT,                            -- Предварительная оценка (копейки)
    created_at      TIMESTAMP DEFAULT NOW(),
    updated_at      TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_custom_requests_status ON custom_requests(status);
