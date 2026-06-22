/**
 * Безопасная сериализация данных для встраивания в
 * <script type="application/ld+json">.
 *
 * JSON.stringify НЕ экранирует '<', поэтому пользовательское значение вида
 * "</script><script>alert(1)</script>" (например, название шаблона от автора)
 * может вырваться из тега и привести к XSS. Экранируем опасные последовательности,
 * включая разделители строк U+2028/U+2029 (невалидны в JS-литералах).
 */
export function safeJsonLd(data: unknown): string {
  return JSON.stringify(data)
    .replace(/</g, '\\u003c')
    .replace(/>/g, '\\u003e')
    .replace(/&/g, '\\u0026')
    .replace(/ /g, '\\u2028')
    .replace(/ /g, '\\u2029')
}
