import { Suspense } from "react"
import { getDailyQuotes } from "@/lib/data/daily-quotes"
import { getAllQuotes } from "@/lib/data/quotes"
import { QuoteGrid } from "@/components/features/quote/quote-grid"
import { QuoteGridSkeleton } from "@/components/skeletons/quote-grid-skeleton"

/**
 * TOPページ - Server Component
 * 日替わり名言を表示
 *
 * Rule 3: 粒度の細かい Suspense 境界
 * - ヘッダーは即座にレンダリング
 * - データ取得部分のみSuspense境界で分離
 */
export default function HomePage() {
  return (
    <main className="container mx-auto py-8 px-4">
      {/* ヘッダーはすぐにレンダリング */}
      <header className="mb-8">
        <h1 className="mb-2 text-4xl font-bold">今日の名言</h1>
        <p className="text-muted-foreground">
          毎日30件の厳選された名言をお届けします
        </p>
      </header>

      {/* データ取得部分のみSuspense境界で分離 */}
      <Suspense fallback={<QuoteGridSkeleton />}>
        <DailyQuotesSection />
      </Suspense>
    </main>
  )
}

/**
 * 日替わり名言セクション - Server Component
 * データ取得を含むコンポーネント
 */
async function DailyQuotesSection() {
  // 日替わり名言を取得、無ければ全名言を取得
  let quotes = await getDailyQuotes()

  if (quotes.length === 0) {
    const allQuotes = await getAllQuotes()
    quotes = allQuotes.slice(0, 30)
  }

  return <QuoteGrid quotes={quotes} />
}

// キャッシング設定（日替わりなので常に最新）
export const revalidate = 0
export const dynamic = "force-dynamic"
