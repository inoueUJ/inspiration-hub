import Link from "next/link"
import { getAuthorsByCategory } from "@/lib/data/authors"
import { Skeleton } from "@/components/ui/skeleton"
import { AuthorAvatar } from "./author-avatar"

interface CategoryAuthorsProps {
  categoryId: number
}

/**
 * カテゴリに登場する人物一覧（名言数の多い順）- async Server Component
 */
export async function CategoryAuthors({ categoryId }: CategoryAuthorsProps) {
  const authors = await getAuthorsByCategory(categoryId)
  if (authors.length === 0) return null

  return (
    <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {authors.map((author) => (
        <li key={author.id}>
          <Link
            href={`/author/${author.id}`}
            className="flex items-center gap-3 rounded-xl border bg-card p-3 transition-colors hover:border-primary/40"
          >
            <AuthorAvatar name={author.name} className="size-10 text-base" />
            <span className="min-w-0 flex-1 truncate font-medium">{author.name}</span>
            <span className="text-xs text-muted-foreground tabular-nums">{author.quoteCount}件</span>
          </Link>
        </li>
      ))}
    </ul>
  )
}

export function CategoryAuthorsSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 3 }, (_, index) => (
        <Skeleton key={index} className="h-16 rounded-xl" />
      ))}
    </div>
  )
}
