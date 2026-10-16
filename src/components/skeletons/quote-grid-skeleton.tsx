import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"

interface QuoteGridSkeletonProps {
  count?: number
  className?: string
}

/**
 * QuoteGrid用のスケルトンローディングUI
 * 実際のカードと同じグリッド・高さにしてレイアウトシフトを防ぐ
 */
export function QuoteGridSkeleton({ count = 6, className }: QuoteGridSkeletonProps) {
  return (
    <div
      role="status"
      aria-label="名言を読み込み中"
      className={cn("grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3", className)}
    >
      {Array.from({ length: count }, (_, index) => (
        <div key={index} className="flex flex-col rounded-xl border bg-card p-5 sm:p-6">
          <div className="mb-4 flex gap-2">
            <Skeleton className="h-3 w-12" />
            <Skeleton className="h-3 w-16" />
          </div>
          <Skeleton className="mb-2 h-5 w-full" />
          <Skeleton className="mb-2 h-5 w-11/12" />
          <Skeleton className="h-5 w-3/5" />
          <div className="mt-6 flex items-center justify-between">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-6 w-16 rounded-full" />
          </div>
        </div>
      ))}
    </div>
  )
}
