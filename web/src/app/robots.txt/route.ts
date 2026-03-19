const API_URL = process.env.API_URL || 'http://localhost:8000'

export async function GET() {
  try {
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), 5000)
    const res = await fetch(`${API_URL}/api/robots.txt`, { next: { revalidate: 86400 }, signal: controller.signal })
    clearTimeout(timer)
    const text = await res.text()
    return new Response(text, {
      headers: { 'Content-Type': 'text/plain', 'Cache-Control': 'public, max-age=86400' },
    })
  } catch {
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://aitempl.ru'
    return new Response(
      `User-agent: *\nAllow: /\nDisallow: /account\nDisallow: /cart\nDisallow: /checkout\nDisallow: /auth\nDisallow: /admin\n\nSitemap: ${siteUrl}/sitemap.xml`,
      { headers: { 'Content-Type': 'text/plain' } }
    )
  }
}
