import { and, eq, sql } from "drizzle-orm"
import { getDb } from "@/lib/db/client"
import { quotes, userQuoteInteractions } from "@/lib/db/schema"
import { selectPublishedQuotes } from "@/lib/data/quotes"

/**
 * 名言に「共感」を記録する
 *
 * - 同一ユーザー × 名言 × 種別 は UNIQUE 制約で1件のみ（冪等）
 * - 物理削除を行わない方針のため、共感は取り消し不可の「拍手」型とする
 *
 * @returns 記録後の共感数。名言が存在しない（非公開含む）場合は null
 */
export async function recordLike(
  userId: number,
  quoteId: number
): Promise<{ likeCount: number } | null> {
  const db = await getDb()

  const [quote] = await selectPublishedQuotes(db, eq(quotes.id, quoteId)).limit(1)
  if (!quote) return null

  await db
    .insert(userQuoteInteractions)
    .values({ userId, quoteId, interactionType: "like" })
    .onConflictDoNothing()

  const [{ count }] = await db
    .select({ count: sql<number>`count(*)`.mapWith(Number) })
    .from(userQuoteInteractions)
    .where(
      and(
        eq(userQuoteInteractions.quoteId, quoteId),
        eq(userQuoteInteractions.interactionType, "like")
      )
    )

  return { likeCount: count }
}
