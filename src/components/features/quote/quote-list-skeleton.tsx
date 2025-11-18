import { Skeleton } from "@/components/ui/skeleton"

/**
 * 名言リストスケルトン
 */
export function QuoteListSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="rounded-lg border p-6">
          <div className="mb-2 flex gap-2">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-4" />
            <Skeleton className="h-4 w-24" />
          </div>
          <Skeleton className="h-20 w-full" />
        </div>
      ))}
    </div>
  )
}
