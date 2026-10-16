"use client"

import { use } from "react"
import { SearchX } from "lucide-react"
import type { QuoteDTO } from "@/types/quote"
import { QuoteGrid } from "./quote-grid"

interface QuoteCollectionProps {
  quotesPromise: Promise<QuoteDTO[]>
  likedIdsPromise: Promise<number[]>
  highlight?: string
  emptyMessage?: string
}

/**
 * Server Component から受け取った Promise を use() で解決して描画する
 *
 * サーバー側では await せずに Promise を作って渡すだけなので、
 * 2つのクエリは並列に走り、ページの他の部分は先にストリーミングされる。
 * 解決待ちの間は最寄りの <Suspense> の fallback が表示される。
 */
export function QuoteCollection({
  quotesPromise,
  likedIdsPromise,
  highlight,
  emptyMessage = "名言がまだありません",
}: QuoteCollectionProps) {
  const quotes = use(quotesPromise)
  const likedIds = use(likedIdsPromise)

  if (quotes.length === 0) {
    return (
      <div className="flex min-h-64 flex-col items-center justify-center gap-3 rounded-xl border border-dashed text-muted-foreground">
        <SearchX aria-hidden className="size-8" />
        <p>{emptyMessage}</p>
      </div>
    )
  }

  return <QuoteGrid quotes={quotes} likedIds={likedIds} highlight={highlight} />
}
