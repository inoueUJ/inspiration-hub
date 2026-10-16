import { cache } from "react"
import { and, desc, eq, inArray, isNull, ne, or, sql, type SQL } from "drizzle-orm"
import { getDb, type Database } from "@/lib/db/client"
import {
  quotes,
  authors,
  subcategories,
  categories,
  userQuoteInteractions,
} from "@/lib/db/schema"
import type { SQLiteColumn } from "drizzle-orm/sqlite-core"
import { CreateQuoteSchema, UpdateQuoteSchema } from "@/lib/validators/quote"
import type { QuoteDTO } from "@/types/quote"

/**
 * 1ページに表示する名言の上限
 */
export const MAX_QUOTES_PER_LIST = 60
export const MAX_SEARCH_RESULTS = 30

/**
 * 公開中の名言かどうか
 * 名言自体だけでなく、親（人物・中項目・カテゴリ）の論理削除も考慮する
 */
const isPublished = and(
  isNull(quotes.deletedAt),
  isNull(authors.deletedAt),
  isNull(subcategories.deletedAt),
  isNull(categories.deletedAt)
)

/**
 * 「共感」数（相関サブクエリ）
 * 一覧取得と同じ1クエリで集計し、N+1 を避ける
 */
const likeCount = sql<number>`(
  select count(*) from ${userQuoteInteractions}
  where ${userQuoteInteractions.quoteId} = ${quotes.id}
    and ${userQuoteInteractions.interactionType} = 'like'
)`.mapWith(Number)

/**
 * QuoteDTO の形をそのまま SELECT する
 * Drizzle のネストした select により、行 → DTO のマッピングが不要になる
 */
const quoteDTOSelection = {
  id: quotes.id,
  text: quotes.text,
  textJa: quotes.textJa,
  background: quotes.background,
  likeCount,
  author: { id: authors.id, name: authors.name },
  subcategory: { id: subcategories.id, name: subcategories.name },
  category: { id: categories.id, name: categories.name },
}

/**
 * 公開中の名言を DTO 形式で取得するクエリビルダー
 * `$dynamic()` で呼び出し側から orderBy / limit を合成できるようにする
 *
 * NOTE: Drizzle のクエリビルダーは thenable なので、async 関数から return すると
 * その場で `await` されてクエリが実行されてしまう。必ず同期関数で返すこと。
 */
export function selectPublishedQuotes(db: Database, where?: SQL) {
  return db
    .select(quoteDTOSelection)
    .from(quotes)
    .innerJoin(authors, eq(quotes.authorId, authors.id))
    .innerJoin(subcategories, eq(quotes.subcategoryId, subcategories.id))
    .innerJoin(categories, eq(subcategories.categoryId, categories.id))
    .where(and(isPublished, where))
    .$dynamic()
}

/**
 * LIKE 検索用にワイルドカード（% _）と エスケープ文字をエスケープ
 * 「100%」のような検索語がワイルドカードとして解釈されるのを防ぐ
 */
function toLikePattern(query: string): string {
  return `%${query.replace(/[\\%_]/g, (char) => `\\${char}`)}%`
}

function containsText(column: SQLiteColumn, query: string): SQL {
  return sql`${column} like ${toLikePattern(query)} escape '\\'`
}

/**
 * 名言をIDで取得
 * React.cache() により generateMetadata と page で同じクエリを共有する
 */
export const getQuoteById = cache(async (id: number): Promise<QuoteDTO | null> => {
  const db = await getDb()
  const [quote] = await selectPublishedQuotes(db, eq(quotes.id, id)).limit(1)
  return quote ?? null
})

/**
 * 複数IDの名言を取得（ブックマーク一覧用）
 * 返却順は引数の ids の順序を維持する
 */
export const getQuotesByIds = cache(
  async (ids: readonly number[]): Promise<QuoteDTO[]> => {
    if (ids.length === 0) return []

    const db = await getDb()
    const rows = await selectPublishedQuotes(db, inArray(quotes.id, [...ids]))
    const byId = new Map(rows.map((row) => [row.id, row]))

    return ids.flatMap((id) => byId.get(id) ?? [])
  }
)

