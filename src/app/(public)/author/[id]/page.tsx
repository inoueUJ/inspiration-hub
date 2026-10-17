import Link from "next/link"
import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { Suspense } from "react"
import { getAuthorById, getAuthorProfile } from "@/lib/data/authors"
import { getQuotesByAuthor } from "@/lib/data/quotes"
import { getViewerLikedQuoteIds } from "@/lib/data/viewer"
import { parseRouteId, parseRouteIdOrNotFound } from "@/lib/utils/route-params"
import { PageHeader } from "@/components/layouts/page-header"
import { AuthorAvatar } from "@/components/features/author/author-avatar"
import { QuoteCollection } from "@/components/features/quote/quote-collection"
import { QuoteGridSkeleton } from "@/components/skeletons/quote-grid-skeleton"
import { Badge } from "@/components/ui/badge"

interface AuthorPageProps {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: AuthorPageProps): Promise<Metadata> {
  const id = parseRouteId((await params).id)
  const author = id === null ? null : await getAuthorById(id)
  if (!author) return {}

  return {
    title: `${author.name}の名言`,
    description: `${author.name}の名言・格言を紹介します。`,
  }
}

export default async function AuthorPage({ params }: AuthorPageProps) {
  const id = parseRouteIdOrNotFound((await params).id)
  const author = await getAuthorProfile(id)
  if (!author) notFound()

  const quotesPromise = getQuotesByAuthor(id)
  const likedIdsPromise = getViewerLikedQuoteIds()

  return (
    <>
      <PageHeader
        breadcrumbs={[{ label: "ホーム", href: "/" }, { label: author.name }]}
        title={
          <span className="flex items-center gap-4">
            <AuthorAvatar name={author.name} className="size-14 text-2xl sm:size-16" />
            {author.name}
          </span>
        }
        description={`${author.quoteCount}件の名言`}
      >
        {author.categories.length > 0 && (
          <ul className="flex flex-wrap gap-2" aria-label="登場カテゴリ">
            {author.categories.map((category) => (
              <li key={category.id}>
                <Badge asChild variant="outline">
                  <Link href={`/category/${category.id}`}>{category.name}</Link>
                </Badge>
              </li>
            ))}
          </ul>
        )}
      </PageHeader>

      <section aria-label={`${author.name}の名言一覧`}>
        <Suspense fallback={<QuoteGridSkeleton count={Math.min(author.quoteCount, 6) || 3} />}>
          <QuoteCollection quotesPromise={quotesPromise} likedIdsPromise={likedIdsPromise} />
        </Suspense>
      </section>
    </>
  )
}
