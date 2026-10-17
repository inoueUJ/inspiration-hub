import Link from "next/link"
import { Suspense } from "react"
import { PenLine } from "lucide-react"
import { getTodayQuotes } from "@/lib/data/daily-quotes"
import { getViewerLikedQuoteIds } from "@/lib/data/viewer"
import { FeaturedQuote, FeaturedQuoteSkeleton } from "@/components/features/daily/featured-quote"
import { DailyQuotesExplorer } from "@/components/features/daily/daily-quotes-explorer"
import { CategoryShowcase, CategoryShowcaseSkeleton } from "@/components/features/category/category-showcase"
import { QuoteGridSkeleton } from "@/components/skeletons/quote-grid-skeleton"
import { Button } from "@/components/ui/button"

/**
 * TOPページ - Server Component
 *
 * データ取得は await せずに Promise として開始し、各セクションへ渡す。
 * - 「今日の一言」(Server) と「今日の30選」(Client) は同じ Promise を共有（クエリは1回）
 * - 3つの Suspense 境界がそれぞれ準備でき次第ストリーミングされる（Rule 3）
 */
export default function HomePage() {
  const todayPromise = getTodayQuotes()
  const likedIdsPromise = getViewerLikedQuoteIds()

  return (
    <div className="space-y-20">
      <Suspense fallback={<FeaturedQuoteSkeleton />}>
        <FeaturedQuote todayPromise={todayPromise} likedIdsPromise={likedIdsPromise} />
      </Suspense>

      <section aria-labelledby="daily-heading" className="space-y-6">
        <div className="space-y-2">
          <h2 id="daily-heading" className="text-2xl font-bold tracking-tight sm:text-3xl">
            今日の30選
          </h2>
          <p className="text-muted-foreground">
            毎日0時に入れ替わる、偉人やキャラクターたちの言葉。気になる名言をタップすると背景も読めます。
          </p>
        </div>
        <Suspense fallback={<QuoteGridSkeleton />}>
          <DailyQuotesExplorer todayPromise={todayPromise} likedIdsPromise={likedIdsPromise} />
        </Suspense>
      </section>

      <section aria-labelledby="categories-heading" className="space-y-6">
        <h2 id="categories-heading" className="text-2xl font-bold tracking-tight sm:text-3xl">
          カテゴリから探す
        </h2>
        <Suspense fallback={<CategoryShowcaseSkeleton />}>
          <CategoryShowcase />
        </Suspense>
      </section>

      <section className="flex flex-col items-start gap-4 rounded-3xl border bg-card p-8 sm:flex-row sm:items-center sm:justify-between sm:p-10">
        <div className="space-y-1">
          <h2 className="text-xl font-bold">あなたの心に残る言葉を教えてください</h2>
          <p className="text-sm text-muted-foreground">
            投稿された名言は、確認のうえ掲載させていただきます。
          </p>
        </div>
        <Button asChild size="lg">
          <Link href="/submit">
            <PenLine aria-hidden />
            名言を投稿する
          </Link>
        </Button>
      </section>
    </div>
  )
}
