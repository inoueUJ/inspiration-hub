import { cache } from "react"
import { asc, eq, isNull, sql } from "drizzle-orm"
import { getDb } from "@/lib/db/client"
import { dailyQuotes, quotes } from "@/lib/db/schema"
import { selectPublishedQuotes } from "@/lib/data/quotes"
import { getDateKey, hashString } from "@/lib/utils/date"
import type { DailyQuotesResult, QuoteDTO } from "@/types/quote"

/**
 * 1日に表示する名言の件数
 */
export const MAX_QUOTES_PER_DAY = 30

/**
 * 日替わり名言を取得（特定日）
 * React.cache() により同一リクエスト内で重複排除
 */
export const getDailyQuotes = cache(
  async (date: string = getDateKey()): Promise<QuoteDTO[]> => {
    const db = await getDb()
    return selectPublishedQuotes(db, eq(dailyQuotes.date, date))
      .innerJoin(dailyQuotes, eq(dailyQuotes.quoteId, quotes.id))
      .orderBy(asc(dailyQuotes.id))
      .limit(MAX_QUOTES_PER_DAY)
  }
)

/**
 * 日付をシードにした決定的なシャッフルで名言を選ぶ
 *
 * `ORDER BY RANDOM()` はリクエストごとに結果が変わってしまうため、
 * Cron 未実行の日でも「その日のあいだは同じ30件」になるよう線形合同の
 * ハッシュで並べ替える。
 */
const getSeededQuotes = cache(async (date: string): Promise<QuoteDTO[]> => {
  const seed = hashString(date) % 2_147_483_647
  const db = await getDb()
  return selectPublishedQuotes(db)
    .orderBy(sql`((${quotes.id} * 2654435761) + ${seed}) % 2147483647`)
    .limit(MAX_QUOTES_PER_DAY)
})

/**
 * 今日の名言30件を取得
 * Cron で生成済みならそれを、未生成なら日付シードのフォールバックを返す
 */
export const getTodayQuotes = cache(
  async (date: string = getDateKey()): Promise<DailyQuotesResult> => {
    const daily = await getDailyQuotes(date)
    if (daily.length > 0) {
      return { date, source: "daily", quotes: daily }
    }

    return { date, source: "fallback", quotes: await getSeededQuotes(date) }
  }
)

/**
 * 今日の名言の中から「今日の一言」を1件選ぶ（日付で決定的）
 */
export function pickFeaturedQuote(result: DailyQuotesResult): QuoteDTO | null {
  if (result.quotes.length === 0) return null
  return result.quotes[hashString(`featured:${result.date}`) % result.quotes.length]
}

/**
 * 日替わり名言が存在するか確認
 * React.cache() により同一リクエスト内で重複排除
 */
export const checkDailyQuotesExist = cache(async (date: string): Promise<boolean> => {
  const db = await getDb()
  const [result] = await db
    .select({ count: sql<number>`count(*)`.mapWith(Number) })
    .from(dailyQuotes)
    .where(eq(dailyQuotes.date, date))

  return result.count > 0
})

/**
 * ミューテーション系（cache不要）
 */

/**
 * 日替わり名言を生成（バッチ処理用）
 * daily_quotes は「その日の選定結果」を保持する派生テーブルのため、再生成時は入れ替える
 */
export async function generateDailyQuotes(date: string): Promise<number> {
  const db = await getDb()

  // ランダムに30件選定
  const randomQuotes = await db
    .select({ id: quotes.id })
    .from(quotes)
    .where(isNull(quotes.deletedAt))
    .orderBy(sql`RANDOM()`)
    .limit(MAX_QUOTES_PER_DAY)

  if (randomQuotes.length === 0) {
    return 0
  }

  // 既存のデータを入れ替え
  await db.delete(dailyQuotes).where(eq(dailyQuotes.date, date))
  await db
    .insert(dailyQuotes)
    .values(randomQuotes.map((quote) => ({ date, quoteId: quote.id })))

  return randomQuotes.length
}
