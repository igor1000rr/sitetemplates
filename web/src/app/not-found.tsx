import Link from 'next/link'

export default function NotFound() {
  return (
    <main className="min-h-screen flex items-center justify-center text-center px-4">
      <div>
        <div className="text-accent-pale text-[80px] font-extrabold tracking-tight leading-none mb-4">404</div>
        <h1 className="font-display text-xl font-bold mb-2">Страница не найдена</h1>
        <p className="text-white/30 text-sm mb-6">Возможно, она была удалена или вы ошиблись адресом</p>
        <Link href="/" className="inline-flex bg-accent text-white px-8 py-3 rounded-xl text-sm font-bold hover:bg-accent-dark transition">
          На главную
        </Link>
      </div>
    </main>
  )
}
