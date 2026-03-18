import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Контакты',
  description: 'Свяжитесь с нами. Поддержка 24/7 по любым вопросам.',

}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}
