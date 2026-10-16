import Link from "next/link"
import type { Metadata } from "next"
import { Suspense } from "react"
import { z } from "zod"
import { searchQuotes, MAX_SEARCH_RESULTS } from "@/lib/data/quotes"
import { getCategorySummaries } from "@/lib/data/categories"
import { getAllAuthors } from "@/lib/data/authors"
import { getViewerLikedQuoteIds } from "@/lib/data/viewer"
import { firstParam } from "@/lib/utils/route-params"
import { PageHeader } from "@/components/layouts/page-header"
import { SearchBox } from "@/components/features/search/search-box"
import { QuoteGrid } from "@/components/features/quote/quote-grid"
import { QuoteGridSkeleton } from "@/components/skeletons/quote-grid-skeleton"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"

type SearchParams = Promise<Record<string, string | string[] | undefined>>

interface SearchPageProps {
  searchParams: SearchParams
}

const SearchQuerySchema = z.string().trim().max(100).catch("")

async function getQuery(searchParams: SearchParams): Promise<string> {
  return SearchQuerySchema.parse(firstParam((await searchParams).q) ?? "")
}

export async function generateMetadata({ searchParams }: SearchPageProps): Promise<Metadata> {
  const query = await getQuery(searchParams)
  return {
    title: query ? `「${query}」の検索結果` : "名言を検索",
    robots: query ? { index: false } : undefined,
  }
}

/**
 * 検索ページ
 *
 * URL（?q=）が唯一の状態。SearchBox が transition 内で URL を書き換えると、
 * このページがサーバーで再レンダリングされ、新しい結果がストリーミングされる。
 * 再取得中は直前の結果を表示したまま、group-has-[[data-pending]] で薄く表示する。
 */
export default async function SearchPage({ searchParams }: SearchPageProps) {
  const query = await getQuery(searchParams)

  return (
    <div className="group/search">
      <PageHeader
        breadcrumbs={[{ label: "ホーム", href: "/" }, { label: "検索" }]}
        title="名言を検索"
        description="名言の本文（原文・日本語訳）、人物名、分類名から探せます。"
      />

      <div className="mx-auto max-w-2xl">
        <SearchBox query={query} />
      </div>

      <div className="mt-10 transition-opacity duration-200 group-has-[[data-pending]]/search:opacity-50">
        {query ? (
          <Suspense fallback={<QuoteGridSkeleton />}>
            <SearchResults query={query} />
          </Suspense>
        ) : (
          <Suspense fallback={<SearchSuggestionsSkeleton />}>
            <SearchSuggestions />
          </Suspense>
        )}
      </div>
    </div>
  )
}

async function SearchResults({ query }: { query: string }) {
  const [quotes, likedIds] = await Promise.all([searchQuotes(query), getViewerLikedQuoteIds()])

  return (
    <section aria-labelledby="results-heading" className="space-y-6">
      <h2 id="results-heading" className="text-sm text-muted-foreground" aria-live="polite">
        「<span className="font-semibold text-foreground">{query}</span>」の検索結果：
        {quotes.length >= MAX_SEARCH_RESULTS ? `${MAX_SEARCH_RESULTS}件以上` : `${quotes.length}件`}
      </h2>
      {quotes.length > 0 ? (
        <QuoteGrid quotes={quotes} likedIds={likedIds} highlight={query} />
      ) : (
        <div className="rounded-2xl border border-dashed p-10 text-center text-muted-foreground">
          <p>該当する名言が見つかりませんでした。</p>
          <p className="mt-1 text-sm">別のキーワードや、人物名で検索してみてください。</p>
        </div>
      )}
    </section>
  )
}

/**
 * 検索語が空のときの「探し方」の提案
 */
async function SearchSuggestions() {
  const [categories, authors] = await Promise.all([getCategorySummaries(), getAllAuthors()])

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <section aria-labelledby="suggest-categories" className="space-y-3">
        <h2 id="suggest-categories" className="text-sm font-semibold text-muted-foreground">
          カテゴリ
        </h2>
        <ul className="flex flex-wrap gap-2">
          {categories.map((category) => (
            <li key={category.id}>
              <Badge asChild variant="outline" className="px-3 py-1 text-sm">
                <Link href={`/category/${category.id}`}>{category.name}</Link>
              </Badge>
            </li>
          ))}
        </ul>
      </section>
      <section aria-labelledby="suggest-authors" className="space-y-3">
        <h2 id="suggest-authors" className="text-sm font-semibold text-muted-foreground">
          人物名で探す
        </h2>
        <ul className="flex flex-wrap gap-2">
          {authors.map((author) => (
            <li key={author.id}>
              <Badge asChild variant="secondary" className="px-3 py-1 text-sm">
                <Link href={`/search?q=${encodeURIComponent(author.name)}`} replace>
                  {author.name}
                </Link>
              </Badge>
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}

function SearchSuggestionsSkeleton() {
  return (
    <div className="mx-auto flex max-w-2xl flex-wrap gap-2">
      {Array.from({ length: 10 }, (_, index) => (
        <Skeleton key={index} className="h-7 w-20 rounded-full" />
      ))}
    </div>
  )
}
