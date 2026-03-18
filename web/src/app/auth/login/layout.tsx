import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Вход',
  description: 'Войдите в аккаунт для доступа к покупкам.',
  robots: { index: false },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}
