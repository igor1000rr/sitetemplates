const API_URL = process.env.API_URL || 'http://localhost:8000'

export async function GET() {
  try {
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), 5000)
    const res = await fetch(`${API_URL}/api/sitemap.xml`, { next: { revalidate: 3600 }, signal: controller.signal })
    clearTimeout(timer)
    const xml = await res.text()
    return new Response(xml, {
      headers: { 'Content-Type': 'application/xml', 'Cache-Control': 'public, max-age=3600' },
    })
  } catch {
    return new Response('<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"></urlset>', {
      headers: { 'Content-Type': 'application/xml' },
    })
  }
}
