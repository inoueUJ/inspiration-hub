import { cache } from "react"
import { getDb } from "@/lib/db/client"
import {
  quotes,
  authors,
  subcategories,
  categories,
} from "@/lib/db/schema"
import { eq, isNull, or, like, and, desc } from "drizzle-orm"
import { CreateQuoteSchema, UpdateQuoteSchema } from "@/lib/validators/quote"

/**
 * 名言を詳細情報付きで取得
 * React.cache() により同一リクエスト内で重複排除
 */
export const getQuoteById = cache(async (id: number) => {
  const db = await getDb()
  const result = await db
    .select({
      quote: quotes,
      author: authors,
      subcategory: subcategories,
      category: categories,
    })
    .from(quotes)
    .innerJoin(authors, eq(quotes.authorId, authors.id))
    .innerJoin(subcategories, eq(quotes.subcategoryId, subcategories.id))
    .innerJoin(categories, eq(subcategories.categoryId, categories.id))
    .where(eq(quotes.id, id))
    .where(
      and(
        isNull(quotes.deletedAt),
        isNull(authors.deletedAt),
        isNull(subcategories.deletedAt),
        isNull(categories.deletedAt)
      )
    )
    .limit(1)

  if (!result[0]) return null

  return {
    ...result[0].quote,
    author: result[0].author,
    subcategory: {
      ...result[0].subcategory,
      category: result[0].category,
    },
  }
})

/**
 * 全名言を取得（詳細情報付き）
 * React.cache() により同一リクエスト内で重複排除
 */
export const getAllQuotes = cache(async () => {
  const db = await getDb()
  const result = await db
    .select({
      quote: quotes,
      author: authors,
      subcategory: subcategories,
      category: categories,
    })
    .from(quotes)
    .innerJoin(authors, eq(quotes.authorId, authors.id))
    .innerJoin(subcategories, eq(quotes.subcategoryId, subcategories.id))
    .innerJoin(categories, eq(subcategories.categoryId, categories.id))
    .where(
      and(
        isNull(quotes.deletedAt),
        isNull(authors.deletedAt),
        isNull(subcategories.deletedAt),
        isNull(categories.deletedAt)
      )
    )
    .orderBy(desc(quotes.createdAt))

  return result.map((row: typeof result[0]) => ({
    ...row.quote,
    author: row.author,
    subcategory: {
      ...row.subcategory,
      category: row.category,
    },
  }))
})

/**
 * 中項目IDで名言一覧を取得
 * React.cache() により同一リクエスト内で重複排除
 */
export const getQuotesBySubcategory = cache(async (subcategoryId: number) => {
  const db = await getDb()
  const result = await db
    .select({
      quote: quotes,
      author: authors,
      subcategory: subcategories,
      category: categories,
    })
    .from(quotes)
    .innerJoin(authors, eq(quotes.authorId, authors.id))
    .innerJoin(subcategories, eq(quotes.subcategoryId, subcategories.id))
    .innerJoin(categories, eq(subcategories.categoryId, categories.id))
    .where(eq(quotes.subcategoryId, subcategoryId))
    .where(
      and(
        isNull(quotes.deletedAt),
        isNull(authors.deletedAt),
        isNull(subcategories.deletedAt),
        isNull(categories.deletedAt)
      )
    )
    .orderBy(desc(quotes.createdAt))

  return result.map((row: typeof result[0]) => ({
    ...row.quote,
    author: row.author,
    subcategory: {
      ...row.subcategory,
      category: row.category,
    },
  }))
})

/**
 * 人物IDで名言一覧を取得
 * React.cache() により同一リクエスト内で重複排除
 */
