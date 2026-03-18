import Link from 'next/link'

interface BreadcrumbItem {
  label: string
  href?: string
}

export default function Breadcrumbs({ items }: { items: BreadcrumbItem[] }) {
  return (
    <nav aria-label="Breadcrumb" className="text-white/20 text-[12px] mb-6 flex items-center gap-1.5 flex-wrap">
      <Link href="/" className="hover:text-white/40 transition">Главная</Link>
      {items.map((item, i) => (
        <span key={i} className="flex items-center gap-1.5">
          <span className="text-white/10">/</span>
          {item.href ? (
            <Link href={item.href} className="hover:text-white/40 transition">{item.label}</Link>
          ) : (
            <span className="text-white/35">{item.label}</span>
          )}
        </span>
      ))}
    </nav>
  )
}
