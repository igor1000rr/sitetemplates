import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Разработка сайта под ключ',
  description: 'Закажите уникальный сайт с индивидуальным дизайном. Профессиональная разработка на WordPress или Tilda под ваш бизнес.',
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}
