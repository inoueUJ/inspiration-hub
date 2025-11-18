import type { Category as DbCategory, Subcategory as DbSubcategory } from "@/lib/db/schema"

/**
 * カテゴリ型
 */
export type Category = DbCategory

/**
 * 中項目型
 */
export type Subcategory = DbSubcategory

/**
 * カウント付きカテゴリ型
 */
export type CategoryWithCount = Category & {
  _count: {
    subcategories: number
    quotes: number
  }
}

/**
 * カウント付き中項目型
 */
export type SubcategoryWithCount = Subcategory & {
  _count: {
    quotes: number
  }
  category: Category
}

/**
 * カテゴリカードProps
 */
export interface CategoryCardProps {
  category: CategoryWithCount
}

/**
 * 中項目リストProps
 */
export interface SubcategoryListProps {
  subcategories: SubcategoryWithCount[]
}
