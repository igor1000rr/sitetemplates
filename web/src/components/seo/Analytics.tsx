'use client'

import Script from 'next/script'

const YM_ID = process.env.NEXT_PUBLIC_YM_ID
const GA_ID = process.env.NEXT_PUBLIC_GA_ID

export default function Analytics() {
  return (
    <>
      {/* Yandex.Metrika */}
      {YM_ID && (
        <Script id="yandex-metrika" strategy="afterInteractive">
          {`
            (function(m,e,t,r,i,k,a){m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};
            m[i].l=1*new Date();
            for(var j=0;j<document.scripts.length;j++){if(document.scripts[j].src===r){return;}}
            k=e.createElement(t),a=e.getElementsByTagName(t)[0],k.async=1,k.src=r,a.parentNode.insertBefore(k,a)})
            (window, document, "script", "https://mc.yandex.ru/metrika/tag.js", "ym");
            ym(${YM_ID}, "init", {
              clickmap:true,
              trackLinks:true,
              accurateTrackBounce:true,
              webvisor:true,
              ecommerce:"dataLayer"
            });
          `}
        </Script>
      )}

      {/* Google Analytics 4 */}
      {GA_ID && (
        <>
          <Script src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`} strategy="afterInteractive" />
          <Script id="google-analytics" strategy="afterInteractive">
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${GA_ID}');
            `}
          </Script>
        </>
      )}
    </>
  )
}

// ─── Ecommerce tracking helpers ───

export function trackAddToCart(item: { id: number; name: string; price: number; category?: string }) {
  if (typeof window === 'undefined') return

  // Yandex ecommerce
  if ((window as any).dataLayer) {
    (window as any).dataLayer.push({
      ecommerce: {
        add: {
          products: [{
            id: String(item.id),
            name: item.name,
            price: item.price,
            category: item.category || 'Templates',
            quantity: 1,
          }],
        },
      },
    })
  }

  // GA4
  if ((window as any).gtag) {
    (window as any).gtag('event', 'add_to_cart', {
      currency: 'RUB',
      value: item.price,
      items: [{ item_id: String(item.id), item_name: item.name, price: item.price, quantity: 1 }],
    })
  }
}

export function trackPurchase(order: { id: string; total: number; items: { id: number; name: string; price: number }[] }) {
  if (typeof window === 'undefined') return

  // Yandex ecommerce
  if ((window as any).dataLayer) {
    (window as any).dataLayer.push({
      ecommerce: {
        purchase: {
          actionField: { id: order.id, revenue: order.total },
          products: order.items.map(i => ({
            id: String(i.id), name: i.name, price: i.price, quantity: 1,
          })),
        },
      },
    })
  }

  // GA4
  if ((window as any).gtag) {
    (window as any).gtag('event', 'purchase', {
      transaction_id: order.id,
      currency: 'RUB',
      value: order.total,
      items: order.items.map(i => ({ item_id: String(i.id), item_name: i.name, price: i.price, quantity: 1 })),
    })
  }
}

export function trackViewItem(item: { id: number; name: string; price: number; category?: string }) {
  if (typeof window === 'undefined') return

  if ((window as any).dataLayer) {
    (window as any).dataLayer.push({
      ecommerce: {
        detail: {
          products: [{ id: String(item.id), name: item.name, price: item.price, category: item.category || 'Templates' }],
        },
      },
    })
  }

  if ((window as any).gtag) {
    (window as any).gtag('event', 'view_item', {
      currency: 'RUB',
      value: item.price,
      items: [{ item_id: String(item.id), item_name: item.name, price: item.price }],
    })
  }
}
