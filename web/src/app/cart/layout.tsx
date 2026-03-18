import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Корзина',
  description: 'Оформите заказ на шаблоны сайтов.',
  robots: { index: false },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}
