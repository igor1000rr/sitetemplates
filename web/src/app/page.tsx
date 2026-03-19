import type { Metadata } from 'next'
import type { TemplateListItem, Category } from '@/types'
import HeroSearch from '@/components/home/HeroSearch'
import TemplateCard from '@/components/templates/TemplateCard'
import { apiFetchData } from '@/lib/server-fetch'

export const metadata: Metadata = {
  title: 'AITempl — Шаблоны сайтов для бизнеса',
  description: 'AI-платформа для запуска сайтов. 326+ шаблонов WordPress и Tilda. Готовый сайт за 5 минут.',
}

export const dynamic = 'force-dynamic'

export default async function HomePage() {
  const [templates, categories, newArrivals, reviews] = await Promise.all([
    apiFetchData<TemplateListItem>('/api/templates/featured'),
    apiFetchData<Category>('/api/categories'),
    apiFetchData<TemplateListItem>('/api/templates?sort=newest&per_page=4'),
    apiFetchData('/api/reviews?sort=best&per_page=3&status=approved'),
  ])

  return (
    <main className="min-h-screen">
      {/* Hero */}
      <section className="pt-[65px] pb-9 text-center">
        <div className="max-w-[780px] mx-auto px-8">
          <p className="text-accent-light text-[13px] font-semibold tracking-[1px] uppercase mb-5">
            AI-платформа для запуска сайтов
          </p>
          <h1 className="font-display text-[clamp(36px,5.5vw,68px)] font-bold leading-[1.05] mb-5 tracking-[-3px]">
            Сайт для бизнеса<br />
            <span className="text-accent-pale">за 3 минуты</span>
          </h1>
          <p className="text-white/40 text-[17px] leading-relaxed max-w-[500px] mx-auto mb-5">
            AI подберёт дизайн, напишет тексты и настроит SEO.
            <br />Вам останется нажать «Опубликовать».
          </p>

          <HeroSearch />

          {/* Trust badges */}
          <div className="flex flex-wrap gap-4 justify-center mt-6">
            {['Без кода', 'Русская админка', 'Поддержка 24/7', 'WordPress + Tilda'].map((t) => (
              <span key={t} className="text-white/20 text-[12px] flex items-center gap-1.5">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
                {t}
              </span>
            ))}
          </div>

          {/* AI-подбор кнопка */}
          <div className="mt-6 flex justify-center">
            <a href="/ai-match"
              className="inline-flex items-center gap-2 bg-white/[0.03] border border-accent/15 text-accent-pale/80 px-5 py-2 rounded-full text-[12px] font-medium hover:bg-accent/[0.06] transition">
              <span>✨</span> Не знаете что выбрать? AI подберёт за 30 секунд
            </a>
          </div>
        </div>
      </section>

      {/* AI Features */}
      <section className="max-w-[1000px] mx-auto px-8 mb-14">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {[
            { icon: '🤖', title: 'AI подбирает шаблон', desc: 'Расскажите о бизнесе — AI проанализирует 300+ шаблонов и найдёт идеальный за 30 секунд' },
            { icon: '⚡', title: 'Установка в 1 клик', desc: 'Укажите FTP-доступы — и шаблон автоматически установится на ваш хостинг. Без кода.' },
            { icon: '💬', title: 'AI-чат помощник', desc: 'Задайте любой вопрос в чат — AI ответит, поможет с выбором или настройкой шаблона' },
          ].map((f) => (
            <div key={f.title} className="bg-bg-card rounded-2xl border border-white/[0.05] p-6 hover:border-accent/10 transition">
              <div className="text-2xl mb-3">{f.icon}</div>
              <h3 className="font-bold text-sm mb-2">{f.title}</h3>
              <p className="text-white/25 text-xs leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works — for newbies */}
      <section className="max-w-[1000px] mx-auto px-8 mb-16">
        <div className="text-center mb-8">
          <p className="text-accent-light text-[11px] font-bold tracking-[2px] uppercase mb-2">Просто</p>
          <h2 className="font-display text-[28px] font-bold tracking-tight">Как это работает</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[
            { step: '01', title: 'Выберите шаблон', desc: 'Используйте AI-подбор или найдите в каталоге. Посмотрите Live Preview.' },
            { step: '02', title: 'Оплатите', desc: 'Карта, СБП или ЮMoney. Или оформите подписку для безлимита.' },
            { step: '03', title: 'Скачайте', desc: 'ZIP-архив с шаблоном, инструкцией и исходниками в личном кабинете.' },
            { step: '04', title: 'Запустите', desc: 'Установите через One-Click Deploy или вручную на любой хостинг.' },
          ].map((s) => (
            <div key={s.step} className="relative p-5 bg-bg-card rounded-xl border border-white/[0.05]">
              <div className="text-accent/20 text-[36px] font-extrabold leading-none mb-2">{s.step}</div>
              <h3 className="font-bold text-sm mb-1.5">{s.title}</h3>
              <p className="text-white/25 text-xs leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Niches */}
      <section className="max-w-[1300px] mx-auto px-8 mb-12">
        <div className="flex gap-2.5 overflow-x-auto pb-2">
          {categories.map((cat) => (
            <a
              key={cat.id}
              href={`/templates?category=${cat.slug}`}
              className="min-w-[155px] h-[100px] rounded-[14px] p-4 bg-bg-surface border border-white/[0.05] flex flex-col justify-between hover:border-accent/20 transition shrink-0"
            >
              {cat.icon ? (
                <span className="text-lg">{cat.icon}</span>
              ) : (
                <span className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center text-accent-light text-sm font-bold">
                  {cat.name.charAt(0)}
                </span>
              )}
              <span className="text-[12.5px] font-semibold text-white/65">{cat.name}</span>
            </a>
          ))}
        </div>
      </section>

      {/* Stats */}
      <section className="max-w-[1300px] mx-auto px-8 mb-14">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { n: '326+', l: 'Шаблонов' }, { n: '12.4K', l: 'Клиентов' },
            { n: '4.9', l: 'Средняя оценка' }, { n: '3 мин', l: 'Время запуска' },
          ].map((s) => (
            <div key={s.l} className="text-center">
              <div className="text-accent-pale text-[34px] font-extrabold tracking-tight leading-none mb-1">{s.n}</div>
              <div className="text-white/25 text-[12px] uppercase tracking-[0.5px]">{s.l}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Templates */}
      <section className="max-w-[1300px] mx-auto px-8 pb-16">
        <div className="flex justify-between items-end mb-8">
          <div>
            <p className="text-accent-light text-[11px] font-bold tracking-[2px] uppercase mb-2">Каталог</p>
            <h2 className="font-display text-[28px] font-bold tracking-tight">Популярные шаблоны</h2>
          </div>
          <a href="/templates" className="text-white/30 text-sm hover:text-accent-light transition">Все шаблоны →</a>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 animate-stagger">
          {templates.map((t, i) => (
            <TemplateCard key={t.id} template={t} priority={i < 3} />
          ))}
        </div>

        <div className="text-center mt-12">
          <a href="/templates" className="inline-flex items-center gap-2 bg-accent text-white px-11 py-3.5 rounded-xl text-sm font-bold hover:bg-accent-dark transition">
            Все 326 шаблонов →
          </a>
        </div>
      </section>

      {/* New Arrivals */}
      {newArrivals.length > 0 && (
        <section className="max-w-[1300px] mx-auto px-8 pb-16">
          <div className="flex justify-between items-end mb-8">
            <div>
              <p className="text-green-400/80 text-[11px] font-bold tracking-[2px] uppercase mb-2">Новинки</p>
              <h2 className="font-display text-[28px] font-bold tracking-tight">Только что добавлены</h2>
            </div>
            <a href="/templates?sort=newest" className="text-white/30 text-sm hover:text-accent-light transition">Все новинки →</a>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
            {newArrivals.map((t) => (
              <TemplateCard key={t.id} template={t} />
            ))}
          </div>
        </section>
      )}

      {/* Why Us */}
      <section className="max-w-[1100px] mx-auto px-8 pb-16">
        <div className="text-center mb-10">
          <p className="text-accent-light text-[11px] font-bold tracking-[2px] uppercase mb-2">Преимущества</p>
          <h2 className="font-display text-[34px] font-bold tracking-tight">
            Не просто шаблоны — <span className="text-accent-pale">AI-платформа</span>
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[
            { t: 'AI-подбор шаблона', d: 'Опишите бизнес — AI подберёт идеальный шаблон и сгенерирует контент', i: '🤖' },
            { t: 'Live Preview', d: 'Смотрите как будет выглядеть ваш сайт до покупки в реальном времени', i: '👁️' },
            { t: 'Без кода', d: 'Запуск сайта без единой строчки кода. Всё через визуальный редактор', i: '⚡' },
            { t: 'Русская админка', d: 'Полностью русифицированная панель управления. Поддержка на русском', i: '🇷🇺' },
            { t: 'SEO из коробки', d: 'Мета-теги, микроразметка, sitemap, robots.txt — всё уже настроено', i: '📈' },
            { t: 'Поддержка 24/7', d: 'Telegram-бот, база знаний и живые операторы круглосуточно', i: '💬' },
          ].map((f) => (
            <div key={f.t} className="bg-bg-card rounded-2xl border border-white/[0.05] p-6 hover:border-accent/10 transition">
              <div className="text-2xl mb-4">{f.i}</div>
              <h3 className="text-[15px] font-bold tracking-tight mb-2">{f.t}</h3>
              <p className="text-white/30 text-[13px] leading-relaxed">{f.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Reviews */}
      <section className="max-w-[1100px] mx-auto px-8 pb-16">
        <div className="text-center mb-10">
          <p className="text-accent-light text-[11px] font-bold tracking-[2px] uppercase mb-2">Отзывы</p>
          <h2 className="font-display text-[28px] font-bold tracking-tight mb-2">Что говорят клиенты</h2>
          <p className="text-white/25 text-[13px]">12 400+ пользователей · Средняя оценка 4.9</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {(reviews.length > 0 ? reviews : [
            { name: 'Алексей М.', text: 'Запустил сайт клиники за вечер. Раньше платил агентству 180 000₽, а тут за 4 990₽ получил то же самое.', rating: 5, template_title: 'Стоматология' },
            { name: 'Мария К.', text: 'AI подобрал идеальный шаблон и сгенерировал все тексты для услуг. Экономия минимум 2 недели работы.', rating: 5, template_title: 'Салон красоты' },
            { name: 'Дмитрий В.', text: 'Квиз-шаблон начал генерить заявки с первого дня. Уже окупил покупку в 10 раз за месяц.', rating: 5, template_title: 'Строительство' },
          ]).map((r: any, i: number) => (
            <div key={i} className="bg-bg-card rounded-2xl border border-white/[0.05] p-6">
              <div className="flex gap-0.5 mb-4">
                {[1,2,3,4,5].map((s) => (
                  <svg key={s} width="14" height="14" viewBox="0 0 24 24" fill={s <= r.rating ? '#a78bfa' : 'rgba(255,255,255,0.1)'}>
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01z"/>
                  </svg>
                ))}
              </div>
              <p className="text-white/40 text-sm leading-relaxed mb-4">{r.text}</p>
              <div>
                <div className="text-white/70 text-sm font-semibold">{r.name || r.user_name}</div>
                {r.template_title && <div className="text-white/20 text-xs">о «{r.template_title}»</div>}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section className="max-w-[1000px] mx-auto px-8 pb-16">
        <div className="text-center mb-10">
          <p className="text-accent-light text-[11px] font-bold tracking-[2px] uppercase mb-2">Тарифы</p>
          <h2 className="font-display text-[36px] font-bold tracking-tight mb-2">Окупается с первого клиента</h2>
          <p className="text-white/25 text-[14px]">Сайт от агентства — от 150 000 ₽. У нас — от 990 ₽/мес</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {[
            { name: 'Стартовый', price: '990', desc: '5 скачиваний в месяц', features: ['5 шаблонов/мес', 'Все шаблоны каталога', 'Обновления шаблонов', 'Email-поддержка'] },
            { name: 'Про', price: '1 990', desc: 'Безлимитный доступ', features: ['Безлимит скачиваний', 'Все шаблоны каталога', 'PSD/Figma исходники', 'Приоритетная поддержка', 'Обновления шаблонов'], popular: true },
            { name: 'Агентство', price: '4 990', desc: 'Для студий и фрилансеров', features: ['Безлимит скачиваний', 'Расширенная лицензия', 'White Label', 'PSD/Figma исходники', 'Личный менеджер'] },
          ].map((p) => (
            <div key={p.name} className={`rounded-2xl border p-6 ${p.popular ? 'bg-accent/[0.04] border-accent/20' : 'bg-bg-card border-white/[0.05]'}`}>
              {p.popular && <div className="text-accent-light text-[10px] font-bold uppercase tracking-wider mb-3">Популярный</div>}
              <h3 className="text-lg font-bold mb-1">{p.name}</h3>
              <p className="text-white/25 text-xs mb-4">{p.desc}</p>
              <div className="mb-5">
                <span className={`text-[42px] font-extrabold tracking-tight ${p.popular ? 'text-accent-pale' : 'text-white'}`}>
                  {p.price}
                </span>
                <span className="text-white/25 text-sm ml-1">₽/мес</span>
              </div>
              <div className="space-y-2.5 mb-6">
                {p.features.map((f) => (
                  <div key={f} className="flex items-center gap-2 text-white/40 text-sm">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#a78bfa" strokeWidth="3" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
                    {f}
                  </div>
                ))}
              </div>
              <a href="/pricing" className={`block w-full py-3 rounded-xl text-sm font-bold transition text-center ${p.popular ? 'bg-accent hover:bg-accent-dark text-white' : 'bg-white/[0.04] border border-white/[0.06] text-white/50 hover:text-white/80'}`}>
                Выбрать
              </a>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-[800px] mx-auto px-8 pb-16">
        <div className="bg-bg-card rounded-2xl border border-white/[0.06] p-10 text-center">
          <h3 className="font-display text-[30px] font-bold tracking-tight mb-3">Хватит откладывать</h3>
          <p className="text-white/30 text-sm mb-6 max-w-md mx-auto">
            Пока вы думаете — ваши конкуренты уже запустили сайт и получают клиентов. AI подберёт шаблон за 30 секунд.
          </p>
          <div className="flex gap-3 justify-center flex-wrap">
            <a href="/ai-match" className="inline-flex bg-accent text-white px-10 py-3.5 rounded-xl text-sm font-bold hover:bg-accent-dark transition">
              ✨ AI подберёт шаблон →
            </a>
            <a href="/templates" className="inline-flex bg-white/[0.04] border border-white/[0.06] text-white/50 px-6 py-3.5 rounded-xl text-sm font-semibold hover:text-white/80 transition">
              Весь каталог
            </a>
          </div>
        </div>
      </section>

      {/* Authors CTA */}
      <section className="max-w-[800px] mx-auto px-8 pb-16">
        <div className="bg-bg-surface rounded-2xl border border-white/[0.04] p-8 flex flex-wrap md:flex-nowrap items-center gap-6">
          <div className="flex-1">
            <h3 className="font-display text-[22px] font-bold tracking-tight mb-2">
              Вы разработчик? <span className="text-accent-pale">Зарабатывайте с нами</span>
            </h3>
            <p className="text-white/25 text-sm">Загружайте шаблоны, получайте 70% с каждой продажи. Без ограничений.</p>
          </div>
          <a href="/author/register" className="bg-white/[0.04] border border-white/[0.06] text-white/50 px-6 py-2.5 rounded-xl text-sm font-semibold hover:text-white/80 transition shrink-0">
            Стать автором
          </a>
        </div>
      </section>
    </main>
  )
}