/**
 * 最新の名言を取得
 */
export const getLatestQuotes = cache(
  async (limit: number = MAX_QUOTES_PER_LIST): Promise<QuoteDTO[]> => {
    const db = await getDb()
    return selectPublishedQuotes(db)
      .orderBy(desc(quotes.createdAt), desc(quotes.id))
      .limit(limit)
  }
)

/**
 * 中項目IDで名言一覧を取得
 */
export const getQuotesBySubcategory = cache(
  async (subcategoryId: number): Promise<QuoteDTO[]> => {
    const db = await getDb()
    return selectPublishedQuotes(db, eq(quotes.subcategoryId, subcategoryId))
      .orderBy(desc(quotes.createdAt), desc(quotes.id))
      .limit(MAX_QUOTES_PER_LIST)
  }
)

/**
 * 人物IDで名言一覧を取得
 */
export const getQuotesByAuthor = cache(
  async (authorId: number): Promise<QuoteDTO[]> => {
    const db = await getDb()
    return selectPublishedQuotes(db, eq(quotes.authorId, authorId))
      .orderBy(desc(quotes.createdAt), desc(quotes.id))
      .limit(MAX_QUOTES_PER_LIST)
  }
)

/**
 * カテゴリIDで名言一覧を取得
 */
export const getQuotesByCategory = cache(
  async (categoryId: number): Promise<QuoteDTO[]> => {
    const db = await getDb()
    return selectPublishedQuotes(db, eq(categories.id, categoryId))
      .orderBy(desc(quotes.createdAt), desc(quotes.id))
      .limit(MAX_QUOTES_PER_LIST)
  }
)

/**
 * 関連する名言を取得（同じ人物 → 同じ中項目の順に優先）
 * 名言詳細ページの「こちらもおすすめ」で使用
 *
 * cache() は引数を参照で比較するため、オブジェクトではなくプリミティブで受け取る
 */
export const getRelatedQuotes = cache(
  async (
    quoteId: number,
    authorId: number,
    subcategoryId: number,
    limit: number = 6
  ): Promise<QuoteDTO[]> => {
    const db = await getDb()
    return selectPublishedQuotes(
      db,
      and(
        ne(quotes.id, quoteId),
        or(
          eq(quotes.authorId, authorId),
          eq(quotes.subcategoryId, subcategoryId)
        )
      )
    )
      .orderBy(
        sql`case when ${quotes.authorId} = ${authorId} then 0 else 1 end`,
        desc(quotes.createdAt)
      )
      .limit(limit)
  }
)

/**
 * 名言・日本語訳・人物名・中項目名で検索
 */
export const searchQuotes = cache(async (query: string): Promise<QuoteDTO[]> => {
  const keyword = query.trim()
  if (keyword.length === 0) return []

  const db = await getDb()
  return selectPublishedQuotes(
    db,
    or(
      containsText(quotes.text, keyword),
      containsText(quotes.textJa, keyword),
      containsText(authors.name, keyword),
      containsText(subcategories.name, keyword)
    )
  )
    .orderBy(desc(quotes.createdAt), desc(quotes.id))
    .limit(MAX_SEARCH_RESULTS)
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
  const validated = UpdateQuoteSchema.parse(data)

  const db = await getDb()
  const [quote] = await db
    .update(quotes)
    .set({
      ...validated,
      updatedAt: new Date(),
    })
    .where(and(eq(quotes.id, id), isNull(quotes.deletedAt)))
    .returning()

  return quote ?? null
}

/**
 * 名言を削除（論理削除）
 */
export async function deleteQuote(id: number) {
  const db = await getDb()
  const [quote] = await db
    .update(quotes)
    .set({ deletedAt: new Date() })
    .where(and(eq(quotes.id, id), isNull(quotes.deletedAt)))
    .returning()

  return quote ?? null
}
