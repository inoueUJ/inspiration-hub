import { NextRequest } from "next/server"
import { getQuotesByIds } from "@/lib/data/quotes"
import { successResponse, errorResponse } from "@/lib/api/response"
import { QuoteIdsParamSchema } from "@/lib/validators/quote"

/**
 * GET /api/quotes/lookup?ids=1,2,3
 * 複数IDの名言を公開用 DTO で一括取得（ブックマーク一覧用）
 */
export async function GET(request: NextRequest) {
  try {
    const parsed = QuoteIdsParamSchema.safeParse(
      request.nextUrl.searchParams.get("ids") ?? ""
    )

    if (!parsed.success) {
      return errorResponse(
        "VALIDATION_ERROR",
        parsed.error.issues[0]?.message ?? "idsの形式が正しくありません"
      )
    }

    const quotes = await getQuotesByIds(parsed.data)
    return successResponse(quotes)
  } catch (error) {
    console.error("Quote lookup API error:", error)
    return errorResponse("INTERNAL_ERROR", "名言の取得に失敗しました")
  }
}

export const dynamic = "force-dynamic"
