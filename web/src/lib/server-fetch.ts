/**
 * SSR fetch с таймаутом — предотвращает зависание рендера при недоступном API
 */

const API_URL = process.env.API_URL || 'http://localhost:8000'
const FETCH_TIMEOUT = 5000 // 5 секунд макс на запрос

export async function apiFetch<T = any>(
  path: string,
  fallback: T,
  options?: { timeout?: number }
): Promise<T> {
  const timeout = options?.timeout ?? FETCH_TIMEOUT

  try {
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), timeout)

    const res = await fetch(`${API_URL}${path}`, {
      cache: 'no-store',
      signal: controller.signal,
      headers: { Accept: 'application/json' },
    })

    clearTimeout(timer)

    if (!res.ok) return fallback

    const data = await res.json()
    return data
  } catch {
    // Таймаут, сетевая ошибка, API недоступен — возвращаем fallback
    return fallback
  }
}

/**
 * Получить data из пагинированного ответа Laravel
 */
export async function apiFetchData<T = any>(
  path: string,
  fallback: T[] = [] as any
): Promise<T[]> {
  const data = await apiFetch(path, { data: fallback })
  return Array.isArray(data) ? data : (data?.data ?? fallback)
}

/**
 * Получить пагинированный ответ целиком { data, meta }
 */
export async function apiFetchPaginated<T = any>(
  path: string
): Promise<{ data: T[]; meta: Record<string, any> }> {
  const res = await apiFetch(path, { data: [], meta: {} })
  return { data: res?.data ?? [], meta: res?.meta ?? {} }
}

export { API_URL }
