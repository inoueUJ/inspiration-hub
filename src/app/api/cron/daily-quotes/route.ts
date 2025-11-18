import { NextRequest } from "next/server"
import { generateDailyQuotes } from "@/lib/db/queries/daily-quotes"
import { successResponse, errorResponse } from "@/lib/api/response"

/**
 * GET /api/cron/daily-quotes
 * 日替わり名言生成バッチ
 * Cloudflare Cron Triggerで毎日0時（UTC）に実行
 */
export async function GET(request: NextRequest) {
  try {
    // Cronシークレットで認証
    const authHeader = request.headers.get("authorization")
    const expectedAuth = `Bearer ${process.env.CRON_SECRET}`

    if (authHeader !== expectedAuth) {
      return errorResponse("UNAUTHORIZED", "認証に失敗しました", 401)
    }

    const today = new Date().toISOString().split("T")[0]
    const count = await generateDailyQuotes(today)

    return successResponse({
      message: `${count}件の日替わり名言を生成しました`,
      date: today,
      count,
    })
  } catch (error) {
    console.error("Daily quotes generation error:", error)
    return errorResponse(
      "INTERNAL_ERROR",
      "日替わり名言の生成に失敗しました"
    )
  }
}
