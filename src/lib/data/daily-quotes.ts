import { cache } from "react"
import { getDb } from "@/lib/db/client"
import {
  dailyQuotes,
  quotes,
  authors,
  subcategories,
  categories,
} from "@/lib/db/schema"
import { eq, isNull, sql, and } from "drizzle-orm"

/**
 * 日替わり名言を取得（特定日）
 * React.cache() により同一リクエスト内で重複排除
 */
export const getDailyQuotes = cache(async (date?: string) => {
  const db = await getDb()
  const targetDate = date || new Date().toISOString().split("T")[0]

  const result = await db
    .select({
      dailyQuote: dailyQuotes,
      quote: quotes,
      author: authors,
      subcategory: subcategories,
      category: categories,
    })
    .from(dailyQuotes)
    .innerJoin(quotes, eq(dailyQuotes.quoteId, quotes.id))
    .innerJoin(authors, eq(quotes.authorId, authors.id))
    .innerJoin(subcategories, eq(quotes.subcategoryId, subcategories.id))
    .innerJoin(categories, eq(subcategories.categoryId, categories.id))
    .where(eq(dailyQuotes.date, targetDate))
    .where(
      and(
        isNull(quotes.deletedAt),
        isNull(authors.deletedAt),
        isNull(subcategories.deletedAt),
        isNull(categories.deletedAt)
      )
    )

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
 * 日替わり名言が存在するか確認
 * React.cache() により同一リクエスト内で重複排除
 */
export const checkDailyQuotesExist = cache(async (date: string) => {
  const db = await getDb()
  const [result] = await db
    .select({ count: sql<number>`count(*)` })
    .from(dailyQuotes)
    .where(eq(dailyQuotes.date, date))

  return result.count > 0
})

/**
 * ミューテーション系（cache不要）
 */

/**
 * 日替わり名言を生成（バッチ処理用）
 */
export async function generateDailyQuotes(date: string) {
  const db = await getDb()
  // 既存のデータを削除
  await db.delete(dailyQuotes).where(eq(dailyQuotes.date, date))

  // ランダムに30件選定
  const randomQuotes = await db
    .select({ id: quotes.id })
    .from(quotes)
    .where(isNull(quotes.deletedAt))
    .orderBy(sql`RANDOM()`)
    .limit(30)

  if (randomQuotes.length === 0) {
    return 0
  }

  // daily_quotesに挿入
  const insertData = randomQuotes.map((q: typeof randomQuotes[0]) => ({
    date,
    quoteId: q.id,
  }))

  await db.insert(dailyQuotes).values(insertData)

  return insertData.length
}
