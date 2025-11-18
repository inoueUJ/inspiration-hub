import { NextRequest } from "next/server"
import { getDailyQuotes } from "@/lib/db/queries/daily-quotes"
import { successResponse, errorResponse } from "@/lib/api/response"

/**
 * GET /api/daily-quotes
 * 日替わり名言取得
 * クエリパラメータ: date (YYYY-MM-DD形式、省略時は今日)
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const date = searchParams.get("date") || undefined

    const quotes = await getDailyQuotes(date)

    return successResponse(quotes)
  } catch (error) {
    console.error("Daily quotes API error:", error)
    return errorResponse(
      "INTERNAL_ERROR",
      "日替わり名言の取得に失敗しました"
    )
  }
}

// 短時間キャッシュ（5分）
export const revalidate = 300
