import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { Suspense } from "react"
import { getSubcategoryById } from "@/lib/data/subcategories"
import { getQuotesBySubcategory } from "@/lib/data/quotes"
import { getViewerLikedQuoteIds } from "@/lib/data/viewer"
import { parseRouteId, parseRouteIdOrNotFound } from "@/lib/utils/route-params"
import { PageHeader } from "@/components/layouts/page-header"
import { QuoteCollection } from "@/components/features/quote/quote-collection"
import { SubcategoryChips, SubcategoryChipsSkeleton } from "@/components/features/category/subcategory-chips"
import { QuoteGridSkeleton } from "@/components/skeletons/quote-grid-skeleton"

interface SubcategoryPageProps {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: SubcategoryPageProps): Promise<Metadata> {
  const id = parseRouteId((await params).id)
  const subcategory = id === null ? null : await getSubcategoryById(id)
  if (!subcategory) return {}

  return {
    title: `${subcategory.name}の名言（${subcategory.category.name}）`,
    description: `${subcategory.category.name}・${subcategory.name}の名言を${subcategory.quoteCount}件紹介します。`,
  }
}

export default async function SubcategoryPage({ params }: SubcategoryPageProps) {
  const id = parseRouteIdOrNotFound((await params).id)
  const subcategory = await getSubcategoryById(id)
  if (!subcategory) notFound()

  const quotesPromise = getQuotesBySubcategory(id)
  const likedIdsPromise = getViewerLikedQuoteIds()

  return (
    <>
      <PageHeader
        breadcrumbs={[
          { label: "ホーム", href: "/" },
          { label: subcategory.category.name, href: `/category/${subcategory.category.id}` },
          { label: subcategory.name },
        ]}
        eyebrow={subcategory.category.name}
        title={`${subcategory.name}の名言`}
        description={`${subcategory.quoteCount}件の名言`}
      >
        <Suspense fallback={<SubcategoryChipsSkeleton />}>
          <SubcategoryChips categoryId={subcategory.category.id} activeId={id} />
        </Suspense>
      </PageHeader>

      <section aria-label={`${subcategory.name}の名言一覧`}>
        <Suspense fallback={<QuoteGridSkeleton />}>
          <QuoteCollection quotesPromise={quotesPromise} likedIdsPromise={likedIdsPromise} />
        </Suspense>
      </section>
    </>
  )
}
