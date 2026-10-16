import Link from "next/link"
import { ArrowUpRight } from "lucide-react"
import { getCategorySummaries } from "@/lib/data/categories"
import { Skeleton } from "@/components/ui/skeleton"

/**
 * カテゴリ一覧 - async Server Component
 * ヘッダーのナビと同じ getCategorySummaries を呼ぶが、React.cache によりクエリは1回
 */
export async function CategoryShowcase() {
  const categories = await getCategorySummaries()

  return (
    <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
      {categories.map((category) => (
        <li key={category.id}>
          <Link
            href={`/category/${category.id}`}
            className="group flex h-full flex-col justify-between gap-6 rounded-2xl border bg-card p-5 transition-[border-color,box-shadow,transform] hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none"
          >
            <div className="flex items-start justify-between gap-2">
              <span className="text-lg font-semibold">{category.name}</span>
              <ArrowUpRight aria-hidden className="size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-primary" />
            </div>
            <dl className="flex gap-4 text-xs text-muted-foreground">
              <div>
                <dt className="sr-only">名言数</dt>
                <dd>
                  <span className="text-base font-semibold text-foreground tabular-nums">{category.quoteCount}</span> 名言
                </dd>
              </div>
              <div>
                <dt className="sr-only">中項目数</dt>
                <dd>
                  <span className="text-base font-semibold text-foreground tabular-nums">{category.subcategoryCount}</span> 分類
                </dd>
              </div>
            </dl>
          </Link>
        </li>
      ))}
    </ul>
  )
}

export function CategoryShowcaseSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
      {Array.from({ length: 5 }, (_, index) => (
        <Skeleton key={index} className="h-32 rounded-2xl" />
      ))}
    </div>
  )
}
