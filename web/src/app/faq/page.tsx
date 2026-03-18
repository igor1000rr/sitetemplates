import type { Metadata } from 'next'
import Link from 'next/link'
import { FAQSchema } from '@/components/seo/JsonLd'

export const metadata: Metadata = {
  title: 'FAQ — Частые вопросы',
  description: 'Ответы на частые вопросы о шаблонах, установке, подписке и оплате.',
}

const sections = [
  {
    title: 'Начало работы',
    questions: [
      {
        q: 'Как выбрать шаблон?',
        a: 'Используйте AI-подбор — опишите бизнес, и система подберёт лучшие варианты за 30 секунд. Или просмотрите каталог с фильтрами по нише, платформе и типу сайта.',
      },
      {
        q: 'Чем WordPress отличается от Tilda?',
        a: 'WordPress — полноценная CMS с максимумом гибкости: интернет-магазины, блоги, SEO. Нужен хостинг. Tilda — конструктор, проще в редактировании, идеален для лендингов и визуальных сайтов. Хостинг встроен.',
      },
      {
        q: 'Что входит в шаблон?',
        a: 'ZIP-архив с файлами сайта, инструкция по установке, демо-контент (тексты, изображения). Для WordPress — тема + необходимые плагины. Для Tilda — экспорт проекта.',
      },
    ],
  },
  {
    title: 'Оплата и подписка',
    questions: [
      {
        q: 'Какие способы оплаты?',
        a: 'Банковские карты (Visa, MasterCard, МИР), СБП (Система быстрых платежей) и ЮMoney. Оплата через безопасный шлюз ЮKassa.',
      },
      {
        q: 'Как работает подписка?',
        a: 'Подписка даёт безлимитный доступ ко всем шаблонам каталога. Скачивайте любые шаблоны пока подписка активна. Отменить можно в любой момент в личном кабинете — доступ сохранится до конца оплаченного периода.',
      },
      {
        q: 'Можно ли вернуть деньги?',
        a: 'Да, в течение 14 дней после покупки, если шаблон не был скачан. Напишите на support@templatename.ru.',
      },
      {
        q: 'Что если подписка закончится?',
        a: 'Ранее скачанные шаблоны остаются у вас навсегда. Вы просто не сможете скачивать новые, пока не продлите подписку.',
      },
    ],
  },
  {
    title: 'Установка',
    questions: [
      {
        q: 'Как установить шаблон WordPress?',
        a: '1) Скачайте ZIP-архив из личного кабинета. 2) Зайдите в админку WordPress → Внешний вид → Темы → Добавить → Загрузить. 3) Загрузите ZIP и активируйте тему. Или используйте One-Click Deploy — укажите FTP-доступы, и шаблон установится автоматически.',
      },
      {
        q: 'Как установить шаблон Tilda?',
        a: '1) Скачайте архив. 2) В Tilda: Настройки проекта → Импорт → загрузите файл. Подробная инструкция в каждом архиве.',
      },
      {
        q: 'Что такое One-Click Deploy?',
        a: 'Автоматическая установка на ваш хостинг. Укажите FTP или SFTP доступы — и шаблон загрузится автоматически. Не нужно скачивать и загружать вручную.',
      },
      {
        q: 'Какой хостинг нужен?',
        a: 'Для WordPress: PHP 8.1+, MySQL 5.7+, 256MB RAM. Подойдёт любой хостинг: Timeweb, Beget, REG.RU, Hostinger. Для Tilda хостинг не нужен — он встроен.',
      },
    ],
  },
  {
    title: 'Для авторов',
    questions: [
      {
        q: 'Как стать автором?',
        a: 'Зарегистрируйтесь и перейдите в раздел «Стать автором». Заполните профиль, загрузите первый шаблон — и после модерации он появится в каталоге.',
      },
      {
        q: 'Сколько я буду зарабатывать?',
        a: 'Авторы получают 70% с каждой продажи. Выплаты — от 1 000 ₽, на карту или электронный кошелёк. Заявку на выплату можно создать в панели автора.',
      },
    ],
  },
  {
    title: 'Реферальная программа',
    questions: [
      {
        q: 'Как заработать на рефералах?',
        a: 'Поделитесь реферальной ссылкой из личного кабинета. С каждой покупки приглашённого друга вы получаете 10% на баланс.',
      },
      {
        q: 'Как вывести реферальный баланс?',
        a: 'Реферальный баланс можно использовать для оплаты шаблонов и подписки. Вывод на карту пока недоступен.',
      },
    ],
  },
]

export default function FaqPage() {
  const allQuestions = sections.flatMap(s => s.questions.map(q => ({ question: q.q, answer: q.a })))

  return (
    <main className="min-h-screen pt-[100px] pb-16">
      <FAQSchema items={allQuestions} />
      <div className="max-w-[800px] mx-auto px-8">
        <div className="text-center mb-12">
          <p className="text-accent-light text-[11px] font-bold tracking-[2px] uppercase mb-3">Помощь</p>
          <h1 className="font-display text-[36px] font-bold tracking-tight mb-3">Частые вопросы</h1>
          <p className="text-white/30 text-sm">
            Не нашли ответ?{' '}
            <Link href="/contact" className="text-accent-light hover:text-accent-pale transition">Напишите нам</Link>
            {' '}или спросите в{' '}
            <span className="text-accent-light/60">AI-чате</span> внизу экрана.
          </p>
        </div>

        <div className="space-y-10">
          {sections.map((section) => (
            <div key={section.title}>
              <h2 className="font-display text-lg font-bold mb-4 flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-accent" />
                {section.title}
              </h2>
              <div className="space-y-3">
                {section.questions.map((faq) => (
                  <details key={faq.q} className="group bg-bg-card rounded-xl border border-white/[0.05] overflow-hidden">
                    <summary className="px-5 py-4 cursor-pointer text-sm font-semibold text-white/70 hover:text-white transition flex items-center justify-between list-none">
                      {faq.q}
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"
                        className="text-white/15 group-open:rotate-180 transition-transform shrink-0 ml-3">
                        <polyline points="6 9 12 15 18 9"/>
                      </svg>
                    </summary>
                    <div className="px-5 pb-4 text-white/35 text-sm leading-relaxed border-t border-white/[0.04] pt-3">
                      {faq.a}
                    </div>
                  </details>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-14 bg-bg-card rounded-2xl border border-white/[0.05] p-8 text-center">
          <h3 className="font-bold text-lg mb-2">Остались вопросы?</h3>
          <p className="text-white/25 text-sm mb-5">Наша команда ответит в течение 24 часов</p>
          <div className="flex gap-3 justify-center flex-wrap">
            <Link href="/contact" className="bg-accent text-white px-6 py-2.5 rounded-xl text-sm font-bold hover:bg-accent-dark transition">
              Написать нам
            </Link>
            <a href="https://t.me/templatename_support" target="_blank" rel="noopener"
              className="bg-white/[0.04] border border-white/[0.06] text-white/50 px-6 py-2.5 rounded-xl text-sm font-semibold hover:text-white/80 transition">
              Telegram
            </a>
          </div>
        </div>
      </div>
    </main>
  )
}
