import { sql } from "drizzle-orm"
import type { SQLiteColumn } from "drizzle-orm/sqlite-core"
import { getDb } from "@/lib/db/client"
import { quoteSubmissions } from "@/lib/db/schema"
import type { QuoteSubmissionInput } from "@/lib/validators/submission"

/**
 * 投稿のレート制限（同一送信元あたり、windowStart 以降 maxSubmissions 件まで）
 */
export interface SubmissionQuota {
  windowStart: Date
  maxSubmissions: number
}

/**
 * 名言の投稿を作成する（status: pending、レート制限付き）
 *
 * 「直近の件数を数える → INSERT」を別々のクエリにすると、並列リクエストが同時に
 * 件数チェックを通過して上限を超えてしまう。
 * `INSERT ... SELECT ... WHERE (直近の件数) < 上限` の1文にまとめ、SQLite / D1 の
 * ステートメント単位の原子性で上限を保証する。
 *
 * @returns 作成した投稿のID。上限に達していた場合は null
 */
export async function createSubmissionWithinQuota(
  input: QuoteSubmissionInput,
  submitterIp: string,
  quota: SubmissionQuota
): Promise<{ id: number } | null> {
  const fields: [SQLiteColumn, string | null][] = [
    [quoteSubmissions.text, input.text],
    [quoteSubmissions.textJa, input.textJa ?? null],
    [quoteSubmissions.authorName, input.authorName],
    [quoteSubmissions.categoryName, input.categoryName ?? null],
    [quoteSubmissions.subcategoryName, input.subcategoryName ?? null],
    [quoteSubmissions.background, input.background ?? null],
    [quoteSubmissions.submitterName, input.submitterName ?? null],
    [quoteSubmissions.submitterEmail, input.submitterEmail ?? null],
    [quoteSubmissions.submitterIp, submitterIp],
  ]
  // created_at は unixepoch（秒）で保存されている
  const windowStartSeconds = Math.floor(quota.windowStart.getTime() / 1000)

  const db = await getDb()
  const rows = await db.all<{ id: number }>(sql`
    insert into ${quoteSubmissions} (${sql.join(
      fields.map(([column]) => sql.identifier(column.name)),
      sql`, `
    )})
    select ${sql.join(
      fields.map(([, value]) => sql`${value}`),
      sql`, `
    )}
    where (
      select count(*) from ${quoteSubmissions}
      where ${quoteSubmissions.submitterIp} = ${submitterIp}
        and ${quoteSubmissions.createdAt} >= ${windowStartSeconds}
    ) < ${quota.maxSubmissions}
    returning ${sql.identifier(quoteSubmissions.id.name)} as id
  `)

  return rows[0] ?? null
}
