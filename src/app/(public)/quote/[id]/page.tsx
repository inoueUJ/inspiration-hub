import Link from "next/link"
import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { Suspense } from "react"
import { getQuoteById, getRelatedQuotes } from "@/lib/data/quotes"
import { getViewerLikedQuoteIds } from "@/lib/data/viewer"
import { parseRouteId, parseRouteIdOrNotFound } from "@/lib/utils/route-params"
import { PageHeader } from "@/components/layouts/page-header"
import { AuthorAvatar } from "@/components/features/author/author-avatar"
import { LikeButton } from "@/components/features/quote/like-button"
import { BookmarkButton } from "@/components/features/quote/bookmark-button"
import { ShareButton } from "@/components/features/quote/share-button"
import { QuoteCollection } from "@/components/features/quote/quote-collection"
import { QuoteGridSkeleton } from "@/components/skeletons/quote-grid-skeleton"

interface QuotePageProps {
  params: Promise<{ id: string }>
}

function truncate(text: string, length: number): string {
  const chars = Array.from(text)
  return chars.length > length ? `${chars.slice(0, length).join("")}…` : text
}

export async function generateMetadata({ params }: QuotePageProps): Promise<Metadata> {
  const id = parseRouteId((await params).id)
  const quote = id === null ? null : await getQuoteById(id)
  if (!quote) return {}

  const body = quote.textJa ?? quote.text
  const title = `「${truncate(body, 32)}」${quote.author.name}`

  return {
    title,
    description: quote.background ?? `${quote.author.name}の名言「${body}」`,
    openGraph: { title, description: body, type: "article" },
  }
}

/**
 * 名言の詳細ページ（シェア用のパーマリンク）
 */
export default async function QuotePage({ params }: QuotePageProps) {
  const id = parseRouteIdOrNotFound((await params).id)
  const [quote, likedIds] = await Promise.all([getQuoteById(id), getViewerLikedQuoteIds()])
  if (!quote) notFound()

  const relatedPromise = getRelatedQuotes(quote.id, quote.author.id, quote.subcategory.id)

  return (
    <div className="space-y-20">
      <article className="space-y-10">
        <PageHeader
          breadcrumbs={[
            { label: "ホーム", href: "/" },
            { label: quote.category.name, href: `/category/${quote.category.id}` },
            { label: quote.subcategory.name, href: `/subcategory/${quote.subcategory.id}` },
            { label: quote.author.name },
          ]}
          title={<span className="sr-only">{quote.author.name}の名言</span>}
        />

        <figure className="relative mx-auto max-w-3xl space-y-8 text-center">
          <span aria-hidden className="block font-serif text-7xl leading-none text-primary/30">
            “
          </span>
          <blockquote className="font-serif text-3xl leading-relaxed tracking-wide text-balance sm:text-4xl sm:leading-snug">
            {quote.textJa ?? quote.text}
          </blockquote>
          {quote.textJa && (
            <p lang="en" className="text-muted-foreground italic">
              {quote.text}
            </p>
          )}
          <figcaption className="flex items-center justify-center gap-3">
            <AuthorAvatar name={quote.author.name} className="size-10 text-base" />
            <Link href={`/author/${quote.author.id}`} className="text-lg font-semibold hover:text-primary">
              {quote.author.name}
            </Link>
          </figcaption>
          <div className="flex items-center justify-center gap-1">
            <LikeButton quoteId={quote.id} likeCount={quote.likeCount} liked={likedIds.includes(quote.id)} />
            <BookmarkButton quoteId={quote.id} withLabel />
            <ShareButton quote={quote} />
          </div>
        </figure>

        {quote.background && (
          <section aria-labelledby="background-heading" className="mx-auto max-w-2xl rounded-2xl bg-muted/70 p-6 sm:p-8">
            <h2 id="background-heading" className="mb-2 font-semibold">
              この言葉の背景
            </h2>
            <p className="leading-relaxed text-muted-foreground">{quote.background}</p>
          </section>
        )}
      </article>

      <section aria-labelledby="related-heading" className="space-y-6">
        <h2 id="related-heading" className="text-xl font-bold">
          こちらの名言もおすすめ
        </h2>
        <Suspense fallback={<QuoteGridSkeleton count={3} />}>
          <QuoteCollection
            quotesPromise={relatedPromise}
            likedIdsPromise={Promise.resolve(likedIds)}
            emptyMessage="関連する名言はまだありません"
          />
        </Suspense>
      </section>
    </div>
  )
}
