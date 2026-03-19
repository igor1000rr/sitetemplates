/**
 * Простая серверная санитизация HTML контента
 * Удаляет опасные теги (script, iframe, form, object, embed) и on* атрибуты
 * Используется для блог-контента из Filament (только админ пишет, но на всякий случай)
 */
export function sanitizeHtml(html: string): string {
  if (!html) return ''

  return html
    // Удаляем опасные теги с содержимым
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<iframe[\s\S]*?<\/iframe>/gi, '')
    .replace(/<iframe[\s\S]*?\/?>/gi, '')
    .replace(/<object[\s\S]*?<\/object>/gi, '')
    .replace(/<embed[\s\S]*?\/?>/gi, '')
    .replace(/<form[\s\S]*?<\/form>/gi, '')
    .replace(/<input[\s\S]*?\/?>/gi, '')
    .replace(/<textarea[\s\S]*?<\/textarea>/gi, '')
    .replace(/<button[\s\S]*?<\/button>/gi, '')
    // Удаляем on* event handlers из атрибутов
    .replace(/\s+on\w+\s*=\s*"[^"]*"/gi, '')
    .replace(/\s+on\w+\s*=\s*'[^']*'/gi, '')
    // Удаляем javascript: URLs
    .replace(/href\s*=\s*"javascript:[^"]*"/gi, 'href="#"')
    .replace(/src\s*=\s*"javascript:[^"]*"/gi, 'src=""')
}
