import type { Metadata } from 'next'
import dynamic from 'next/dynamic'
import './globals.css'
import TopBar from '@/components/layout/TopBar'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import CompareBar from '@/components/CompareBar'
import AuthProvider from '@/components/layout/AuthProvider'
import { ToastProvider } from '@/components/ui/Toast'
import Analytics from '@/components/seo/Analytics'
import { OrganizationSchema, WebsiteSearchSchema } from '@/components/seo/JsonLd'

// Heavy components — lazy load (not needed at first paint)
const LiveToasts = dynamic(() => import('@/components/shared/LiveToasts'), { ssr: false })
const AiChatWidget = dynamic(() => import('@/components/shared/AiChatWidget'), { ssr: false })
const CookieConsent = dynamic(() => import('@/components/shared/CookieConsent'), { ssr: false })
const ScrollToTop = dynamic(() => import('@/components/shared/ScrollToTop'), { ssr: false })
const EmailCapture = dynamic(() => import('@/components/shared/EmailCapture'), { ssr: false })

export const metadata: Metadata = {
  title: {
    default: 'TemplateName — Сайт для бизнеса за 3 минуты',
    template: '%s | TemplateName',
  },
  description: 'AI подберёт дизайн, напишет тексты и настроит SEO. 326+ шаблонов WordPress и Tilda для любого бизнеса.',
  keywords: ['шаблоны сайтов', 'WordPress', 'Tilda', 'купить шаблон', 'сайт для бизнеса'],
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://templatename.ru'),
  openGraph: {
    type: 'website',
    locale: 'ru_RU',
    siteName: 'TemplateName',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'TemplateName — AI-платформа для запуска сайтов',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    images: ['/og-image.png'],
  },
  alternates: {
    canonical: '/',
  },
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/favicon-32.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: '/icons/icon-192.png',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru">
      <head>
        {/* Preconnect to external origins */}
        <link rel="preconnect" href="https://s3.timeweb.cloud" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://s3.timeweb.cloud" />

        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#8b5cf6" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <OrganizationSchema />
        <WebsiteSearchSchema />
      </head>
      <body className="min-h-screen bg-bg text-white font-sans antialiased">
        <Analytics />
        <AuthProvider>
          <ToastProvider>
            <TopBar />
            <Navbar />
            <div className="relative z-[1]">{children}</div>
            <CompareBar />
            <Footer />
            <LiveToasts />
            <AiChatWidget />
            <CookieConsent />
            <ScrollToTop />
            <EmailCapture />
          </ToastProvider>
          {/* Background orbs */}
          <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
            <div className="absolute -top-[12%] -left-[8%] w-[700px] h-[700px] rounded-full bg-[radial-gradient(circle,rgba(139,92,246,0.06),transparent_60%)] animate-[orb1_22s_ease-in-out_infinite]" />
            <div className="absolute top-[35%] -right-[12%] w-[550px] h-[550px] rounded-full bg-[radial-gradient(circle,rgba(139,92,246,0.04),transparent_60%)] animate-[orb2_28s_ease-in-out_infinite]" />
          </div>
        </AuthProvider>
      </body>
    </html>
  )
}
