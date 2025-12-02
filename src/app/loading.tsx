import { QuoteGridSkeleton } from "@/components/skeletons/quote-grid-skeleton"
import { Skeleton } from "@/components/ui/skeleton"

/**
 * TOPページのローディングUI
 * Next.jsが自動的にSuspenseでラップ
 */
export default function Loading() {
  return (
    <main className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <Skeleton className="h-10 w-48 mb-2" />
        <Skeleton className="h-6 w-64" />
      </div>

      <QuoteGridSkeleton />
    </main>
  )
}
