import { cache } from "react"
import { getDb } from "@/lib/db/client"
import { subcategories, categories, quotes } from "@/lib/db/schema"
import { eq, isNull, sql, and } from "drizzle-orm"
import { CreateSubcategorySchema, UpdateSubcategorySchema } from "@/lib/validators/subcategory"

/**
 * 全中項目を取得（削除済み除外）
 * React.cache() により同一リクエスト内で重複排除
 */
export const getAllSubcategories = cache(async () => {
  const db = await getDb()
  return db
    .select({
      subcategory: subcategories,
      category: categories,
    })
    .from(subcategories)
    .innerJoin(categories, eq(subcategories.categoryId, categories.id))
    .where(
      and(isNull(subcategories.deletedAt), isNull(categories.deletedAt))
    )
    .orderBy(subcategories.name)
})

/**
 * 中項目IDで取得
 * React.cache() により同一リクエスト内で重複排除
 */
export const getSubcategoryById = cache(async (id: number) => {
  const db = await getDb()
  const result = await db
    .select({
      subcategory: subcategories,
      category: categories,
    })
    .from(subcategories)
    .innerJoin(categories, eq(subcategories.categoryId, categories.id))
    .where(eq(subcategories.id, id))
    .where(
      and(isNull(subcategories.deletedAt), isNull(categories.deletedAt))
    )
    .limit(1)

  if (!result[0]) return null

  return {
    ...result[0].subcategory,
    category: result[0].category,
  }
})

/**
 * カテゴリIDで中項目一覧を取得
 * React.cache() により同一リクエスト内で重複排除
 */
export const getSubcategoriesByCategory = cache(async (categoryId: number) => {
  const db = await getDb()
  return db
    .select()
    .from(subcategories)
    .where(eq(subcategories.categoryId, categoryId))
    .where(isNull(subcategories.deletedAt))
    .orderBy(subcategories.name)
})

/**
 * 中項目に属する名言数を取得
 * React.cache() により同一リクエスト内で重複排除
 */
export const getSubcategoryWithCount = cache(async (id: number) => {
  const subcategory = await getSubcategoryById(id)
  if (!subcategory) return null

  const db = await getDb()
  const [quoteCount] = await db
    .select({ count: sql<number>`count(*)` })
    .from(quotes)
    .where(eq(quotes.subcategoryId, id))
    .where(isNull(quotes.deletedAt))

  return {
    ...subcategory,
    _count: {
      quotes: quoteCount.count,
    },
  }
})

/**
 * ミューテーション系（cache不要）
 * Rule 7: Zod による Runtime Validation
 */

/**
 * 中項目を作成
 * Zod validationで入力を検証
 */
export async function createSubcategory(data: unknown) {
  // Runtime validation
  const validated = CreateSubcategorySchema.parse(data)

  const db = await getDb()
  const [subcategory] = await db
    .insert(subcategories)
    .values(validated)
    .returning()

  return subcategory
}

/**
 * 中項目を更新
 * Zod validationで入力を検証
 */
export async function updateSubcategory(id: number, data: unknown) {
  // Runtime validation
  const validated = UpdateSubcategorySchema.parse(data)

  const db = await getDb()
  const [subcategory] = await db
    .update(subcategories)
    .set({
      ...validated,
      updatedAt: new Date(),
    })
    .where(eq(subcategories.id, id))
    .where(isNull(subcategories.deletedAt))
    .returning()

  return subcategory || null
}

/**
 * 中項目を削除（論理削除）
 */
export async function deleteSubcategory(id: number) {
  const db = await getDb()
  const [subcategory] = await db
    .update(subcategories)
    .set({ deletedAt: new Date() })
    .where(eq(subcategories.id, id))
    .returning()

  return subcategory || null
}
