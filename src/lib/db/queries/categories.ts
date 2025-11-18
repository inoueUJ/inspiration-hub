import { db } from "@/lib/db/client"
import { categories, subcategories } from "@/lib/db/schema"
import { eq, isNull, sql } from "drizzle-orm"

/**
 * 全カテゴリを取得（削除済み除外）
 */
export async function getAllCategories() {
  return db
    .select()
    .from(categories)
    .where(isNull(categories.deletedAt))
    .orderBy(categories.name)
}

/**
 * カテゴリIDで取得
 */
export async function getCategoryById(id: number) {
  const [category] = await db
    .select()
    .from(categories)
    .where(eq(categories.id, id))
    .where(isNull(categories.deletedAt))
    .limit(1)

  return category || null
}

/**
 * カテゴリを作成
 */
export async function createCategory(name: string) {
  const [category] = await db
    .insert(categories)
    .values({ name })
    .returning()

  return category
}

/**
 * カテゴリを更新
 */
export async function updateCategory(id: number, name: string) {
  const [category] = await db
    .update(categories)
    .set({
      name,
      updatedAt: new Date(),
    })
    .where(eq(categories.id, id))
    .where(isNull(categories.deletedAt))
    .returning()

  return category || null
}

/**
 * カテゴリを削除（論理削除）
 */
export async function deleteCategory(id: number) {
  const [category] = await db
    .update(categories)
    .set({ deletedAt: new Date() })
    .where(eq(categories.id, id))
    .returning()

  return category || null
}

/**
 * カテゴリに属する中項目数を取得
 */
export async function getCategoryWithCounts(id: number) {
  const category = await getCategoryById(id)
  if (!category) return null

  const [subcategoryCount] = await db
    .select({ count: sql<number>`count(*)` })
    .from(subcategories)
    .where(eq(subcategories.categoryId, id))
    .where(isNull(subcategories.deletedAt))

  return {
    ...category,
    _count: {
      subcategories: subcategoryCount.count,
    },
  }
}
