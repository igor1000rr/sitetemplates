import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Заказ оплачен',
  robots: { index: false },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}
