import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { Suspense } from "react"
import { getCategoryById, getCategorySummaryById } from "@/lib/data/categories"
import { getQuotesByCategory } from "@/lib/data/quotes"
import { getViewerLikedQuoteIds } from "@/lib/data/viewer"
import { parseRouteId, parseRouteIdOrNotFound } from "@/lib/utils/route-params"
import { PageHeader } from "@/components/layouts/page-header"
import { QuoteCollection } from "@/components/features/quote/quote-collection"
import { SubcategoryChips, SubcategoryChipsSkeleton } from "@/components/features/category/subcategory-chips"
import { CategoryAuthors, CategoryAuthorsSkeleton } from "@/components/features/author/category-authors"
import { QuoteGridSkeleton } from "@/components/skeletons/quote-grid-skeleton"

interface CategoryPageProps {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const id = parseRouteId((await params).id)
  const category = id === null ? null : await getCategoryById(id)
  if (!category) return {}

  return {
    title: `${category.name}の名言`,
    description: `${category.name}カテゴリの名言を一覧で紹介します。`,
  }
}

/**
 * カテゴリページ
 * 見出しに必要な最小限だけを await し、一覧系は Promise / 個別の Suspense でストリーミング
 */
export default async function CategoryPage({ params }: CategoryPageProps) {
  const id = parseRouteIdOrNotFound((await params).id)
  const category = await getCategorySummaryById(id)
  if (!category) notFound()

  const quotesPromise = getQuotesByCategory(id)
  const likedIdsPromise = getViewerLikedQuoteIds()

  return (
    <>
      <PageHeader
        breadcrumbs={[{ label: "ホーム", href: "/" }, { label: category.name }]}
        eyebrow="カテゴリ"
        title={`${category.name}の名言`}
        description={`${category.subcategoryCount}つの分類から、${category.quoteCount}件の名言を集めました。`}
      >
        <Suspense fallback={<SubcategoryChipsSkeleton />}>
          <SubcategoryChips categoryId={id} />
        </Suspense>
      </PageHeader>

      <div className="space-y-16">
        <section aria-label={`${category.name}の名言一覧`}>
          <Suspense fallback={<QuoteGridSkeleton />}>
            <QuoteCollection quotesPromise={quotesPromise} likedIdsPromise={likedIdsPromise} />
          </Suspense>
        </section>

        <section aria-labelledby="authors-heading" className="space-y-4">
          <h2 id="authors-heading" className="text-xl font-bold">
            このカテゴリの人物
          </h2>
          <Suspense fallback={<CategoryAuthorsSkeleton />}>
            <CategoryAuthors categoryId={id} />
          </Suspense>
        </section>
      </div>
    </>
  )
}
