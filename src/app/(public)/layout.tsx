import type { ReactNode } from "react"
import { SiteHeader } from "@/components/layouts/site-header"
import { SiteFooter } from "@/components/layouts/site-footer"

/**
 * 公開ページ共通レイアウト
 *
 * D1 はリクエスト時の Cloudflare コンテキストからしか取得できないため、
 * 配下のルートはビルド時に静的生成せず、リクエストごとにレンダリングする。
 */
export const dynamic = "force-dynamic"

export default function PublicLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <div className="flex min-h-dvh flex-col">
      <a
        href="#main"
        className="sr-only z-50 rounded-md bg-primary px-4 py-2 text-primary-foreground focus:not-sr-only focus:fixed focus:top-3 focus:left-3"
      >
        本文へスキップ
      </a>
      <SiteHeader />
      <main id="main" className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:py-12">
        {children}
      </main>
      <SiteFooter />
    </div>
  )
}
