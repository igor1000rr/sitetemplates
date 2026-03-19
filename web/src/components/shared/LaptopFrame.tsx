'use client'

import { ReactNode } from 'react'

interface Props {
  children: ReactNode
  className?: string
  /** Компактный режим для карточек каталога */
  compact?: boolean
}

/**
 * MacBook-style laptop frame
 * Оборачивает скриншот/контент в реалистичный фрейм ноутбука
 */
export default function LaptopFrame({ children, className = '', compact = false }: Props) {
  return (
    <div className={`laptop-frame ${className}`}>
      {/* Крышка ноутбука */}
      <div className={`
        relative mx-auto rounded-t-[12px] border-[2px] border-b-0
        border-[#3a3a4a] bg-[#1c1c2a]
        ${compact ? 'w-[94%] pt-[3px] px-[3px]' : 'w-[90%] pt-[6px] px-[6px]'}
      `}>
        {/* Камера */}
        <div className={`
          mx-auto rounded-full bg-[#2a2a3a] border border-[#3a3a4a]
          ${compact ? 'w-[5px] h-[5px] mb-[3px]' : 'w-[6px] h-[6px] mb-[5px]'}
        `}>
          <div className={`
            rounded-full bg-[#1a1a2a] mx-auto mt-[1px]
            ${compact ? 'w-[2px] h-[2px]' : 'w-[3px] h-[3px]'}
          `} />
        </div>

        {/* Экран */}
        <div className={`
          relative overflow-hidden bg-black
          ${compact ? 'rounded-[4px]' : 'rounded-[6px]'}
        `}>
          {children}
        </div>
      </div>

      {/* Нижняя часть — основание ноутбука */}
      <div className="relative mx-auto" style={{ width: '100%' }}>
        {/* Петля */}
        <div className={`
          mx-auto bg-gradient-to-b from-[#3a3a4a] to-[#2a2a3a]
          ${compact ? 'w-[94%] h-[3px] rounded-b-[2px]' : 'w-[90%] h-[4px] rounded-b-[3px]'}
        `} />
        {/* Основание с выемкой */}
        <div className={`
          mx-auto bg-gradient-to-b from-[#2a2a3a] to-[#222233] border border-t-0 border-[#3a3a4a]/50
          ${compact
            ? 'w-[100%] h-[6px] rounded-b-[6px]'
            : 'w-[104%] -ml-[2%] h-[10px] rounded-b-[8px]'
          }
        `}>
          {/* Выемка для открытия крышки */}
          <div className={`
            mx-auto bg-[#3a3a4a]/40 rounded-b-full
            ${compact ? 'w-[20%] h-[2px]' : 'w-[16%] h-[3px]'}
          `} />
        </div>
      </div>
    </div>
  )
}
