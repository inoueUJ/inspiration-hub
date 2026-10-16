import Link from "next/link"
import { Sparkles } from "lucide-react"
import { pickFeaturedQuote } from "@/lib/data/daily-quotes"
import { formatDateKey } from "@/lib/utils/date"
import type { DailyQuotesResult } from "@/types/quote"
import { LikeButton } from "@/components/features/quote/like-button"
import { BookmarkButton } from "@/components/features/quote/bookmark-button"
import { ShareButton } from "@/components/features/quote/share-button"
import { Skeleton } from "@/components/ui/skeleton"

interface FeaturedQuoteProps {
  todayPromise: Promise<DailyQuotesResult>
  likedIdsPromise: Promise<number[]>
}

/**
 * 「今日の一言」ヒーロー - async Server Component
 * DailyQuotesExplorer と同じ Promise（React.cache で共有）を await するので、
 * クエリは1回しか実行されない
 */
export async function FeaturedQuote({ todayPromise, likedIdsPromise }: FeaturedQuoteProps) {
  const [today, likedIds] = await Promise.all([todayPromise, likedIdsPromise])
  const quote = pickFeaturedQuote(today)

  return (
    <section
      aria-labelledby="featured-heading"
      className="relative overflow-hidden rounded-3xl border bg-gradient-to-br from-accent/80 via-card to-card px-6 py-12 shadow-sm sm:px-12 sm:py-16"
    >
      <span
        aria-hidden
        className="pointer-events-none absolute -top-10 -left-2 font-serif text-[12rem] leading-none text-primary/10 select-none sm:text-[16rem]"
      >
        “
      </span>

      <div className="relative space-y-8">
        <div className="flex flex-wrap items-center gap-3 text-sm">
          <span id="featured-heading" className="inline-flex items-center gap-1.5 font-medium text-primary">
            <Sparkles aria-hidden className="size-4" />
            今日の一言
          </span>
          <time dateTime={today.date} className="text-muted-foreground">
            {formatDateKey(today.date)}
          </time>
        </div>

        {quote ? (
          <figure className="space-y-6">
            <blockquote className="max-w-3xl font-serif text-2xl leading-relaxed tracking-wide text-balance sm:text-4xl sm:leading-snug">
              <Link href={`/quote/${quote.id}`} className="hover:text-primary/90">
                {quote.textJa ?? quote.text}
              </Link>
            </blockquote>
            {quote.textJa && (
              <p lang="en" className="max-w-2xl text-sm text-muted-foreground italic sm:text-base">
                {quote.text}
              </p>
            )}
            <figcaption className="flex flex-wrap items-center justify-between gap-4">
              <div className="text-sm">
                <Link href={`/author/${quote.author.id}`} className="text-base font-semibold hover:text-primary">
                  — {quote.author.name}
                </Link>
                <span className="ml-2 text-muted-foreground">
                  {quote.category.name} / {quote.subcategory.name}
                </span>
              </div>
              <div className="-mr-2 flex items-center">
                <LikeButton quoteId={quote.id} likeCount={quote.likeCount} liked={likedIds.includes(quote.id)} />
                <BookmarkButton quoteId={quote.id} withLabel />
                <ShareButton quote={quote} />
              </div>
            </figcaption>
          </figure>
        ) : (
          <p className="text-muted-foreground">名言の準備中です。しばらくしてからお越しください。</p>
        )}
      </div>
    </section>
  )
}

export function FeaturedQuoteSkeleton() {
  return (
    <div className="space-y-6 rounded-3xl border bg-card px-6 py-12 sm:px-12 sm:py-16">
      <Skeleton className="h-4 w-40" />
      <div className="space-y-3">
        <Skeleton className="h-9 w-full max-w-3xl" />
        <Skeleton className="h-9 w-4/5 max-w-2xl" />
      </div>
      <Skeleton className="h-4 w-32" />
    </div>
  )
}
