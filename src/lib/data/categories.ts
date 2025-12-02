import { cache } from "react"
import { getDb } from "@/lib/db/client"
import { categories, subcategories } from "@/lib/db/schema"
import { eq, isNull, sql } from "drizzle-orm"
import { CreateCategorySchema, UpdateCategorySchema } from "@/lib/validators/category"

/**
 * 全カテゴリを取得（削除済み除外）
 * React.cache() により同一リクエスト内で重複排除
 */
export const getAllCategories = cache(async () => {
  const db = await getDb()
  return db
    .select()
    .from(categories)
    .where(isNull(categories.deletedAt))
    .orderBy(categories.name)
})

/**
 * カテゴリIDで取得
 * React.cache() により同一リクエスト内で重複排除
 */
export const getCategoryById = cache(async (id: number) => {
  const db = await getDb()
  const [category] = await db
    .select()
    .from(categories)
    .where(eq(categories.id, id))
    .where(isNull(categories.deletedAt))
    .limit(1)

  return category || null
})

/**
 * カテゴリに属する中項目数を取得
 * React.cache() により同一リクエスト内で重複排除
 */
export const getCategoryWithCounts = cache(async (id: number) => {
  const category = await getCategoryById(id)
  if (!category) return null

  const db = await getDb()
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
})

/**
 * ミューテーション系（cache不要）
 * Rule 7: Zod による Runtime Validation
 */

/**
 * カテゴリを作成
 * Zod validationで入力を検証
 */
export async function createCategory(data: unknown) {
  // Runtime validation
  const validated = CreateCategorySchema.parse(data)

  const db = await getDb()
  const [category] = await db
    .insert(categories)
    .values(validated)
    .returning()

  return category
}

/**
 * カテゴリを更新
 * Zod validationで入力を検証
 */
export async function updateCategory(id: number, data: unknown) {
  // Runtime validation
  const validated = UpdateCategorySchema.parse(data)

  const db = await getDb()
  const [category] = await db
    .update(categories)
    .set({
      ...validated,
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
  const db = await getDb()
  const [category] = await db
    .update(categories)
    .set({ deletedAt: new Date() })
    .where(eq(categories.id, id))
    .returning()

  return category || null
}
