/**
 * Лёгкая серверная санитизация HTML для блог-контента.
 * Контент пишет только администратор через Filament, поэтому модель угроз
 * ограничена — это НЕ полноценный санитайзер. Для контента от недоверенных
 * пользователей используйте DOMPurify / sanitize-html (defense-in-depth).
 */
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
    // 4. javascript: в href/src/xlink:href (любое кавычкирование)
    .replace(/(\b(?:href|src|xlink:href)\s*=\s*)(["'])\s*javascript:[^"']*\2/gi, '$1$2#$2')
    .replace(/(\b(?:href|src|xlink:href)\s*=\s*)javascript:[^\s>]+/gi, '$1"#"')
    // 5. data:text/html (XSS); data:image/* намеренно сохраняем
    .replace(/(\b(?:href|src|xlink:href)\s*=\s*)(["'])\s*data:text\/html[^"']*\2/gi, '$1$2#$2')

  return out
}
