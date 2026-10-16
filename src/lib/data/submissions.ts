import { and, eq, gte, sql } from "drizzle-orm"
import { getDb } from "@/lib/db/client"
import { quoteSubmissions } from "@/lib/db/schema"
import type { QuoteSubmissionInput } from "@/lib/validators/submission"

/**
 * 指定時刻以降の同一IPハッシュからの投稿数
 * 簡易的なレートリミットに使用
 */
export async function countRecentSubmissions(
  submitterIp: string,
  since: Date
): Promise<number> {
  const db = await getDb()
  const [{ count }] = await db
    .select({ count: sql<number>`count(*)`.mapWith(Number) })
    .from(quoteSubmissions)
    .where(
      and(
        eq(quoteSubmissions.submitterIp, submitterIp),
        gte(quoteSubmissions.createdAt, since)
      )
    )

  return count
}

/**
 * 名言の投稿を作成（status: pending）
 */
export async function createSubmission(
  input: QuoteSubmissionInput,
  submitterIp: string
) {
  const db = await getDb()
  const [submission] = await db
    .insert(quoteSubmissions)
    .values({ ...input, submitterIp })
    .returning({ id: quoteSubmissions.id })

  return submission
}
