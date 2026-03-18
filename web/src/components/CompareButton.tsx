'use client'

import { useCompare } from '@/stores/compare'

interface Props {
  template: { id: number; title: string; preview_image?: string }
  size?: 'sm' | 'md'
}

export default function CompareButton({ template, size = 'md' }: Props) {
  const { add, remove, has } = useCompare()
  const isAdded = has(template.id)

  const toggle = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    isAdded ? remove(template.id) : add(template)
  }

  const sz = size === 'sm' ? 'w-7 h-7' : 'w-9 h-9'
  const iconSz = size === 'sm' ? 'w-3.5 h-3.5' : 'w-4 h-4'

  return (
    <button
      onClick={toggle}
      className={`${sz} rounded-lg flex items-center justify-center transition ${
        isAdded
          ? 'bg-accent/15 text-accent-pale'
          : 'bg-white/[0.05] text-white/20 hover:text-accent-pale hover:bg-accent/10'
      }`}
      title={isAdded ? 'Убрать из сравнения' : 'Сравнить'}
    >
      <svg className={iconSz} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <line x1="18" y1="20" x2="18" y2="10" />
        <line x1="12" y1="20" x2="12" y2="4" />
        <line x1="6" y1="20" x2="6" y2="14" />
      </svg>
    </button>
  )
}
