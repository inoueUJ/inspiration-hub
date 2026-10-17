import Link from "next/link"
import { getSubcategoriesByCategory } from "@/lib/data/subcategories"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"

interface SubcategoryChipsProps {
  categoryId: number
  activeId?: number
}

/**
 * カテゴリ配下の中項目チップ - async Server Component
 */
export async function SubcategoryChips({ categoryId, activeId }: SubcategoryChipsProps) {
  const subcategories = await getSubcategoriesByCategory(categoryId)
  if (subcategories.length === 0) return null

  return (
    <nav aria-label="中項目" className="flex flex-wrap gap-2">
      {subcategories.map((subcategory) => {
        const active = subcategory.id === activeId
        return (
          <Link
            key={subcategory.id}
            href={`/subcategory/${subcategory.id}`}
            aria-current={active ? "page" : undefined}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-sm transition-colors",
              active
                ? "border-foreground bg-foreground text-background"
                : "bg-card hover:border-foreground/40"
            )}
          >
            {subcategory.name}
            <span className={cn("text-xs tabular-nums", active ? "opacity-70" : "text-muted-foreground")}>
              {subcategory.quoteCount}
            </span>
          </Link>
        )
      })}
    </nav>
  )
}

export function SubcategoryChipsSkeleton() {
  return (
    <div className="flex gap-2">
      {Array.from({ length: 3 }, (_, index) => (
        <Skeleton key={index} className="h-8 w-24 rounded-full" />
      ))}
    </div>
  )
}
