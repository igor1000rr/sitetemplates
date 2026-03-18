'use client'

export default function SocialAuthButtons() {
  const apiBase = process.env.NEXT_PUBLIC_API_URL || ''

  return (
    <div>
      <div className="flex items-center gap-3 my-5">
        <div className="flex-1 h-px bg-white/[0.06]" />
        <span className="text-white/15 text-[11px] uppercase tracking-wider">или</span>
        <div className="flex-1 h-px bg-white/[0.06]" />
      </div>

      <div className="flex gap-2.5">
        {/* Google */}
        <a
          href={`${apiBase}/api/auth/social/google`}
          className="flex-1 flex items-center justify-center gap-2.5 px-4 py-3 bg-white/[0.04] border border-white/[0.06] rounded-xl text-sm font-medium text-white/50 hover:text-white/80 hover:bg-white/[0.06] hover:border-white/10 transition"
        >
          <svg width="16" height="16" viewBox="0 0 24 24">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          Google
        </a>

        {/* Yandex */}
        <a
          href={`${apiBase}/api/auth/social/yandex`}
          className="flex-1 flex items-center justify-center gap-2.5 px-4 py-3 bg-white/[0.04] border border-white/[0.06] rounded-xl text-sm font-medium text-white/50 hover:text-white/80 hover:bg-white/[0.06] hover:border-white/10 transition"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="11" fill="#FC3F1D"/>
            <path d="M13.63 18.71h-1.96V7.24c-.74 0-1.62.18-2.2.72-.68.64-.96 1.56-.96 2.7 0 1.46.54 2.22 1.7 3.24l1.4 1.2-3.24 3.61H6.17l2.78-3.12c-1.46-1.3-2.26-2.54-2.26-4.72 0-3.1 1.96-5.06 5.02-5.06h1.92v12.9z" fill="#fff"/>
          </svg>
          Яндекс
        </a>
      </div>
    </div>
  )
}
