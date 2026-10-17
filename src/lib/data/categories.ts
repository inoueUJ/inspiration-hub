import { cache } from "react"
import { and, asc, countDistinct, eq, inArray, isNull } from "drizzle-orm"
import { getDb } from "@/lib/db/client"
import { categories, subcategories, quotes, authors } from "@/lib/db/schema"
import { CreateCategorySchema, UpdateCategorySchema } from "@/lib/validators/category"

/**
 * ナビゲーション・一覧表示用のカテゴリ概要
 */
export interface CategorySummary {
  id: number
  name: string
  subcategoryCount: number
  quoteCount: number
}

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
    .orderBy(asc(categories.id))
})

/**
 * 全カテゴリを件数付きで取得
 * ヘッダーのナビゲーションとTOPのカテゴリ一覧で共有（同一リクエスト内で1クエリ）
 */
export const getCategorySummaries = cache(async (): Promise<CategorySummary[]> => {
  const db = await getDb()
  const activeAuthorIds = db
    .select({ id: authors.id })
    .from(authors)
    .where(isNull(authors.deletedAt))

  // LEFT JOIN + countDistinct で「中項目0件」「名言0件」のカテゴリも 0 として返す
  return db
    .select({
      id: categories.id,
      name: categories.name,
      subcategoryCount: countDistinct(subcategories.id),
      quoteCount: countDistinct(quotes.id),
    })
    .from(categories)
    .leftJoin(
      subcategories,
      and(
        eq(subcategories.categoryId, categories.id),
        isNull(subcategories.deletedAt)
      )
    )
    .leftJoin(
      quotes,
      and(
        eq(quotes.subcategoryId, subcategories.id),
        isNull(quotes.deletedAt),
        inArray(quotes.authorId, activeAuthorIds)
      )
    )
    .where(isNull(categories.deletedAt))
    .groupBy(categories.id, categories.name)
    .orderBy(asc(categories.id))
})

/**
 * カテゴリIDで取得
 * React.cache() により generateMetadata と page で同じクエリを共有する
 */
export const getCategoryById = cache(async (id: number) => {
  const db = await getDb()
  const [category] = await db
    .select()
    .from(categories)
    .where(and(eq(categories.id, id), isNull(categories.deletedAt)))
    .limit(1)

  return category ?? null
})

/**
 * カテゴリを件数付きで取得
 */
export const getCategorySummaryById = cache(
  async (id: number): Promise<CategorySummary | null> => {
    const summaries = await getCategorySummaries()
    return summaries.find((summary) => summary.id === id) ?? null
  }
)

/**
 * ミューテーション系（cache不要）
 * Rule 7: Zod による Runtime Validation
 */

/**
 * カテゴリを作成
 * Zod validationで入力を検証
 */
export async function createCategory(data: unknown) {
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
  const validated = UpdateCategorySchema.parse(data)

  const db = await getDb()
  const [category] = await db
    .update(categories)
    .set({
      ...validated,
      updatedAt: new Date(),
    })
    .where(and(eq(categories.id, id), isNull(categories.deletedAt)))
    .returning()

  return category ?? null
}

/**
 * カテゴリを削除（論理削除）
 */
export async function deleteCategory(id: number) {
  const db = await getDb()
  const [category] = await db
    .update(categories)
    .set({ deletedAt: new Date() })
    .where(and(eq(categories.id, id), isNull(categories.deletedAt)))
    .returning()

  return category ?? null
}
