import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Конфиденциальность',
  description: 'Политика конфиденциальности TemplateName.',

}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}
