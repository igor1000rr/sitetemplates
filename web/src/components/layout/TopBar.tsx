'use client'

const items = [
  '✨ AI подберёт шаблон за 30 сек',
  'Безлимит шаблонов от 990 ₽/мес',
  '326+ шаблонов WordPress и Tilda',
  'Установка на хостинг в 1 клик',
  '12 400+ клиентов',
  'Поддержка 24/7',
]

export default function TopBar() {
  return (
    <div className="fixed top-0 left-0 right-0 z-50 h-[30px] bg-accent flex items-center overflow-hidden">
      <div
        className="whitespace-nowrap flex gap-12"
        style={{ animation: 'topbar-scroll 25s linear infinite' }}
      >
        {[...items, ...items, ...items].map((t, i) => (
          <span key={i} className="text-white/90 text-[11.5px] font-semibold">{t}</span>
        ))}
      </div>
    </div>
  )
}
