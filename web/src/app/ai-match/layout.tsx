import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'AI-подбор шаблона',
  description: 'AI подберёт идеальный шаблон для вашего бизнеса за 30 секунд.',

}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}
