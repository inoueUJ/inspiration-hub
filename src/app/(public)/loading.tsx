import { Skeleton } from "@/components/ui/skeleton"
import { QuoteGridSkeleton } from "@/components/skeletons/quote-grid-skeleton"

/**
 * 公開ページ共通のローディングUI（Rule 4）
 * 個別ページは内部の Suspense 境界でさらに細かくストリーミングする
 */
export default function Loading() {
  return (
    <div className="space-y-10">
      <div className="space-y-4">
        <Skeleton className="h-4 w-40" />
        <Skeleton className="h-10 w-72" />
        <Skeleton className="h-5 w-96 max-w-full" />
      </div>
      <QuoteGridSkeleton />
    </div>
  )
}
