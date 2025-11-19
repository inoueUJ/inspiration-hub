import { getDb } from "@/lib/db/client"
import { subcategories, categories, quotes } from "@/lib/db/schema"
import { eq, isNull, sql, and } from "drizzle-orm"

/**
 * 全中項目を取得（削除済み除外）
 */
export async function getAllSubcategories() {
  const db = await getDb();
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
}

/**
 * 中項目IDで取得
 */
export async function getSubcategoryById(id: number) {
  const db = await getDb();
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
}

/**
 * カテゴリIDで中項目一覧を取得
 */
export async function getSubcategoriesByCategory(categoryId: number) {
  const db = await getDb();
  return db
    .select()
    .from(subcategories)
    .where(eq(subcategories.categoryId, categoryId))
    .where(isNull(subcategories.deletedAt))
    .orderBy(subcategories.name)
}

/**
 * 中項目を作成
 */
export async function createSubcategory(
  categoryId: number,
  name: string
) {
  const db = await getDb();
  const [subcategory] = await db
    .insert(subcategories)
    .values({ categoryId, name })
    .returning()

  return subcategory
}

/**
 * 中項目を更新
 */
export async function updateSubcategory(
  id: number,
  data: { categoryId?: number; name?: string }
) {
  const db = await getDb();
  const [subcategory] = await db
    .update(subcategories)
    .set({
      ...data,
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
  const db = await getDb();
  const [subcategory] = await db
    .update(subcategories)
    .set({ deletedAt: new Date() })
    .where(eq(subcategories.id, id))
    .returning()

  return subcategory || null
}

/**
 * 中項目に属する名言数を取得
 */
export async function getSubcategoryWithCount(id: number) {
  const subcategory = await getSubcategoryById(id)
  if (!subcategory) return null

  const db = await getDb();
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
}
