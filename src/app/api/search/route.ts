import { NextRequest } from "next/server"
import { searchQuotes } from "@/lib/db/queries/quotes"
import { successResponse, errorResponse } from "@/lib/api/response"

/**
 * GET /api/search
 * 名言・作者名検索
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const query = searchParams.get("q")

    if (!query || query.trim().length === 0) {
      return successResponse([])
    }

    if (query.length < 2) {
      return errorResponse(
        "VALIDATION_ERROR",
        "検索キーワードは2文字以上で入力してください"
      )
    }

    const results = await searchQuotes(query.trim())

    return successResponse(results)
  } catch (error) {
    console.error("Search API error:", error)
    return errorResponse("INTERNAL_ERROR", "検索に失敗しました")
  }
}

// キャッシング無効化（検索結果は常に最新）
export const revalidate = 0
