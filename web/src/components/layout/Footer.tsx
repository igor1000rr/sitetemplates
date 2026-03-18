import Link from 'next/link'

const columns = [
  { title: 'Каталог', links: [
    { label: 'WordPress', href: '/templates?platform=wordpress' },
    { label: 'Tilda', href: '/templates?platform=tilda' },
    { label: 'Магазины', href: '/templates?type=shop' },
    { label: 'Лендинги', href: '/templates?type=landing' },
  ]},
  { title: 'Сервис', links: [
    { label: '✨ AI-подбор', href: '/ai-match' },
    { label: 'Live Preview', href: '/templates' },
    { label: 'Тарифы', href: '/pricing' },
    { label: 'Для авторов', href: '/author/register' },
  ]},
  { title: 'Компания', links: [
    { label: 'Блог', href: '/blog' },
    { label: 'Помощь / FAQ', href: '/faq' },
    { label: 'Контакты', href: '/contact' },
    { label: 'Реферальная программа', href: '/account/referral' },
    { label: 'Под ключ', href: '/custom-development' },
    { label: 'Оферта', href: '/legal/terms' },
    { label: 'Конфиденциальность', href: '/legal/privacy' },
  ]},
]

export default function Footer() {
  return (
    <footer className="border-t border-white/[0.04] pt-12 pb-8 px-8 relative z-[1]">
      <div className="max-w-[1200px] mx-auto">
        <div className="flex justify-between flex-wrap gap-10 mb-10">
          <div className="max-w-[260px]">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 rounded-lg bg-accent flex items-center justify-center">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="#fff"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
              </div>
              <span className="text-[15px] font-extrabold tracking-tight">
                Template<span className="text-accent-pale">Name</span>
              </span>
            </div>
            <p className="text-white/20 text-xs leading-relaxed mb-4">
              AI-платформа для запуска сайтов. 326+ шаблонов для любого бизнеса.
            </p>
            <div className="flex gap-3">
              <a href="#" className="w-8 h-8 rounded-lg bg-white/[0.03] flex items-center justify-center text-white/25 hover:text-accent-light hover:bg-accent/10 transition">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M11.944 0A12 12 0 000 12a12 12 0 0024 0A12 12 0 0012 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 01.171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.479.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/></svg>
              </a>
              <a href="#" className="w-8 h-8 rounded-lg bg-white/[0.03] flex items-center justify-center text-white/25 hover:text-accent-light hover:bg-accent/10 transition">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
              </a>
            </div>
          </div>

          {columns.map((col) => (
            <div key={col.title}>
              <h5 className="text-[11px] font-bold text-white/35 uppercase tracking-[1.5px] mb-4">{col.title}</h5>
              <div className="flex flex-col gap-2.5">
                {col.links.map((l) => (
                  <Link key={l.label} href={l.href} className="text-white/20 text-[13px] hover:text-white/50 transition">
                    {l.label}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="pt-6 border-t border-white/[0.03] flex flex-col gap-3 text-white/15 text-[11px]">
          <div className="flex justify-between items-center flex-wrap gap-4">
            <span>© 2026 TemplateName. Все права защищены.</span>
            <div className="flex gap-6">
              <Link href="/legal/privacy" className="hover:text-white/30 transition">Политика конфиденциальности</Link>
              <Link href="/legal/terms" className="hover:text-white/30 transition">Оферта</Link>
            </div>
          </div>
          <p className="text-white/10 text-[10px]">
            ИП Гладкий Сергей Владимирович · ИНН 502754420766 · ОГРНИП 326508100130650
          </p>
        </div>
      </div>
    </footer>
  )
}
