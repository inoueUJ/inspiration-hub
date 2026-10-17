"use server"

import { revalidatePath } from "next/cache"
import { z } from "zod"
import { ensureViewer } from "@/lib/data/viewer"
import { recordLike } from "@/lib/data/interactions"

export type LikeQuoteResult =
  | { ok: true; likeCount: number }
  | { ok: false; message: string }

const QuoteIdSchema = z.number().int().positive()

/**
 * 名言に「共感」する Server Action
 *
 * クライアントは useOptimistic で即座にハートを点灯させ、この Action の完了
 * （＝ revalidatePath による最新の RSC ペイロード到着）で確定値に置き換わる。
 * 失敗時は transition の終了とともに楽観的な状態が自動でロールバックされる。
 */
export async function likeQuoteAction(quoteId: number): Promise<LikeQuoteResult> {
  const parsed = QuoteIdSchema.safeParse(quoteId)
  if (!parsed.success) {
    return { ok: false, message: "不正なリクエストです" }
  }

  try {
    const userId = await ensureViewer()
    const result = await recordLike(userId, parsed.data)

    if (!result) {
      return { ok: false, message: "名言が見つかりませんでした" }
    }

    revalidatePath("/", "layout")
    return { ok: true, likeCount: result.likeCount }
  } catch (error) {
    console.error("likeQuoteAction failed:", error)
    return { ok: false, message: "共感の送信に失敗しました" }
  }
}
