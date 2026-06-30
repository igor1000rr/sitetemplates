/**
 * Лёгкая серверная санитизация HTML для блог-контента.
 * Контент пишет только администратор через Filament, поэтому модель угроз
 * ограничена — это НЕ полноценный санитайзер. Для контента от недоверенных
 * пользователей используйте DOMPurify / sanitize-html (defense-in-depth).
 */

const ALLOWED_SCHEMES = ['http', 'https', 'mailto', 'tel']

/**
 * Нормализуем значение URL и пропускаем только безопасные схемы.
 * Декодируем числовые/hex-сущности и убираем пробелы/управляющие символы,
 * которыми обходят простое сравнение строки "javascript:".
 */
function sanitizeUrl(raw: string): string {
  const normalized = raw
    .replace(/&#x([0-9a-fA-F]+);?/g, (_, h) => String.fromCharCode(parseInt(h, 16)))
    .replace(/&#(\d+);?/g, (_, d) => String.fromCharCode(parseInt(d, 10)))
    .replace(/[\u0000-\u0020\u007F]+/g, '')
    .toLowerCase()

  if (!normalized) return '#'

  // data:image/* оставляем (картинки), любые другие data: — запрещаем
  if (normalized.startsWith('data:image/')) return raw

  const scheme = normalized.match(/^([a-z][a-z0-9+.-]*):/)
  // нет схемы → относительная ссылка / якорь / query — разрешено
  if (!scheme) return raw

  return ALLOWED_SCHEMES.includes(scheme[1]) ? raw : '#'
}

export function sanitizeHtml(html: string): string {
  if (!html) return ''

  let out = html

  // 1. Опасные парные теги вместе с содержимым
  const pairTags = ['script', 'style', 'iframe', 'object', 'embed', 'form', 'textarea', 'svg', 'math']
  for (const tag of pairTags) {
    out = out.replace(new RegExp(`<${tag}[\\s\\S]*?</${tag}>`, 'gi'), '')
  }

  // 2. Опасные одиночные/незакрытые теги
  const singleTags = ['script', 'iframe', 'object', 'embed', 'input', 'button', 'link', 'meta', 'base', 'svg']
  for (const tag of singleTags) {
    out = out.replace(new RegExp(`<${tag}\\b[^>]*/?>`, 'gi'), '')
  }

  out = out
    // 3. on*-обработчики: двойные, одинарные кавычки и без кавычек
    .replace(/\son\w+\s*=\s*"[^"]*"/gi, '')
    .replace(/\son\w+\s*=\s*'[^']*'/gi, '')
    .replace(/\son\w+\s*=\s*[^\s>]+/gi, '')
    // 4. href/src/xlink:href: пропускаем только разрешённые схемы (allowlist),
    //    нормализуя кавычки и декодируя обфускацию схемы
    .replace(
      /(\b(?:href|src|xlink:href)\s*=\s*)(?:"([^"]*)"|'([^']*)'|([^\s>]+))/gi,
      (_full, prefix, dq, sq, uq) => {
        const value = dq ?? sq ?? uq ?? ''
        return `${prefix}"${sanitizeUrl(value)}"`
      }
    )

  return out
}
