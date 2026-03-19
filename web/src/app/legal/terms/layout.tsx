import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Оферта',
  description: 'Публичная оферта — условия использования AITempl.',

}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}
