import { getDailyQuotes } from "@/lib/db/queries/daily-quotes"
import { getAllQuotes } from "@/lib/db/queries/quotes"
import { QuoteGrid } from "@/components/features/quote/quote-grid"

/**
 * TOPページ - Server Component
 * 日替わり名言を表示
 */
export default async function HomePage() {
  // 日替わり名言を取得、無ければ全名言を取得
  let quotes = await getDailyQuotes()

  if (quotes.length === 0) {
    const allQuotes = await getAllQuotes()
    quotes = allQuotes.slice(0, 30)
  }

  return (
    <main className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="mb-2 text-4xl font-bold">今日の名言</h1>
        <p className="text-muted-foreground">
          {quotes.length}件の名言が見つかりました
        </p>
      </div>

      <QuoteGrid quotes={quotes} />
    </main>
  )
}

// キャッシング設定（日替わりなので常に最新）
export const revalidate = 0
export const dynamic = "force-dynamic"
