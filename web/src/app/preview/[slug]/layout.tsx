import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Предпросмотр шаблона',
  robots: { index: false, follow: false },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}
