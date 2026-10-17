import "server-only"
import { cache } from "react"
import { cookies } from "next/headers"
import { and, eq, isNull } from "drizzle-orm"
import { z } from "zod"
import { getDb } from "@/lib/db/client"
import { users, userQuoteInteractions } from "@/lib/db/schema"

/**
 * 匿名ビジター識別用 Cookie
 * ログイン不要で「共感」の重複防止と、将来の AI 推薦用データ収集に使う
 */
export const VISITOR_COOKIE = "ih_vid"
const VISITOR_COOKIE_MAX_AGE = 60 * 60 * 24 * 365

const VisitorIdSchema = z.uuid()

/**
 * Cookie からビジターIDを取得（改ざん・不正値は null 扱い）
 */
export const getVisitorId = cache(async (): Promise<string | null> => {
  const cookieStore = await cookies()
  const parsed = VisitorIdSchema.safeParse(cookieStore.get(VISITOR_COOKIE)?.value)
  return parsed.success ? parsed.data : null
})

/**
 * 閲覧者が「共感」した名言IDの一覧
 * Cookie が無い（初回訪問）場合は DB に問い合わせない
 */
export const getViewerLikedQuoteIds = cache(async (): Promise<number[]> => {
  const visitorId = await getVisitorId()
  if (!visitorId) return []

  const db = await getDb()
  const rows = await db
    .select({ quoteId: userQuoteInteractions.quoteId })
    .from(userQuoteInteractions)
    .innerJoin(users, eq(userQuoteInteractions.userId, users.id))
    .where(
      and(
        eq(users.userId, visitorId),
        isNull(users.deletedAt),
        eq(userQuoteInteractions.interactionType, "like")
      )
    )

  return rows.map((row) => row.quoteId)
})

/**
 * ビジターを確定させ、users テーブルの内部IDを返す
 * Cookie の書き込みを伴うため、Server Action / Route Handler からのみ呼び出すこと
 */
export async function ensureViewer(): Promise<number> {
  const cookieStore = await cookies()
  let visitorId = await getVisitorId()

  if (!visitorId) {
    visitorId = crypto.randomUUID()
    cookieStore.set(VISITOR_COOKIE, visitorId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: VISITOR_COOKIE_MAX_AGE,
      path: "/",
    })
  }

  const db = await getDb()
  const now = new Date()
  const [user] = await db
    .insert(users)
    .values({ userId: visitorId, lastActiveAt: now })
    .onConflictDoUpdate({ target: users.userId, set: { lastActiveAt: now } })
    .returning({ id: users.id })

  return user.id
}
