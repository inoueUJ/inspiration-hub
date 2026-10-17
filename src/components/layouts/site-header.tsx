import Link from "next/link"
import Form from "next/form"
import { Suspense } from "react"
import { PenLine, Quote, Search } from "lucide-react"
import { getCategorySummaries } from "@/lib/data/categories"
import { MAX_SEARCH_QUERY_LENGTH } from "@/lib/validators/search"
import { Skeleton } from "@/components/ui/skeleton"
import { buttonVariants } from "@/components/ui/button"
import { NavLink } from "./nav-link"
import { ThemeToggle } from "./theme-toggle"
import { BookmarkLink } from "./bookmark-link"

/**
 * サイトヘッダー - Server Component
 * インタラクティブな部分（テーマ切替・ブックマーク件数・ナビのアクティブ表示）だけを
 * Client Component の島として埋め込む
 */
export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur-md supports-[backdrop-filter]:bg-background/70">
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-3 px-4">
        <Link href="/" className="flex shrink-0 items-center gap-2 font-semibold tracking-tight">
          <span className="inline-flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Quote aria-hidden className="size-4 fill-current" />
          </span>
          <span className="hidden sm:inline">Inspiration Hub</span>
        </Link>

        {/* JS なしでも動く GET フォーム。next/form によりクライアント遷移 + プリフェッチ */}
        <Form action="/search" role="search" className="relative ml-auto w-full max-w-64">
          <label htmlFor="header-search" className="sr-only">
            名言を検索
          </label>
          <Search aria-hidden className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            id="header-search"
            name="q"
            type="search"
            placeholder="名言を検索"
            maxLength={MAX_SEARCH_QUERY_LENGTH}
            autoComplete="off"
            enterKeyHint="search"
            className="h-9 w-full rounded-full border bg-card pr-3 pl-9 text-sm outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/40"
          />
        </Form>

        <nav aria-label="ユーティリティ" className="flex shrink-0 items-center">
          <Link
            href="/submit"
            className={buttonVariants({ variant: "ghost", size: "icon" })}
            aria-label="名言を投稿"
            title="名言を投稿"
          >
            <PenLine aria-hidden className="size-[1.15rem]" />
          </Link>
          <BookmarkLink />
          <ThemeToggle />
        </nav>
      </div>

      <div className="mx-auto max-w-6xl px-4">
        <Suspense fallback={<CategoryNavSkeleton />}>
          <CategoryNav />
        </Suspense>
      </div>
    </header>
  )
}

async function CategoryNav() {
  const categories = await getCategorySummaries()

  return (
    <nav aria-label="カテゴリ" className="scrollbar-none -mx-4 flex gap-1 overflow-x-auto px-4 py-2">
      <NavLink href="/" exact>
        今日の名言
      </NavLink>
      {categories.map((category) => (
        <NavLink key={category.id} href={`/category/${category.id}`}>
          {category.name}
        </NavLink>
      ))}
      <NavLink href="/search">検索</NavLink>
    </nav>
  )
}

function CategoryNavSkeleton() {
  return (
    <div className="flex gap-2 py-2.5">
      {Array.from({ length: 6 }, (_, index) => (
        <Skeleton key={index} className="h-7 w-16 rounded-full" />
      ))}
    </div>
  )
}
