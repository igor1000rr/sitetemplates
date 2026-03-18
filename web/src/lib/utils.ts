import { clsx, type ClassValue } from 'clsx'

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs)
}

export function formatPrice(kopecks: number): string {
  const rub = kopecks / 100
  return new Intl.NumberFormat('ru-RU').format(rub)
}

export function formatPriceRub(rub: number): string {
  return new Intl.NumberFormat('ru-RU').format(rub)
}

export function pluralize(n: number, one: string, few: string, many: string): string {
  const mod10 = n % 10
  const mod100 = n % 100
  if (mod100 >= 11 && mod100 <= 19) return many
  if (mod10 === 1) return one
  if (mod10 >= 2 && mod10 <= 4) return few
  return many
}

// "5 шаблонов", "1 шаблон", "3 шаблона"
export function templateCount(n: number): string {
  return `${n} ${pluralize(n, 'шаблон', 'шаблона', 'шаблонов')}`
}

export function statusLabel(status: string): string {
  const map: Record<string, string> = {
    pending: 'Ожидает оплаты',
    processing: 'Обрабатывается',
    paid: 'Оплачен',
    cancelled: 'Отменён',
    refunded: 'Возврат',
  }
  return map[status] || status
}

export function statusColor(status: string): string {
  const map: Record<string, string> = {
    pending: 'text-yellow-400',
    processing: 'text-blue-400',
    paid: 'text-green-400',
    cancelled: 'text-red-400',
    refunded: 'text-gray-400',
  }
  return map[status] || 'text-white/50'
}
