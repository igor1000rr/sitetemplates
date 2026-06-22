/**
 * Безопасная сериализация данных для встраивания в
 * <script type="application/ld+json">.
 *
 * JSON.stringify НЕ экранирует '<', поэтому пользовательское значение вида
 * "</script><script>alert(1)</script>" (например, название шаблона от автора)
 * могло бы вырваться из тега и привести к XSS. Экранируем '<', '>' и '&'
 * в их \uXXXX-формы — этого достаточно, чтобы из <script> нельзя было выйти.
 */
export function safeJsonLd(data: unknown): string {
  return JSON.stringify(data)
    .replace(/</g, '\\u003c')
    .replace(/>/g, '\\u003e')
    .replace(/&/g, '\\u0026')
}
