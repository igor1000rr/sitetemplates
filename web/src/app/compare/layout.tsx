import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Сравнение шаблонов',
  description: 'Сравните характеристики шаблонов и выберите лучший.',

}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}
