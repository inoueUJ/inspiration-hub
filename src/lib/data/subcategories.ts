import { cache } from "react"
import { and, asc, eq, isNull, sql } from "drizzle-orm"
import { getDb } from "@/lib/db/client"
import { subcategories, categories, quotes, authors } from "@/lib/db/schema"
import { CreateSubcategorySchema, UpdateSubcategorySchema } from "@/lib/validators/subcategory"

/**
 * 中項目の概要（所属カテゴリ・名言数付き）
 */
export interface SubcategorySummary {
  id: number
  name: string
  quoteCount: number
  category: { id: number; name: string }
}

/**
 * 中項目配下の公開中の名言数（相関サブクエリ）
 */
const quoteCount = sql<number>`(
  select count(*) from ${quotes}
  inner join ${authors} on ${quotes.authorId} = ${authors.id}
  where ${quotes.subcategoryId} = ${subcategories.id}
    and ${quotes.deletedAt} is null
    and ${authors.deletedAt} is null
)`.mapWith(Number)

const subcategorySummarySelection = {
  id: subcategories.id,
  name: subcategories.name,
  quoteCount,
  category: { id: categories.id, name: categories.name },
}

const isPublished = and(isNull(subcategories.deletedAt), isNull(categories.deletedAt))

/**
 * 全中項目を取得（削除済み除外）
 * React.cache() により同一リクエスト内で重複排除
 */
export const getAllSubcategories = cache(async (): Promise<SubcategorySummary[]> => {
  const db = await getDb()
  return db
    .select(subcategorySummarySelection)
    .from(subcategories)
    .innerJoin(categories, eq(subcategories.categoryId, categories.id))
    .where(isPublished)
    .orderBy(asc(categories.id), asc(subcategories.id))
})

/**
 * 中項目IDで取得（所属カテゴリ・名言数付き）
 * React.cache() により generateMetadata と page で同じクエリを共有する
 */
export const getSubcategoryById = cache(
  async (id: number): Promise<SubcategorySummary | null> => {
    const db = await getDb()
    const [subcategory] = await db
      .select(subcategorySummarySelection)
      .from(subcategories)
      .innerJoin(categories, eq(subcategories.categoryId, categories.id))
      .where(and(eq(subcategories.id, id), isPublished))
      .limit(1)

    return subcategory ?? null
  }
)

/**
 * カテゴリIDで中項目一覧を取得（名言数付き）
 * React.cache() により同一リクエスト内で重複排除
 */
export const getSubcategoriesByCategory = cache(
  async (categoryId: number): Promise<SubcategorySummary[]> => {
    const db = await getDb()
    return db
      .select(subcategorySummarySelection)
      .from(subcategories)
      .innerJoin(categories, eq(subcategories.categoryId, categories.id))
      .where(and(eq(subcategories.categoryId, categoryId), isPublished))
      .orderBy(asc(subcategories.id))
  }
)

/**
 * ミューテーション系（cache不要）
 * Rule 7: Zod による Runtime Validation
 */

/**
 * 中項目を作成
 * Zod validationで入力を検証
 */
export async function createSubcategory(data: unknown) {
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
  const validated = UpdateSubcategorySchema.parse(data)

  const db = await getDb()
  const [subcategory] = await db
    .update(subcategories)
    .set({
      ...validated,
      updatedAt: new Date(),
    })
    .where(and(eq(subcategories.id, id), isNull(subcategories.deletedAt)))
    .returning()

  return subcategory ?? null
}

/**
 * 中項目を削除（論理削除）
 */
export async function deleteSubcategory(id: number) {
  const db = await getDb()
  const [subcategory] = await db
    .update(subcategories)
    .set({ deletedAt: new Date() })
    .where(and(eq(subcategories.id, id), isNull(subcategories.deletedAt)))
    .returning()

  return subcategory ?? null
}
