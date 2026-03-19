import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const alt = 'AITempl — шаблоны сайтов для бизнеса'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #07070f 0%, #121230 100%)',
          padding: '80px',
          fontFamily: 'system-ui, sans-serif',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Decorative circles */}
        <div style={{ position: 'absolute', top: -100, right: -100, width: 600, height: 600, borderRadius: '50%', background: 'rgba(139,92,246,0.06)' }} />
        <div style={{ position: 'absolute', bottom: -80, left: -80, width: 400, height: 400, borderRadius: '50%', background: 'rgba(139,92,246,0.04)' }} />

        {/* Content */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', position: 'relative', zIndex: 1 }}>
          <div style={{ fontSize: 72, fontWeight: 800, color: '#ffffff', lineHeight: 1.1 }}>
            AITempl
          </div>
          <div style={{ fontSize: 36, color: 'rgba(255,255,255,0.5)', lineHeight: 1.3 }}>
            Сайт для бизнеса за 3 минуты
          </div>
          <div style={{ fontSize: 22, color: 'rgba(255,255,255,0.25)', marginTop: '8px' }}>
            326+ шаблонов WordPress и Tilda · AI-подбор · Установка в 1 клик
          </div>
          <div
            style={{
              marginTop: '24px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 220,
              height: 56,
              borderRadius: 14,
              background: 'linear-gradient(90deg, #8b5cf6, #a78bfa)',
              fontSize: 20,
              fontWeight: 600,
              color: '#fff',
            }}
          >
            Смотреть каталог →
          </div>
        </div>
      </div>
    ),
    { ...size }
  )
}
