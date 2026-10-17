"use client"

import Link from "next/link"
import { Suspense, use, useDeferredValue } from "react"
import { Bookmark, Trash2 } from "lucide-react"
import { clearBookmarks } from "@/lib/bookmarks/store"
import { fetchQuotesByIds } from "@/lib/bookmarks/fetch-quotes"
import { useBookmarkIds } from "@/lib/hooks/use-bookmarks"
import { QuoteGrid } from "@/components/features/quote/quote-grid"
import { QuoteGridSkeleton } from "@/components/skeletons/quote-grid-skeleton"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface BookmarksViewProps {
  likedIds: number[]
}

/**
 * ブックマーク一覧
 *
 * useSyncExternalStore の更新は常に同期（transition にできない）なので、
 * ストアの値で直接サスペンドすると、ブックマークを外すたびに fallback が出てしまう。
 * useDeferredValue を挟むことで「再取得中は前回の結果を表示し続ける」挙動にしている。
 */
export function BookmarksView({ likedIds }: BookmarksViewProps) {
  const ids = useBookmarkIds()
  const deferredIds = useDeferredValue(ids)

  // サーバー / ハイドレーション中はストアの値が未確定
  if (ids === null || deferredIds === null) {
    return <QuoteGridSkeleton count={3} />
  }

  if (ids.length === 0) {
    return (
      <div className="flex min-h-80 flex-col items-center justify-center gap-4 rounded-2xl border border-dashed p-8 text-center">
        <Bookmark aria-hidden className="size-10 text-muted-foreground" />
        <div className="space-y-1">
          <p className="font-medium">まだブックマークがありません</p>
          <p className="text-sm text-muted-foreground">
            心に残った名言の
            <Bookmark aria-label="ブックマーク" className="mx-1 inline size-4 align-text-bottom" />
            を押すと、ここに保存されます。
          </p>
        </div>
        <Button asChild>
          <Link href="/">今日の名言を見る</Link>
        </Button>
      </div>
    )
  }

  const isStale = ids !== deferredIds

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <p className="text-sm text-muted-foreground" aria-live="polite">
          {ids.length}件のブックマーク（この端末のブラウザに保存されています）
        </p>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            if (window.confirm("すべてのブックマークを削除しますか？")) clearBookmarks()
          }}
        >
          <Trash2 aria-hidden />
          すべて削除
        </Button>
      </div>

      <div className={cn("transition-opacity", isStale && "opacity-70")}>
        <Suspense fallback={<QuoteGridSkeleton count={Math.min(ids.length, 6)} />}>
          <BookmarkedQuotes ids={deferredIds} visibleIds={ids} likedIds={likedIds} />
        </Suspense>
      </div>
    </div>
  )
}

interface BookmarkedQuotesProps {
  /** 取得に使う（遅延した）ID一覧 */
  ids: readonly number[]
  /** 現在のID一覧。解除は再取得を待たずに即座に反映する */
  visibleIds: readonly number[]
  likedIds: number[]
}

function BookmarkedQuotes({ ids, visibleIds, likedIds }: BookmarkedQuotesProps) {
  const quotes = use(fetchQuotesByIds(ids))
  const byId = new Map(quotes.map((quote) => [quote.id, quote]))

  // ブックマークした順（新しい順）に並べ、取得済みのものだけ表示
  const ordered = visibleIds.flatMap((id) => byId.get(id) ?? [])

  if (ordered.length === 0) {
    return (
      <p className="rounded-xl border border-dashed p-8 text-center text-muted-foreground">
        ブックマークした名言は現在公開されていません。
      </p>
    )
  }

  return <QuoteGrid quotes={ordered} likedIds={likedIds} />
}