export const getQuotesByAuthor = cache(async (authorId: number) => {
  const db = await getDb()
  const result = await db
    .select({
      quote: quotes,
      author: authors,
      subcategory: subcategories,
      category: categories,
    })
    .from(quotes)
    .innerJoin(authors, eq(quotes.authorId, authors.id))
    .innerJoin(subcategories, eq(quotes.subcategoryId, subcategories.id))
    .innerJoin(categories, eq(subcategories.categoryId, categories.id))
    .where(eq(quotes.authorId, authorId))
    .where(
      and(
        isNull(quotes.deletedAt),
        isNull(authors.deletedAt),
        isNull(subcategories.deletedAt),
        isNull(categories.deletedAt)
      )
    )
    .orderBy(desc(quotes.createdAt))

  return result.map((row: typeof result[0]) => ({
    ...row.quote,
    author: row.author,
    subcategory: {
      ...row.subcategory,
      category: row.category,
    },
  }))
})

/**
 * カテゴリIDで名言一覧を取得
 * React.cache() により同一リクエスト内で重複排除
 */
export const getQuotesByCategory = cache(async (categoryId: number) => {
  const db = await getDb()
  const result = await db
    .select({
      quote: quotes,
      author: authors,
      subcategory: subcategories,
      category: categories,
    })
    .from(quotes)
    .innerJoin(authors, eq(quotes.authorId, authors.id))
    .innerJoin(subcategories, eq(quotes.subcategoryId, subcategories.id))
    .innerJoin(categories, eq(subcategories.categoryId, categories.id))
    .where(eq(categories.id, categoryId))
    .where(
      and(
        isNull(quotes.deletedAt),
        isNull(authors.deletedAt),
        isNull(subcategories.deletedAt),
        isNull(categories.deletedAt)
      )
    )
    .orderBy(desc(quotes.createdAt))

  return result.map((row: typeof result[0]) => ({
    ...row.quote,
    author: row.author,
    subcategory: {
      ...row.subcategory,
      category: row.category,
    },
  }))
})

/**
 * 名言・作者名で検索
 * React.cache() により同一リクエスト内で重複排除
 */
export const searchQuotes = cache(async (query: string) => {
  const db = await getDb()
  const result = await db
    .select({
      quote: quotes,
      author: authors,
      subcategory: subcategories,
      category: categories,
    })
    .from(quotes)
    .innerJoin(authors, eq(quotes.authorId, authors.id))
    .innerJoin(subcategories, eq(quotes.subcategoryId, subcategories.id))
    .innerJoin(categories, eq(subcategories.categoryId, categories.id))
    .where(
      and(
        or(
          like(quotes.text, `%${query}%`),
          like(quotes.textJa, `%${query}%`),
          like(authors.name, `%${query}%`)
        ),
        isNull(quotes.deletedAt),
        isNull(authors.deletedAt),
        isNull(subcategories.deletedAt),
        isNull(categories.deletedAt)
      )
    )
    .orderBy(desc(quotes.createdAt))
    .limit(30)

  return result.map((row: typeof result[0]) => ({
    ...row.quote,
    author: row.author,
    subcategory: {
      ...row.subcategory,
      category: row.category,
    },
  }))
})

/**
 * ミューテーション系（cache不要）
 * Rule 7: Zod による Runtime Validation
 */

/**
 * 名言を作成
 * Zod validationで入力を検証
 */
export async function createQuote(data: unknown) {
  // Runtime validation
  const validated = CreateQuoteSchema.parse(data)

  const db = await getDb()
  const [quote] = await db.insert(quotes).values(validated).returning()

  return quote
}

/**
 * 名言を更新
 * Zod validationで入力を検証
 */
export async function updateQuote(id: number, data: unknown) {
  // Runtime validation
  const validated = UpdateQuoteSchema.parse(data)

  const db = await getDb()
  const [quote] = await db
    .update(quotes)
    .set({
      ...validated,
      updatedAt: new Date(),
    })
    .where(eq(quotes.id, id))
    .where(isNull(quotes.deletedAt))
    .returning()

  return quote || null
}

/**
 * 名言を削除（論理削除）
 */
export async function deleteQuote(id: number) {
  const db = await getDb()
  const [quote] = await db
    .update(quotes)
    .set({ deletedAt: new Date() })
    .where(eq(quotes.id, id))
    .returning()

  return quote || null
}
